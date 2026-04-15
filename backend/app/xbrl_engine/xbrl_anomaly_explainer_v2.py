"""
XBRL Anomaly Explainer with Business Rules - Enhanced Version
==============================================================

Détection d'anomalies XBRL improved avec:
1. Couche de règles métier EBA/XBRL AVANT détection statistique
2. Classification: VRAIE_ANOMALIE / LIGNE_RARE_VALIDE / FAUX_POSITIF
3. Explications contextualisées par type d'anomalie
"""

import argparse
import io
import json
import re
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

import numpy as np
import pandas as pd

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except Exception as exc:
    raise ImportError(
        "This script requires scikit-learn. Install with: pip install scikit-learn"
    ) from exc

# Importer le moteur de règles EBA/XBRL
try:
    from .eba_xbrl_rules_engine import EBAXBRLRulesEngine, RuleViolationType
except ImportError as e:
    print(f"Warning: Could not import eba_xbrl_rules_engine: {e}")
    print("Continuing without business rules layer...")
    EBAXBRLRulesEngine = None
    RuleViolationType = None


CONTEXT_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_\-.]*$")


class AnomalyClassification:
    """Classification des anomalies détectées"""
    BUSINESS_VIOLATION = "BUSINESS_VIOLATION"  # Violation de règles métier EBA
    VALID_RARE = "VALID_RARE"  # Valide mais statistiquement atypique
    VALID_NORMAL = "VALID_NORMAL"  # Valide et normal statistiquement
    UNKNOWN = "UNKNOWN"  # Classification indéterminée


CLASSIFICATION_LABELS = {
    AnomalyClassification.BUSINESS_VIOLATION: "Règle métier non respectée",
    AnomalyClassification.VALID_RARE: "Ligne valide mais rare",
    AnomalyClassification.VALID_NORMAL: "Ligne normale",
    AnomalyClassification.UNKNOWN: "Cas indéterminé",
}


RULE_LABELS = {
    "missing_unitref": "unitRef obligatoire absent pour un fait numérique",
    "invalid_unitref": "unitRef hors domaine attendu",
    "missing_contextref": "contextRef obligatoire absent",
    "invalid_contextref": "contextRef au format inhabituel",
    "invalid_decimals": "format decimals invalide ou improbable",
    "tag_type_mismatch": "type de tag incohérent avec la valeur fournie",
    "non_numeric_value": "valeur textuelle inattendue pour un fait numérique",
    "unknown_tag": "tag non reconnu par les règles métier",
    "formula_not_respected": "formule EBA non respectée",
    "none": "aucune règle métier violée",
}


RULE_ACTIONS = {
    "missing_unitref": "Ajouter un unitRef valide pour chaque fait numérique, par exemple uEUR, uUSD ou uPURE selon la nature de la valeur.",
    "invalid_unitref": "Vérifier que l'unité suit le format EBA/XBRL attendu et qu'elle correspond bien à la mesure portée par le tag.",
    "missing_contextref": "Rattacher le fait à un contexte XBRL valide décrivant l'entité et la période de reporting.",
    "invalid_contextref": "Normaliser l'identifiant de contexte pour qu'il respecte les conventions XBRL utilisées dans le rapport.",
    "invalid_decimals": "Corriger decimals pour utiliser un entier valide ou INF lorsque la précision n'est pas arrondie.",
    "tag_type_mismatch": "Contrôler la taxonomie et le type attendu du tag avant soumission.",
    "non_numeric_value": "Remplacer la valeur par un nombre si le tag est quantitatif, sinon revoir le mapping du tag.",
    "unknown_tag": "Vérifier que le tag appartient bien à la taxonomie EBA/XBRL ciblée.",
    "formula_not_respected": "Vérifier la relation de calcul EBA attendue (totaux, sous-composants, ratios) et corriger les faits source avant resoumission.",
    "none": "Aucune correction métier immédiate n'est requise.",
}


