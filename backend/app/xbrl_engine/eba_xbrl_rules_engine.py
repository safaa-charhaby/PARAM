"""
EBA/XBRL Business Rules Engine
==============================

Couche de règles métier pour la validation XBRL avant la détection statistique d'anomalies.
Distingue entre: vraie anomalie / ligne normale mais rare / faux positif
"""

import pandas as pd
import re
from typing import Dict, List, Tuple, Optional
from enum import Enum
from dataclasses import dataclass


class RuleViolationType(Enum):
    """Types de violations de règles métier"""
    NONE = "none"  # Pas de violation
    MISSING_UNITREF = "missing_unitref"
    INVALID_UNITREF = "invalid_unitref"
    MISSING_CONTEXTREF = "missing_contextref"
    INVALID_CONTEXTREF = "invalid_contextref"
    MISSING_DECIMALS = "missing_decimals"
    INVALID_DECIMALS = "invalid_decimals"
    NON_NUMERIC_VALUE = "non_numeric_value"
    TAG_TYPE_MISMATCH = "tag_type_mismatch"
    UNKNOWN_TAG = "unknown_tag"


@dataclass
class ValidationResult:
    """Résultat de validation d'un fait XBRL"""
    is_violation: bool
    violation_type: RuleViolationType
    severity: str  # 'critical', 'warning', 'info'
    message: str
    should_skip_statistical_detection: bool


