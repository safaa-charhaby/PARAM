# Cahier des Charges - ParamIQ Unified Platform

## 1. Contexte
Le projet vise a unifier:
- le systeme ParamIQ (frontend React + backend FastAPI)
- le pack d'analyse XBRL (moteur de regles EBA + detection d'anomalies)

Objectif: disposer d'une seule plateforme de validation XBRL, explication IA et assistance metier.

## 2. Objectifs du projet
- Centraliser les fonctionnalites de validation, detection et explication IA.
- Fournir une interface unique pour charger un fichier XBRL/CSV/XLSX/XML.
- Offrir des explications IA actionnables pour corriger les anomalies.
- Maintenir un socle evolutif pour integration future (DPM, taxonomies, reporting reglementaire).

## 3. Perimetre fonctionnel
### 3.1 Validation et analyse
- Upload de fichiers: csv, xlsx, xls, xml, xbrl, ixbrl, zip.
- Analyse EBA/XBRL avec:
  - regles metier (unitRef, contextRef, decimals, coherence tag/valeur)
  - detection statistique (IsolationForest)
  - classification des cas:
    - BUSINESS_VIOLATION
    - VALID_RARE
    - VALID_NORMAL

### 3.2 Assistant IA
- Chat bilingue FR/EN.
- Recherche semantique dans la base de connaissance (Sentence-BERT).
- Fallback lexical si modele semantique indisponible.
- Prise en compte d'un contexte d'anomalie transmis depuis la page Validation.

### 3.3 Restitution
- Score de conformite.
- Nombre d'erreurs critiques et warnings.
- Liste des anomalies priorisees et explicables par IA.

## 4. Exigences non fonctionnelles
- API REST FastAPI sous route /api.
- Architecture modulaire (backend/app/xbrl_engine).
- Parametrage par variables d'environnement (index IA).
- Gestion des erreurs utilisateur et erreurs techniques.
- CORS actif pour communication frontend/backend.

## 5. Contraintes techniques
- Backend: Python, FastAPI, pandas, scikit-learn, sentence-transformers.
- Frontend: React + TypeScript.
- Stockage: MongoDB (mappings/chats) + fichiers knowledge base.
- Dependency upload FastAPI: python-multipart.

## 6. Livrables
- Code fusionne dans un projet unique: PFE_SBS.
- API d'analyse XBRL: POST /api/xbrl/analyze.
- API assistant IA amelioree: POST /api/chat.
- Documentation:
  - Cahier des charges (ce document)
  - Rapport general
  - Rapport technique Assistant IA

## 7. Critere d'acceptation
- Le projet contient en un seul repo ParamIQ + engine PACK.
- Un fichier peut etre charge depuis l'UI Validation et etre analyse via l'API.
- L'assistant repond en FR/EN et exploite le contexte d'anomalie.
- Les diagrammes UML sont accessibles dans docs/diagrams.

## 8. Risques et mitigation
- Risque: indisponibilite du modele ou index IA.
  - Mitigation: fallback lexical et message degrade propre.
- Risque: environnement non prepare (npm/python deps).
  - Mitigation: checklist d'installation dans rapport general.
- Risque: faux positifs statistiques.
  - Mitigation: couche de regles metier avant classification finale.