EBA_FORMULA_CATALOG = {
    "v0172_m": {
        "template": "C 01.00",
        "formula": "{r0020} = {r0030} + {r0130} + {r0180} + {r0200} + {r0210} + {r0220} + {r0230} + {r0240} + {r0250} + {r0300} + {r0340} + {r0370} + {r0380} + {r0390} + {r0430} + {r0440} + {r0450} + {r0460} + {r0470} + {r0471} + {r0472} + {r0480} + {r0490} + {r0500} + {r0510} + {r0513} + {r0514} + {r0515} + {r0520} + {r0524} + {r0529}",
        "lhs": ("r0020", None),
        "rhs": [
            ("r0030", None), ("r0130", None), ("r0180", None), ("r0200", None), ("r0210", None),
            ("r0220", None), ("r0230", None), ("r0240", None), ("r0250", None), ("r0300", None),
            ("r0340", None), ("r0370", None), ("r0380", None), ("r0390", None), ("r0430", None),
            ("r0440", None), ("r0450", None), ("r0460", None), ("r0470", None), ("r0471", None),
            ("r0472", None), ("r0480", None), ("r0490", None), ("r0500", None), ("r0510", None),
            ("r0513", None), ("r0514", None), ("r0515", None), ("r0520", None), ("r0524", None),
            ("r0529", None),
        ],
    },
    "v0173_m": {
        "template": "C 01.00",
        "formula": "{r0030, c0010} = {r0040, c0010} + {r0060, c0010} + {r0070, c0010} + {r0092, c0010}",
        "lhs": ("r0030", "c0010"),
        "rhs": [("r0040", "c0010"), ("r0060", "c0010"), ("r0070", "c0010"), ("r0092", "c0010")],
    },
}


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    lookup = {str(c).strip().lower(): c for c in df.columns}
    for cand in candidates:
        if cand in lookup:
            return lookup[cand]
    return None


def _to_float_or_none(value: Any) -> float | None:
    num = pd.to_numeric(pd.Series([value]), errors="coerce").iloc[0]
    if pd.isna(num):
        return None
    return float(num)


def _normalize_formula_ids(text: str) -> list[str]:
    raw = str(text or "")
    parts = re.split(r"[;,|]", raw)
    out: list[str] = []
    for part in parts:
        code = part.strip().lower()
        if code:
            out.append(code)
    return out


def _fmt_num(value: float | None) -> str:
    if value is None:
        return "N/A"
    return f"{value:.6f}".rstrip("0").rstrip(".")


def _build_formula_violation_detail(df: pd.DataFrame, idx: Any, formula_id: str) -> str:
    spec = EBA_FORMULA_CATALOG.get(formula_id)
    if not spec:
        return formula_id

    row_col = _find_col(df, ["row", "rows", "line", "r"])
    column_col = _find_col(df, ["column", "columns", "col", "c"])
    template_col = _find_col(df, ["template", "t1", "sheet", "table"])
    context_col = _find_col(df, ["contextref", "context", "context_id"])
    value_col = _find_col(df, ["factvalue", "value", "amount"])
    if value_col is None:
        return f"{formula_id}: {spec['formula']}"

    current_context = ""
    if context_col is not None:
        current_context = str(df.at[idx, context_col]).strip()

    def _norm_col_code(code: str | None) -> str:
        cleaned = str(code or "").strip().lower().replace(" ", "")
        if cleaned.startswith("c") and cleaned[1:].isdigit():
            cleaned = cleaned[1:]
        if cleaned.isdigit():
            return str(int(cleaned))
        return cleaned

    def _lookup_value(row_code: str, col_code: str | None) -> float | None:
        mask = pd.Series([True] * len(df), index=df.index)

        if template_col is not None and str(spec.get("template", "")).strip() != "":
            mask = mask & (df[template_col].astype(str).str.strip().str.upper() == str(spec["template"]).strip().upper())
        if row_col is not None:
            mask = mask & (df[row_col].astype(str).str.strip().str.lower() == row_code.strip().lower())
        if column_col is not None and col_code is not None:
            mask = mask & (
                df[column_col]
                .astype(str)
                .str.strip()
                .str.lower()
                .str.replace(" ", "", regex=False)
                == _norm_col_code(col_code)
            )
        if context_col is not None and current_context:
            mask = mask & (df[context_col].astype(str).str.strip() == current_context)

        matches = df.loc[mask]
        if matches.empty:
            return None
        return _to_float_or_none(matches.iloc[0][value_col])

    lhs_row, lhs_col = spec["lhs"]
    lhs_val = _lookup_value(lhs_row, lhs_col)

    rhs_vals: list[tuple[str, float | None]] = []
    for rhs_row, rhs_col in spec["rhs"]:
        rhs_vals.append((rhs_row, _lookup_value(rhs_row, rhs_col)))

    rhs_sum = sum(v for _, v in rhs_vals if v is not None)
    if any(v is None for _, v in rhs_vals):
        missing = [r for r, v in rhs_vals if v is None]
        return (
            f"{formula_id} non respectée: {spec['formula']} | "
            f"Valeurs manquantes pour {', '.join(missing)}"
        )

    if lhs_val is None:
        return (
            f"{formula_id} non respectée: {spec['formula']} | "
            f"Valeur LHS manquante pour {lhs_row}"
        )

    delta = lhs_val - rhs_sum
    rhs_terms = " + ".join(f"{code}={_fmt_num(val)}" for code, val in rhs_vals)
    return (
        f"{formula_id} non respectée: {spec['formula']} | "
        f"LHS {lhs_row}={_fmt_num(lhs_val)} ; RHS {rhs_terms} ; "
        f"somme RHS={_fmt_num(rhs_sum)} ; écart={_fmt_num(delta)}"
    )