class EBAXBRLRulesEngine:
    """
    Moteur de règles métier EBA/XBRL
    
    Règles:
    1. Tags non-numériques (filingIndicator, etc.) n'ont pas besoin de unitRef
    2. Tags numériques DOIVENT avoir unitRef et contextRef
    3. Contexte doit suivre format EBA (périodes, entités)
    4. Units doivent être dans domaine valide (EUR, USD, PURE, etc.)
    5. Décimales doivent être non-négatives et cohérentes
    """
    
    # Tags XBRL d'infrastructure structurelle (jamais des faits financiers)
    # Éléments définis dans les spécifications XBRL 2.1 et les namespaces standards
    STRUCTURAL_TAGS = {
        # XBRL instance document root and structure
        'xbrl',
        'schemaref',
        # XBRL context elements
        'context',
        'entity',
        'identifier',
        'segment',
        'period',
        'instant',
        'startdate',
        'enddate',
        'forever',
        'scenario',
        # XBRL unit elements
        'unit',
        'measure',
        'divide',
        'unitnumerator',
        'unitdenominator',
        # XBRL dimensional elements
        'explicitmember',
        'typedmember',
        # EBA filing indicators container (not the indicator itself)
        'findicators',
        # XBRL linkbase / taxonomy elements
        'linkbaseref',
        'roleref',
        'arcroleref',
    }
    
    # Tags connus comme non-numériques (facts financiers mais de type texte/enum/date)
    NON_NUMERIC_TAGS = {
        'filingindicator',
        'documenttype', 
        'documenttypeother',
        'documentperiodenddate',
        'filer',
        'auditorname',
        'preparername',
        'typeofreportingentity',
        'submissiontype',
        'amisreporting',
        'reportingentityname',
        'submissionpriority',
        'datesofcompletionactualsummary',
        'dateofapproval',
        'auditoropinion',
        'reportingentitytype',
        'reportperiod',
        'reportingdate',
        'submissionpreparedby',
        'amendmentreason',
        # Tags EBA/XBRL typiques non-numériques
        'lei',
        'schemename',
        'isin',
        'country',
        'currency',
        'entityname',
        'reportingrole',
    }
    
    # Units valides en EBA/XBRL
    VALID_UNITS = {
        'EUR',      # Euro
        'USD',      # Dollar US
        'GBP',      # Livre sterling
        'JPY',      # Yen
        'CHF',      # Franc suisse
        'SEK',      # Couronne suédoise
        'DKK',      # Couronne danoise
        'NOK',      # Couronne norvégienne
        'CZK',      # Couronne tchèque
        'PLN',      # Zloty polonais
        'HUF',      # Forint hongrois
        'RON',      # Leu roumain
        'BGN',      # Lev bulgare
        'HRK',      # Kuna croate
        'PURE',     # Nombre pur (pourcentages, ratios)
        'PURE-1',   # Per thousand
        'PURE-2',   # Per hundred (pourcentages)
        'PURE-3',   # Per ten thousand
        'PURE-4',   # Per million
        'SHARES',   # Nombre d'actions
        'SHARES-1', # Actions en milliers
        'SHARES-2', # Actions en millions
    }
    
    # Patterns de contextRef valides
    CONTEXTREF_PATTERNS = [
        r'^[a-zA-Z0-9_\-]+$',  # Identifiant simple
        r'^\w+_\d{4}-\d{2}-\d{2}$',  # Format date: entity_YYYY-MM-DD
        r'^D\d{8}$',  # Format date: DYYYYMMDD
        r'^D\d{4}Q\d$',  # Format trimestre: DYYYYQN
    ]
    
    def __init__(self):
        """Initialiser le moteur de règles"""
        self.tag_metadata = self._build_tag_metadata()
        
    def _build_tag_metadata(self) -> Dict:
        """
        Construire métadonnées sur les tags XBRL
        
        Returns:
            Dict avec {tag_local_name -> {properties}}
        """
        metadata = {}
        
        # Tags structurels - ne sont pas des faits financiers
        for tag in self.STRUCTURAL_TAGS:
            metadata[tag.lower()] = {
                'is_numeric': False,
                'is_structural': True,  # Élément structurel, ignorer
                'requires_unitref': False,
                'requires_contextref': False,
                'requires_decimals': False,
                'type': 'structural'
            }
        
        # Tags de faits non-numériques
        for tag in self.NON_NUMERIC_TAGS:
            metadata[tag.lower()] = {
                'is_numeric': False,
                'is_structural': False,
                'requires_unitref': False,
                'requires_contextref': True,
                'requires_decimals': False,
                'type': 'non_numeric'
            }
        
        return metadata
    
    def extract_tag_local_name(self, tag: str) -> str:
        """
        Extraire le nom local d'un tag XBRL
        
        Exemples:
        - {http://www.eurofiling.info/xbrl/ext/filing-indicators}filingIndicator -> filingIndicator
        - us-gaap:Assets -> Assets
        - ifrs-full:Assets -> Assets
        """
        if '}' in tag:
            # Format: {namespace}localname
            return tag.split('}')[1].lower()
        elif ':' in tag:
            # Format: prefix:localname
            return tag.split(':')[1].lower()
        else:
            return tag.lower()
    
    def is_numeric_tag(self, tag: str) -> bool:
        """Déterminer si un tag est numériquement valué"""
        local_name = self.extract_tag_local_name(tag)
        
        # Vérifier dans les métadonnées
        if local_name in self.tag_metadata:
            return self.tag_metadata[local_name]['is_numeric']
        
        # Heuristiques: la plupart des tags sont numériques
        # Les tags non-numériques connus ont des patternsspécifiques
        if any(pattern in local_name.lower() for pattern in 
               ['indicator', 'type', 'name', 'date', 'id', 'code', 'approval', 'opinion']):
            # Pourrait être non-numérique, mais par défaut numérique
            return True
        
        return True  # Par défaut: numérique
    
    def validate_fact(self, tag: str, context_ref: Optional[str], 
                     unit_ref: Optional[str], decimals: Optional[str], 
                     fact_value: Optional[str]) -> ValidationResult:
        """
        Valider un fait XBRL contre les règles métier EBA/XBRL
        
        Args:
            tag: Tag XBRL (avec namespace)
            context_ref: Context ID (peut être None/NaN)
            unit_ref: Unit ID (peut être None/NaN)
            decimals: Décimales (peut être None/NaN)
            fact_value: Valeur du fait
            
        Returns:
            ValidationResult avec diagnostic
        """
        # Normaliser les entrées
        context_ref = None if pd.isna(context_ref) else str(context_ref).strip() or None
        unit_ref = None if pd.isna(unit_ref) else str(unit_ref).strip() or None
        decimals = None if pd.isna(decimals) else str(decimals).strip() or None
        fact_value = None if pd.isna(fact_value) else str(fact_value).strip() or None
        
        local_tag = self.extract_tag_local_name(tag)
        
        # === RÈGLE 0: Tags structurels XBRL ===
        # Éléments comme <xbrl>, <context>, <unit>, <period> ne sont pas des faits
        if local_tag in self.STRUCTURAL_TAGS:
            return ValidationResult(
                is_violation=False,
                violation_type=RuleViolationType.NONE,
                severity='info',
                message=f"Structural XBRL element '{local_tag}' - not a financial fact",
                should_skip_statistical_detection=True  # Ne pas inclure dans la détection stat
            )
        
        # === DÉTERMINER LE TYPE DU FAIT ===
        # Un fait est non-numérique si:
        # 1. Son tag est dans NON_NUMERIC_TAGS
        # 2. Sa valeur factValue contient du texte non-numérique (enum/reference)
        is_numeric = self.is_numeric_tag(tag)
        
        # Si la valeur est texte non-numérique (comme eba_qSC:qx9, true, false)
        # alors le fait est de type non-numérique, pas besoin de unitRef
        if fact_value:
            if self._is_text_value(fact_value):
                is_numeric = False
        
        # === RÈGLE 1: Tags non-numériques ===
        # Ne pas valider les requirements numériques
        if not is_numeric:
            # Les tags non-numériques peuvent ne pas avoir unitRef/decimals
            if not context_ref:
                return ValidationResult(
                    is_violation=True,
                    violation_type=RuleViolationType.MISSING_CONTEXTREF,
                    severity='critical',
                    message=f"Non-numeric tag '{local_tag}' missing contextRef",
                    should_skip_statistical_detection=True
                )
            return ValidationResult(
                is_violation=False,
                violation_type=RuleViolationType.NONE,
                severity='info',
                message=f"Non-numeric tag '{local_tag}' is valid",
                should_skip_statistical_detection=False
            )
        
        # === RÈGLE 2: Tags numériques ===
        violations = []
        
        # Vérifier contextRef
        if not context_ref:
            violations.append((
                RuleViolationType.MISSING_CONTEXTREF,
                'critical',
                f"Numeric tag '{local_tag}' missing required contextRef"
            ))
        elif not self._validate_context_format(context_ref):
            violations.append((
                RuleViolationType.INVALID_CONTEXTREF,
                'warning',
                f"Context '{context_ref}' format suspicious (may be valid rare case)"
            ))
        
        # Vérifier unitRef
        if not unit_ref:
            violations.append((
                RuleViolationType.MISSING_UNITREF,
                'critical',
                f"Numeric tag '{local_tag}' missing required unitRef"
            ))
        elif not self._validate_unit_ref(unit_ref):
            violations.append((
                RuleViolationType.INVALID_UNITREF,
                'warning',
                f"Unit '{unit_ref}' not in standard domain (may be custom)"
            ))
        
        # Vérifier decimals
        # IMPORTANT: En XBRL/EBA, les décimales négatives sont valides et standards
        # decimals=-3 = valeur en milliers (multiplier par 10^3)
        # decimals=-6 = valeur en millions  
        # decimals=0 = valeur exacte (euros)
        # INF = valeur exacte non arrondie
        # Violation uniquement si format invalide
        if decimals is not None and decimals != 'INF' and decimals != 'inf':
            try:
                dec_val = int(decimals)
                # Les décimales négatives sont valides en XBRL!
                # Seule violation: valeur hors plage extreme (ex: -30 = facteur 10^30)
                if abs(dec_val) > 20:
                    violations.append((
                        RuleViolationType.INVALID_DECIMALS,
                        'warning',
                        f"Decimals out of normal range: {dec_val} (exceeds ±20)"
                    ))
            except (ValueError, TypeError):
                if decimals not in ('INF', 'inf'):
                    violations.append((
                        RuleViolationType.INVALID_DECIMALS,
                        'warning',
                        f"Decimals invalid format: '{decimals}'"
                    ))
        
        # Retourner le premier violation critique, ou premier warning
        if violations:
            vtype, severity, msg = violations[0]
            return ValidationResult(
                is_violation=True,
                violation_type=vtype,
                severity=severity,
                message=msg,
                should_skip_statistical_detection=(severity == 'critical')
            )
        
        # Pas de violations
        return ValidationResult(
            is_violation=False,
            violation_type=RuleViolationType.NONE,
            severity='info',
            message="Valid XBRL fact",
            should_skip_statistical_detection=False
        )
    
    def _is_text_value(self, value: str) -> bool:
        """
        Déterminer si une valeur est textuelle (non-numérique).
        
        Les valeurs textuelles dans XBRL EBA incluent:
        - Références dimensionnelles: eba_qSC:qx9, eba_qAS:qx2004
        - Valeurs booléennes: true, false
        - Identifiants LEI: DUMMYLEI123456789012
        - Codes ISO: eba_qRP:qx2011
        - Dates: 2026-12-31
        """
        if not value:
            return False
        
        # Essayer de parser comme nombre
        try:
            float(value.replace(',', '.'))
            return False  # C'est numérique
        except (ValueError, AttributeError):
            pass
        
        # Valeurs booléennes
        if value.lower() in ('true', 'false', 'yes', 'no'):
            return True
        
        # Dates (YYYY-MM-DD)
        if re.match(r'^\d{4}-\d{2}-\d{2}$', value):
            return True
        
        # Références dimensionnelles EBA (contenant :)
        if ':' in value:
            return True
        
        # Codes LEI ou identifiants alphanumériques longs
        if re.match(r'^[A-Z0-9]{15,}$', value.upper()):
            return True
        
        # Valeurs textuelles contenant des lettres (non-numériques)
        if re.search(r'[a-zA-Z]', value):
            return True
        
        return False
    
    def _validate_context_format(self, context_ref: str) -> bool:
        """Valider le format du contextRef"""
        if not context_ref:
            return False
        
        # Vérifier si correspond à un pattern connu
        for pattern in self.CONTEXTREF_PATTERNS:
            if re.match(pattern, context_ref):
                return True
        
        # Format très court = probablement valide mais rare
        if len(context_ref) < 3:
            return False
        
        # Format alterne avec caractères courants
        return True
    
    def _validate_unit_ref(self, unit_ref: str) -> bool:
        """Valider l'unitRef"""
        if not unit_ref:
            return False
        
        unit_upper = unit_ref.upper()
        unit_no_prefix = unit_upper.lstrip('U')  # Format EBA: uEUR -> EUR, uPURE -> PURE
        
        # Format EBA standard: uEUR, uPURE, uUSD, etc. (préfixe 'u' + code ISO)
        if unit_ref.startswith('u') and len(unit_ref) > 1:
            eba_code = unit_ref[1:].upper()  # Retirer le 'u' préfixe EBA
            if eba_code in self.VALID_UNITS:
                return True
            # Patterns comme uPURE-N, uSHARES-N
            if re.match(r'^(PURE|SHARES)(-\d+)?$', eba_code):
                return True
            # Devises ISO 3-lettres (uEUR, uUSD, uGBP...)
            if len(eba_code) == 3 and eba_code.isalpha():
                return True
        
        # Format standard (sans préfixe)
        if unit_upper in self.VALID_UNITS:
            return True
        
        # Codes ISO courants (EUR, USD, etc.) mêmes en minuscules
        if unit_upper.replace('-', '_') in self.VALID_UNITS:
            return True
        
        # Codes 3-lettres (probablement devises)
        if len(unit_upper) == 3 and unit_upper.isalpha():
            return True  # Probablement une devise
        
        # Patterns comme PURE-N, SHARES-N
        if re.match(r'^(PURE|SHARES)(-\d+)?$', unit_upper):
            return True
        
        # Format iso4217:EUR
        if ':' in unit_ref:
            parts = unit_ref.split(':')
            if len(parts) == 2 and parts[1].upper() in self.VALID_UNITS:
                return True
            # Codes ISO 3-lettres dans iso4217:XXX
            if len(parts) == 2 and len(parts[1]) == 3 and parts[1].isalpha():
                return True
        
        # Custom units = non valide mais pas une violation critique
        return False


