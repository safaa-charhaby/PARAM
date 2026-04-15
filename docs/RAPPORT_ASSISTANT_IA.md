# Rapport Technique - Assistant IA ParamIQ

## 1. Objectif
L'assistant IA aide l'utilisateur a:
- comprendre un concept EBA/DPM
- expliquer une anomalie detectee
- obtenir des recommandations de correction

## 2. Architecture fonctionnelle
### 2.1 Entree utilisateur
- Frontend: page AIAssistant.tsx
- Requete API: POST /api/chat
- Payload principal:
  - text: question utilisateur
  - lang: fr ou en
  - context: contexte facultatif (anomalie, validation, etc.)

### 2.2 Moteur de retrieval
1. Recherche semantique (prioritaire)
- Modele: paraphrase-multilingual-mpnet-base-v2
- Index: knowledge_base.pkl
- Mecanisme: embedding question + semantic_search top-k

2. Fallback lexical (degrade)
- Active si modele semantique ou embeddings indisponibles
- Mecanisme: intersection de tokens question/documents
- Avantage: l'assistant continue a fonctionner meme sans GPU/modele charge

### 2.3 Generation de reponse
- Nettoyage du texte de connaissance (suppression de prefixes techniques)
- Reponse bilingue FR/EN
- Conseils contextuels si la question contient erreur/null/fix/anomalie

### 2.4 Sortie API
- response: texte de reponse
- retrieval_mode: semantic ou lexical
- matches: top resultats (score, source, code)

## 3. Integration avec la validation XBRL
- La page Validation conserve une anomalie cle (titre, detail, resume IA).
- Cette anomalie est transmise a l'assistant (localStorage -> prompt auto).
- L'utilisateur obtient une explication immediate sans ressaisir le contexte.

## 4. Robustesse et ameliorations apportees
- Suppression des chemins absolus machine-specific.
- Support variable d'environnement PARAMIQ_KB_INDEX.
- Gestion mode degrade propre si knowledge base absente.
- Meilleure contextualisation des messages de correction.

## 5. Limites actuelles
- Reponses basees retrieval + templates, pas de LLM generatif externe.
- Qualite depend de la couverture de knowledge_base.pkl.
- Pas encore de scoring explicite de confiance expose a l'UI.

## 6. Roadmap recommandee
1. Versionner et enrichir la knowledge base (metadonnees DPM, tags EBA).
2. Ajouter historique persistant des conversations (chat_collection).
3. Ajouter une evaluation qualitative automatique (jeu de questions tests).
4. Introduire un reranker pour augmenter la precision top-1.

## 7. Flux de fonctionnement (resume)
1. L'utilisateur pose une question ou ouvre depuis une anomalie.
2. Le frontend appelle /api/chat avec text + lang + context.
3. Le backend cherche d'abord semantiquement, sinon lexicalement.
4. Le backend formate une reponse metier exploitable.
5. Le frontend affiche la reponse dans le fil de discussion.