def _extract_formula_ids_from_texts(*texts: Any) -> list[str]:
    ids: list[str] = []
    seen: set[str] = set()

    for text in texts:
        raw = str(text or "")
        for part in _normalize_formula_ids(raw):
            if re.fullmatch(r"v\d{4}_m", part) and part not in seen:
                seen.add(part)
                ids.append(part)
        for match in re.findall(r"v\d{4}_m", raw.lower()):
            if match not in seen:
                seen.add(match)
                ids.append(match)

    return ids


def _numeric_close(left: float, right: float, rel_tol: float = 0.01, abs_tol: float = 1.0) -> bool:
    scale = max(abs(left), abs(right), 1.0)
    return abs(left - right) <= max(abs_tol, rel_tol * scale)


def apply_formula_rules(df: pd.DataFrame) -> pd.DataFrame:
    """
    Appliquer des contrôles de formules EBA directement sur les datapoints.

    Règle implémentée (heuristique robuste pour templates C_xxx_yyy):
    - Si un bloc contient les suffixes 010, 020, 030 alors on attend une relation
      additive cohérente (ex: 010 = 020 + 030, ou variante équivalente).
    """
    out = df.copy()
    out["formula_violation"] = False
    out["formula_violation_code"] = "none"
    out["formula_violation_message"] = ""

    datapoint_col = "datapoint" if "datapoint" in out.columns else None
    value_col = "factValue" if "factValue" in out.columns else None
    if value_col is None:
        for col in out.columns:
            if "value" in col.lower():
                value_col = col
                break

    if datapoint_col is None or value_col is None:
        return out

    numeric_values = pd.to_numeric(out[value_col], errors="coerce")
    if numeric_values.notna().sum() == 0:
        return out

    # Respecter un éventuel statut de validation fourni dans certains templates.
    if "validation_status" in out.columns:
        invalid_mask = out["validation_status"].astype(str).str.strip().str.lower().ne("valid")
        if invalid_mask.any():
            out.loc[invalid_mask, "formula_violation"] = True
            out.loc[invalid_mask, "formula_violation_code"] = "formula_not_respected"
            if "violated_rule" in out.columns:
                for idx in out.index[invalid_mask]:
                    violated_raw = str(out.at[idx, "violated_rule"]).strip()
                    formula_ids = _normalize_formula_ids(violated_raw)
                    if formula_ids:
                        details = [_build_formula_violation_detail(out, idx, fid) for fid in formula_ids]
                        out.at[idx, "formula_violation_message"] = " | ".join(details)
                    else:
                        out.at[idx, "formula_violation_message"] = "règle de calcul template non respectée"
            else:
                out.loc[invalid_mask, "formula_violation_message"] = "règle de calcul template non respectée"

    pattern = re.compile(r"^[A-Za-z]+_(\d{3})_(\d{3})$")
    match_df = out[datapoint_col].astype(str).str.extract(pattern)
    out["_formula_block"] = match_df[0]
    out["_formula_suffix"] = match_df[1]
    out["_formula_value"] = numeric_values

    group_cols = ["_formula_block"]
    if "contextRef" in out.columns:
        group_cols.append("contextRef")

    candidate_mask = out["_formula_block"].notna() & out["_formula_value"].notna()
    candidates = out[candidate_mask]
    if candidates.empty:
        out.drop(columns=["_formula_block", "_formula_suffix", "_formula_value"], inplace=True, errors="ignore")
        return out

    for _, grp in candidates.groupby(group_cols, dropna=False):
        suffixes = set(grp["_formula_suffix"].tolist())
        if not {"010", "020", "030"}.issubset(suffixes):
            continue

        val_010 = grp.loc[grp["_formula_suffix"] == "010", "_formula_value"].iloc[0]
        val_020 = grp.loc[grp["_formula_suffix"] == "020", "_formula_value"].iloc[0]
        val_030 = grp.loc[grp["_formula_suffix"] == "030", "_formula_value"].iloc[0]

        respected = (
            _numeric_close(val_010, val_020 + val_030)
            or _numeric_close(val_030, val_010 - val_020)
            or _numeric_close(val_020, val_010 - val_030)
        )

        if not respected:
            idxs = grp[grp["_formula_suffix"].isin(["010", "020", "030"])].index
            message = (
                "Formule additive non respectée pour le bloc "
                f"{grp['_formula_block'].iloc[0]}: "
                f"010={val_010}, 020={val_020}, 030={val_030}"
            )
            out.loc[idxs, "formula_violation"] = True
            out.loc[idxs, "formula_violation_code"] = "formula_not_respected"
            out.loc[idxs, "formula_violation_message"] = message

    out.drop(columns=["_formula_block", "_formula_suffix", "_formula_value"], inplace=True, errors="ignore")
    return out