def classify_anomaly(dataframe: pd.DataFrame, rules_engine: EBAXBRLRulesEngine) -> pd.DataFrame:
    """
    Classifier les anomalies en fonction des règles métier
    
    Ajoute des colonnes:
    - business_rule_violation: Type de violation (ou 'none')
    - violation_severity: 'critical', 'warning', 'info'
    - should_filter_from_stats: Si True, skip la détection statistique
    
    Args:
        dataframe: DataFrame avec colonnes XBRL (tag, contextRef, unitRef, decimals, value)
        rules_engine: Instance du moteur de règles
        
    Returns:
        DataFrame avec colonnes additionnelles de classification
    """
    
    results = {
        'business_rule_violation': [],
        'violation_severity': [],
        'violation_message': [],
        'should_filter_from_stats': [],
    }
    
    # Mapper les noms de colonnes possibles
    tag_col = None
    context_col = None
    unit_col = None
    decimals_col = None
    value_col = None
    
    for col in dataframe.columns:
        col_lower = col.lower()
        if 'tag' in col_lower or col == 'Unnamed: 0':
            tag_col = col
        elif 'context' in col_lower:
            context_col = col
        elif 'unit' in col_lower:
            unit_col = col
        elif 'decimal' in col_lower:
            decimals_col = col
        elif 'value' in col_lower or 'fact' in col_lower:
            value_col = col
    
    # Itérer sur les lignes
    for idx, row in dataframe.iterrows():
        tag = row[tag_col] if tag_col else None
        context_ref = row[context_col] if context_col else None
        unit_ref = row[unit_col] if unit_col else None
        decimals = row[decimals_col] if decimals_col else None
        fact_value = row[value_col] if value_col else None
        
        # Valider
        result = rules_engine.validate_fact(tag, context_ref, unit_ref, decimals, fact_value)
        
        results['business_rule_violation'].append(result.violation_type.value)
        results['violation_severity'].append(result.severity)
        results['violation_message'].append(result.message)
        results['should_filter_from_stats'].append(result.should_skip_statistical_detection)
    
    # Ajouter au dataframe
    for col, values in results.items():
        dataframe[col] = values
    
    return dataframe


