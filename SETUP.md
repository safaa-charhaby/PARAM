# 🚀 Guide d'installation du projet PFE_SBS

Ce guide explique comment installer et lancer le projet sur un nouveau PC, sans le `.venv`.

---

## 📋 Prérequis

Avant de commencer, assure-toi d'avoir installé :

- **Python 3.11+** → https://www.python.org/downloads/
  - ⚠️ Cocher "Add Python to PATH" lors de l'installation
- **Node.js 18+** → https://nodejs.org/
- **MongoDB** (local ou Atlas) → https://www.mongodb.com/try/download/community
- **Ollama** (pour l'IA locale) → https://ollama.com/download
  - Après installation, lancer : `ollama pull mistral` (ou le modèle utilisé)
- **Git** → https://git-scm.com/

---

## 📥 Cloner le projet

```bash
git clone <URL_DU_REPO>
cd PFE_SBS
```

---

## ⚙️ Installation du Backend (Python / FastAPI)

### 1. Se placer dans le dossier backend
```bash
cd backend
```

### 2. Créer un environnement virtuel
```bash
python -m venv venv
```

### 3. Activer l'environnement virtuel

- **Windows :**
  ```bash
  venv\Scripts\activate
  ```
- **Mac / Linux :**
  ```bash
  source venv/bin/activate
  ```

### 4. Installer les dépendances
```bash
pip install -r requirements.txt
```

> ⚠️ L'installation peut prendre plusieurs minutes (torch, transformers, etc. sont lourds).

### 5. Variables d'environnement (optionnel)

Le projet fonctionne **sans fichier `.env`** grâce aux valeurs par défaut intégrées dans le code.

Par défaut, il se connecte à MongoDB sur `mongodb://localhost:27017`.

Si tu utilises **MongoDB Atlas** (cloud) au lieu d'un MongoDB local, crée un fichier `.env` dans `backend/` :

```env
MONGO_DETAILS=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/paramiq_db
```

> ℹ️ Pour une installation locale standard, tu peux sauter cette étape.

### 6. Lancer le backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur : http://localhost:8000  
La doc API (Swagger) : http://localhost:8000/docs

---

## 🎨 Installation du Frontend (React / Vite)

### 1. Ouvrir un nouveau terminal et se placer dans frontend
```bash
cd frontend
```

### 2. Installer les dépendances Node.js
```bash
npm install
```

### 3. Lancer le frontend
```bash
npm run dev
```

Le frontend sera accessible sur : http://localhost:5173

---

## 🗄️ Initialiser la base de données (optionnel)

Pour peupler la base avec des données de test :

```bash
cd backend
venv\Scripts\activate   # (ou source venv/bin/activate sur Mac/Linux)
python seed.py
```

---

## 🔁 Résumé — ordre de lancement

| Ordre | Terminal | Commande |
|-------|----------|----------|
| 1 | Racine | Démarrer MongoDB |
| 2 | Racine | `ollama serve` (si IA locale) |
| 3 | `backend/` | `venv\Scripts\activate` puis `uvicorn app.main:app --reload` |
| 4 | `frontend/` | `npm install` puis `npm run dev` |

---

## ❓ Problèmes courants

| Problème | Solution |
|----------|----------|
| `pip` introuvable | Réinstaller Python en cochant "Add to PATH" |
| Erreur MongoDB connexion | Vérifier que MongoDB tourne (`mongod`) |
| `torch` installation lente | Normal, laisser tourner (peut prendre 10-20 min) |
| Port 8000 déjà utilisé | Changer avec `--port 8001` |
| Erreur CORS | Vérifier que backend tourne avant de lancer le frontend |