@dataclass
class KBItem:
    question: str
    answer: str
    company: str
    year: str


class KBRetriever:
    def __init__(self, items: list[KBItem]) -> None:
        self.items = items
        self.vectorizer: TfidfVectorizer | None = None
        self.matrix = None

        if not items:
            return

        docs = [
            f"{it.question} {it.answer} {it.company} {it.year}".strip()
            for it in items
        ]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        self.matrix = self.vectorizer.fit_transform(docs)

    def search(self, query: str, top_k: int = 2) -> list[KBItem]:
        if not self.items or self.vectorizer is None or self.matrix is None:
            return []

        q_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(q_vec, self.matrix).ravel()
        idx = np.argsort(scores)[::-1][:top_k]
        return [self.items[int(i)] for i in idx if scores[int(i)] > 0]


def load_xbrl_dataframe(file_path: Path) -> pd.DataFrame:
    """Charger un fichier XBRL/CSV/XLSX/XML"""
    name = file_path.name.lower()
    raw = file_path.read_bytes()

    if name.endswith(".csv"):
        for enc in ("utf-8", "latin-1", "cp1252"):
            try:
                return pd.read_csv(io.BytesIO(raw), encoding=enc)
            except Exception:
                continue
        raise ValueError(f"Could not read CSV: {file_path}")

    if name.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(raw))

    if name.endswith(".zip"):
        with zipfile.ZipFile(io.BytesIO(raw)) as zf:
            csv_names = [n for n in zf.namelist() if n.lower().endswith(".csv")]
            if not csv_names:
                raise ValueError("ZIP does not contain a CSV file")
            with zf.open(csv_names[0]) as f:
                return pd.read_csv(f)

    if name.endswith((".xml", ".xbrl", ".ixbrl")):
        root = ET.fromstring(raw)
        rows: list[dict[str, Any]] = []
        for elem in root.iter():
            rows.append(
                {
                    "tag": elem.tag,
                    "contextRef": elem.attrib.get("contextRef", ""),
                    "unitRef": elem.attrib.get("unitRef", ""),
                    "decimals": elem.attrib.get("decimals", ""),
                    "factValue": (elem.text or "").strip(),
                }
            )
        if not rows:
            raise ValueError("No XML facts found")
        return pd.DataFrame(rows)

    raise ValueError(f"Unsupported file format: {file_path.suffix}")


def load_kb(kb_dir: Path) -> KBRetriever:
    """Charger la knowledge base"""
    kb_files = [
        kb_dir / "xbrl_formula_train.csv",
        kb_dir / "xbrl_tags_train.csv",
        kb_dir / "xbrl_formula_calculations_train.csv",
    ]

    items: list[KBItem] = []
    for f in kb_files:
        if not f.exists():
            continue
        try:
            df = pd.read_csv(f)
        except Exception:
            continue

        expected = {"input", "output", "company", "year"}
        if not expected.issubset(set(df.columns)):
            continue

        for _, row in df.head(2000).iterrows():
            items.append(
                KBItem(
                    question=str(row.get("input", "")),
                    answer=str(row.get("output", "")),
                    company=str(row.get("company", "")),
                    year=str(row.get("year", "")),
                )
            )

    return KBRetriever(items)


def get_local_tag_name(tag: Any) -> str:
    text = str(tag or "")
    if "}" in text:
        return text.split("}", 1)[1]
    if ":" in text:
        return text.split(":", 1)[1]
    return text