# Test
if __name__ == "__main__":
    engine = EBAXBRLRulesEngine()
    
    # Test 1: filingIndicator sans unitRef (doit être OK car non-numérique)
    result1 = engine.validate_fact(
        "{http://www.eurofiling.info/xbrl/ext/filing-indicators}filingIndicator",
        "c1",
        None,  # unitRef
        None,
        "Q_09.01"
    )
    print(f"Test 1 (filingIndicator sans unitRef): {result1.violation_type.value}")
    print(f"  -> Should skip: {result1.should_skip_statistical_detection}")
    print()
    
    # Test 2: Tag numérique sans unitRef (doit être violation)
    result2 = engine.validate_fact(
        "ifrs-full:Assets",
        "c1",
        None,  # unitRef
        None,
        "1000000"
    )
    print(f"Test 2 (Assets sans unitRef): {result2.violation_type.value}")
    print(f"  -> Should skip: {result2.should_skip_statistical_detection}")
    print()
    
    # Test 3: Tag numérique avec unitRef valide
    result3 = engine.validate_fact(
        "ifrs-full:Assets",
        "c1",
        "EUR",
        "0",
        "1000000"
    )
    print(f"Test 3 (Assets avec EUR): {result3.violation_type.value}")
    print(f"  -> Should skip: {result3.should_skip_statistical_detection}")