def build_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Construire les features pour IsolationForest"""
    feat = pd.DataFrame(index=df.index)

    s_context = df.get("contextRef", pd.Series([""] * len(df), index=df.index)).astype(str)
    s_unit = df.get("unitRef", pd.Series([""] * len(df), index=df.index)).astype(str)
    s_decimals = df.get("decimals", pd.Series([""] * len(df), index=df.index)).astype(str)

    if "factValue" in df.columns:
        s_value = pd.to_numeric(df["factValue"], errors="coerce")
    else:
        numeric_candidates = []
        for col in df.columns:
            cand = pd.to_numeric(df[col], errors="coerce")
            if cand.notna().mean() > 0.6:
                numeric_candidates.append(cand)
        s_value = numeric_candidates[0] if numeric_candidates else pd.Series(np.nan, index=df.index)

    feat["missing_context"] = (s_context.str.strip() == "").astype(int)
    feat["missing_unit"] = (s_unit.str.strip() == "").astype(int)
    feat["bad_context_format"] = (~s_context.str.match(CONTEXT_PATTERN) & (s_context.str.strip() != "")).astype(int)

    feat["context_len"] = s_context.str.len().fillna(0)
    feat["unit_len"] = s_unit.str.len().fillna(0)

    ctx_freq = s_context.value_counts(dropna=False)
    feat["context_freq"] = s_context.map(ctx_freq).fillna(0)

    unit_freq = s_unit.value_counts(dropna=False)
    feat["unit_freq"] = s_unit.map(unit_freq).fillna(0)

    dec_num = pd.to_numeric(s_decimals, errors="coerce")
    feat["decimals_num"] = dec_num.fillna(0)

    feat["value_num"] = s_value.fillna(0)
    feat["value_missing"] = s_value.isna().astype(int)

    abs_val = s_value.abs()
    median = np.nanmedian(abs_val)
    mad = np.nanmedian(np.abs(abs_val - median))
    if np.isnan(mad) or mad == 0:
        robust_z = pd.Series(0.0, index=df.index)
    else:
        robust_z = (abs_val - median) / (1.4826 * mad)
    feat["value_robust_z"] = robust_z.fillna(0)

    return feat


def apply_business_rules(df: pd.DataFrame) -> pd.DataFrame:
    """
    Appliquer les règles métier EBA/XBRL avant la détection statistique
    
    Retourne le dataframe augmenté avec colonnes:
    - business_rule_violation (type de violation)
    - violation_severity (critical, warning, info)
    - violation_message (message détaillé)
    - is_structural (True si tag structurel XML à ignorer)
    """
    # Appliquer d'abord les règles de formule EBA (indépendantes du moteur de tags)
    df = apply_formula_rules(df)

    if EBAXBRLRulesEngine is None:
        # Si le moteur n'est pas disponible, retourner avec colonnes vides
        df['business_rule_violation'] = 'none'
        df['violation_severity'] = 'none'
        df['violation_message'] = 'no_business_rules_available'
        df['is_structural'] = False
        formula_mask = df.get("formula_violation", pd.Series([False] * len(df), index=df.index)) == True
        if formula_mask.any():
            df.loc[formula_mask, 'business_rule_violation'] = 'formula_not_respected'
            df.loc[formula_mask, 'violation_severity'] = 'critical'
            df.loc[formula_mask, 'violation_message'] = df.loc[formula_mask, 'formula_violation_message'].replace('', 'formule EBA non respectée')
        return df
    
    engine = EBAXBRLRulesEngine()
    
    violations = {
        'business_rule_violation': [],
        'violation_severity': [],
        'violation_message': [],
        'is_structural': [],
    }
    
    # Identifier les colonnes
    tag_col = None
    context_col = None
    unit_col = None
    decimals_col = None
    value_col = None
    
    for col in df.columns:
        col_lower = col.lower()
        if 'tag' in col_lower:
            tag_col = col
        elif 'context' in col_lower:
            context_col = col
        elif 'unit' in col_lower:
            unit_col = col
        elif 'decimal' in col_lower:
            decimals_col = col
        elif 'factvalue' in col_lower or 'value' in col_lower:
            value_col = col
    
    # Appliquer les règles à chaque fait
    for idx, row in df.iterrows():
        tag = row[tag_col] if tag_col else None
        context_ref = row[context_col] if context_col else None
        unit_ref = row[unit_col] if unit_col else None
        decimals = row[decimals_col] if decimals_col else None
        fact_value = row[value_col] if value_col else None
        
        try:
            result = engine.validate_fact(tag, context_ref, unit_ref, decimals, fact_value)
            violations['business_rule_violation'].append(result.violation_type.value)
            violations['violation_severity'].append(result.severity)
            violations['violation_message'].append(result.message)
            # Marquer si tag structurel (contextRef manquant ET statut is_structural)
            is_str = ('structural' in result.message.lower())
            violations['is_structural'].append(is_str)
        except Exception as e:
            violations['business_rule_violation'].append('error')
            violations['violation_severity'].append('warning')
            violations['violation_message'].append(f"Error during validation: {str(e)}")
            violations['is_structural'].append(False)
    
    for col, values in violations.items():
        df[col] = values

    # Les violations de formule doivent primer sur les signaux de structure/statistique.
    formula_mask = df.get("formula_violation", pd.Series([False] * len(df), index=df.index)) == True
    if formula_mask.any():
        df.loc[formula_mask, 'business_rule_violation'] = 'formula_not_respected'
        df.loc[formula_mask, 'violation_severity'] = 'critical'
        df.loc[formula_mask, 'violation_message'] = df.loc[formula_mask, 'formula_violation_message'].replace('', 'formule EBA non respectée')
    
    return df


def detect_anomalies(df: pd.DataFrame, contamination: float = 0.1) -> pd.DataFrame:
    """Détecter les anomalies avec IsolationForest"""
    feat = build_feature_frame(df)
    model = IsolationForest(
        n_estimators=300,
        contamination=contamination,
        random_state=42,
    )

    pred = model.fit_predict(feat)
    scores = -model.score_samples(feat)

    out = df.copy()
    out["anomaly_label"] = np.where(pred == -1, "ANOMALY", "NORMAL")
    out["anomaly_score"] = scores

    threshold = np.quantile(scores, 1.0 - contamination)
    out["anomaly_threshold"] = threshold

    return out


def classify_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """
    Classifier les anomalies en trois catégories:
    1. BUSINESS_VIOLATION: Violation des règles métier EBA/XBRL
    2. VALID_RARE: Valide selon règles métier, mais statistiquement atypique
    3. VALID_NORMAL: Valide et normal
    """
    classifications = []
    
    for idx, row in df.iterrows():
        # Vérifier si violation de règles métier
        business_violation = str(row.get('business_rule_violation', 'none')).lower()
        violation_severity = str(row.get('violation_severity', 'info')).lower()
        is_anomaly = str(row.get('anomaly_label', 'NORMAL')).upper() == 'ANOMALY'
        
        if business_violation != 'none' and violation_severity == 'critical':
            # Violation critique de règles métier
            classification = AnomalyClassification.BUSINESS_VIOLATION
        elif is_anomaly and business_violation == 'none':
            # Valide mais statistiquement rare
            classification = AnomalyClassification.VALID_RARE
        else:
            # Valide et normal
            classification = AnomalyClassification.VALID_NORMAL
        
        classifications.append(classification)
    
    df['anomaly_classification'] = classifications
    return df


def build_rule_reasons(row: pd.Series) -> list[str]:
    """Construire les raisons d'anomalie"""
    reasons: list[str] = []

    context = str(row.get("contextRef", "")).strip()
    unit = str(row.get("unitRef", "")).strip()
    
    # Raisons des règles métier
    violation_msg = str(row.get('violation_message', '')).lower()
    if 'missing' in violation_msg or 'invalid' in violation_msg:
        reasons.append(violation_msg)

    if context == "":
        if "missing_contextref" not in violation_msg:
            reasons.append("contextRef manquant")
    elif not CONTEXT_PATTERN.match(context):
        if "invalid_contextref" not in violation_msg:
            reasons.append("contextRef non standard (espaces/caracteres speciaux)")

    if unit == "":
        if "missing_unitref" not in violation_msg and "missing" not in violation_msg:
            reasons.append("unitRef manquant")

    try:
        score = float(row.get("anomaly_score", 0.0))
        threshold = float(row.get("anomaly_threshold", 0.0))
        if score >= threshold:
            reasons.append("profil statistique atypique selon IsolationForest")
    except Exception:
        pass

    value = pd.to_numeric(pd.Series([row.get("factValue", np.nan)]), errors="coerce").iloc[0]
    if pd.notna(value) and abs(float(value)) > 1e9:
        reasons.append("valeur numerique tres elevee (outlier potentiel)")

    if not reasons:
        classification = str(row.get('anomaly_classification', 'UNKNOWN'))
        if classification == AnomalyClassification.VALID_RARE:
            reasons.append("Combinaison de caractéristiques rare mais potentiellement valide")
        elif classification == AnomalyClassification.BUSINESS_VIOLATION:
            reasons.append("Violation détectée par les règles métier EBA/XBRL")
        else:
            reasons.append("anomalie detectee par combinaison de signaux faibles")

    return reasons


def build_ai_explanation_payload(row: pd.Series, kb: KBRetriever) -> dict[str, str]:
    classification = str(row.get("anomaly_classification", AnomalyClassification.UNKNOWN))
    rule_code = str(row.get("business_rule_violation", "none")).lower()
    rule_label = RULE_LABELS.get(rule_code, "règle métier à confirmer")
    tag_name = get_local_tag_name(row.get("tag", ""))
    if not tag_name:
        tag_name = str(row.get("row", "")).strip() or str(row.get("datapoint", "")).strip() or "N/A"
    context = str(row.get("contextRef", "")).strip() or "absent"
    unit = str(row.get("unitRef", "")).strip() or "absent"
    value = str(row.get("factValue", "")).strip() or "vide"
    severity = str(row.get("violation_severity", "info")).lower()
    reasons = build_rule_reasons(row)

    query = " ; ".join(reasons + [f"tag {tag_name}", f"context {context}", f"unit {unit}"])
    hits = kb.search(query, top_k=1)

    if classification == AnomalyClassification.BUSINESS_VIOLATION:
        title = f"Règle non respectée sur {tag_name}"
        summary = (
            f"Le fait {tag_name} viole la règle métier '{rule_label}'. "
            f"Le système considère donc cette ligne comme une anomalie certaine à corriger."
        )
        impact = "Risque de rejet réglementaire ou d'incohérence fonctionnelle dans le rapport XBRL."
        confidence = "élevée"
    elif classification == AnomalyClassification.VALID_RARE:
        title = f"Ligne rare à vérifier sur {tag_name}"
        summary = (
            f"Le fait {tag_name} respecte les règles métier connues, mais son profil statistique est atypique "
            f"par rapport aux autres faits du fichier."
        )
        impact = "Risque modéré: la ligne peut être correcte, mais elle mérite une revue métier ciblée."
        confidence = "moyenne"
    else:
        title = f"Ligne normale sur {tag_name}"
        summary = f"Le fait {tag_name} ne présente pas de signal métier ni statistique nécessitant une action immédiate."
        impact = "Pas d'impact identifié à ce stade."
        confidence = "élevée"

    action = RULE_ACTIONS.get(rule_code, "Revoir le mapping métier et la taxonomie EBA appliquée à cette ligne.")
    why_flagged = "; ".join(reasons)
    formula_detail = ""
    formula_expected = ""
    formula_ids = _extract_formula_ids_from_texts(row.get("violated_rule", ""), row.get("violation_message", ""))
    if rule_code == "formula_not_respected":
        formula_detail = str(row.get("violation_message", "")).strip()
        expected_parts = []
        for fid in formula_ids:
            spec = EBA_FORMULA_CATALOG.get(fid)
            if spec:
                expected_parts.append(f"{fid}: {spec['formula']}")
            else:
                expected_parts.append(fid)
        formula_expected = " | ".join(expected_parts)
    reference = ""
    if hits:
        hit = hits[0]
        reference = f"Contexte voisin dans la base: {hit.company} {hit.year} | {hit.answer[:140]}"

    return {
        "ai_title": title,
        "ai_summary": summary,
        "ai_rule_code": rule_code,
        "ai_rule_label": rule_label,
        "ai_classification_label": CLASSIFICATION_LABELS.get(classification, classification),
        "ai_why_flagged": why_flagged,
        "ai_impact": impact,
        "ai_recommended_action": action,
        "ai_confidence": confidence,
        "ai_formula_detail": formula_detail,
        "ai_formula_expected": formula_expected,
        "ai_fact_snapshot": f"tag={tag_name} | contextRef={context} | unitRef={unit} | factValue={value} | severity={severity}",
        "ai_reference": reference,
    }


def explain_anomaly_with_ai(row: pd.Series, kb: KBRetriever) -> str:
    """Générer une explication IA contextualisée"""
    payload = build_ai_explanation_payload(row, kb)
    parts = [
        f"[{payload['ai_classification_label']}] {payload['ai_summary']}",
        f"Règle: {payload['ai_rule_label']}.",
        (
            f"Formule exacte à respecter: {payload['ai_formula_expected']}."
            if payload.get("ai_formula_expected")
            else ""
        ),
        (
            f"Comment la formule est violée: {payload['ai_formula_detail']}."
            if payload.get("ai_formula_detail")
            else ""
        ),
        (
            "Explication: la valeur de gauche (LHS) doit être égale à la somme/calcul de droite (RHS). "
            "Si l'écart est non nul, la règle EBA est violée et la ligne doit être corrigée."
            if payload.get("ai_formula_detail")
            else ""
        ),
        f"Pourquoi cette ligne est signalée: {payload['ai_why_flagged']}.",
        f"Impact: {payload['ai_impact']}",
        f"Action recommandée: {payload['ai_recommended_action']}",
    ]
    parts = [p for p in parts if p]
    if payload["ai_reference"]:
        parts.append(payload["ai_reference"])
    return " ".join(parts)


def enrich_anomalies_with_ai(anomalies: pd.DataFrame, kb: KBRetriever) -> pd.DataFrame:
    if anomalies.empty:
        return anomalies

    payloads = anomalies.apply(lambda row: build_ai_explanation_payload(row, kb), axis=1)
    payload_df = pd.DataFrame(list(payloads), index=anomalies.index)
    out = anomalies.join(payload_df)
    out["ai_explanation"] = out.apply(lambda row: explain_anomaly_with_ai(row, kb), axis=1)
    return out


def analyze_xbrl_dataframe(df: pd.DataFrame, kb_dir: Path, contamination: float = 0.1) -> dict[str, Any]:
    if df.empty:
        raise ValueError("Input dataframe is empty")

    prepared = apply_business_rules(df.copy())
    structural_mask = prepared.get("is_structural", pd.Series([False] * len(prepared), index=prepared.index)) == True
    df_structural = prepared[structural_mask].copy()
    df_facts = prepared[~structural_mask].copy()

    if df_facts.empty:
        raise ValueError("No non-structural XBRL facts found to analyze")

    kb = load_kb(kb_dir)
    scored = detect_anomalies(df_facts, contamination=contamination)
    scored = classify_anomalies(scored)

    anomalies = scored[
        (scored["anomaly_classification"] == AnomalyClassification.BUSINESS_VIOLATION)
        | (scored["anomaly_classification"] == AnomalyClassification.VALID_RARE)
    ].copy()
    anomalies = enrich_anomalies_with_ai(anomalies, kb)

    total_rows = len(scored)
    violations_count = int((scored["anomaly_classification"] == AnomalyClassification.BUSINESS_VIOLATION).sum())
    rare_count = int((scored["anomaly_classification"] == AnomalyClassification.VALID_RARE).sum())
    normal_count = int((scored["anomaly_classification"] == AnomalyClassification.VALID_NORMAL).sum())
    formula_violations_count = int((scored.get("business_rule_violation", pd.Series([], dtype=str)) == "formula_not_respected").sum())

    summary = {
        "rows_total": int(len(prepared)),
        "rows_facts_analyzed": int(total_rows),
        "structural_elements_excluded": int(len(df_structural)),
        "anomalies_reported": int(len(anomalies)),
        "business_violations_count": violations_count,
        "formula_violations_count": formula_violations_count,
        "valid_rare_count": rare_count,
        "valid_normal_count": normal_count,
        "false_positives_filtered": normal_count,
        "anomaly_ratio_before_filtering": float(len(scored[scored["anomaly_label"] == "ANOMALY"]) / max(1, total_rows)),
        "anomaly_ratio_after_filtering": float(len(anomalies) / max(1, total_rows)),
        "kb_items_loaded": int(len(kb.items)),
        "processing_method": "EBA/XBRL Business Rules + IsolationForest",
    }

    return {
        "summary": summary,
        "prepared": prepared,
        "scored": scored,
        "anomalies": anomalies,
        "kb": kb,
    }


def run_pipeline(input_file: Path, kb_dir: Path, output_dir: Path, contamination: float) -> dict[str, Any]:
    """Exécuter le pipeline complet d'anomalies amélioré"""
    output_dir.mkdir(parents=True, exist_ok=True)

    df = load_xbrl_dataframe(input_file)
    analysis = analyze_xbrl_dataframe(df, kb_dir=kb_dir, contamination=contamination)
    anomalies = analysis["anomalies"]
    summary = dict(analysis["summary"])

    base = input_file.stem
    csv_out = output_dir / f"{base}_anomalies_explained_v2.csv"
    json_out = output_dir / f"{base}_anomalies_summary_v2.json"

    anomalies.to_csv(csv_out, index=False)
    summary["input_file"] = str(input_file)
    summary["output_csv"] = str(csv_out)
    json_out.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    return {
        "summary": summary,
        "anomalies": anomalies,
        "json_out": str(json_out),
        "scored": analysis["scored"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Detect XBRL anomalies with EBA business rules and generate AI-style explanations"
    )
    parser.add_argument("--input", required=True, help="Input XBRL/CSV/XLSX/XML file path")
    parser.add_argument(
        "--kb-dir",
        default="INPUT/data",
        help="Directory containing xbrl_*_train.csv knowledge files",
    )
    parser.add_argument(
        "--output-dir",
        default="OUTPUT/anomaly_reports",
        help="Directory for output reports",
    )
    parser.add_argument(
        "--contamination",
        type=float,
        default=0.1,
        help="Expected anomaly rate for IsolationForest (0.01-0.5)",
    )

    args = parser.parse_args()

    result = run_pipeline(
        input_file=Path(args.input),
        kb_dir=Path(args.kb_dir),
        output_dir=Path(args.output_dir),
        contamination=max(0.01, min(0.5, args.contamination)),
    )

    s = result["summary"]
    print("=" * 80)
    print("XBRL Anomaly Detection + EBA Business Rules Report")
    print("=" * 80)
    print(f"Input file:              {s['input_file']}")
    print(f"Rows total:              {s['rows_total']}")
    print(f"Business violations:     {s['business_violations_count']}")
    print(f"Valid but rare:          {s['valid_rare_count']}")
    print(f"Valid and normal:        {s['valid_normal_count']} (filtered as false positives)")
    print(f"Anomalies reported:      {s['anomalies_reported']}")
    print(f"  - Before filtering:    {s['rows_total'] * s['anomaly_ratio_before_filtering']:.0f} ({s['anomaly_ratio_before_filtering']:.2%})")
    print(f"  - After filtering:     {s['anomalies_reported']} ({s['anomaly_ratio_after_filtering']:.2%})")
    print(f"False positives removed: {s['false_positives_filtered']}")
    print(f"KB items loaded:         {s['kb_items_loaded']}")
    print(f"CSV output:              {s['output_csv']}")
    print(f"Summary JSON:            {result['json_out']}")
    print("=" * 80)


if __name__ == "__main__":
    main()
