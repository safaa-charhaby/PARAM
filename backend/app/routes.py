import os
import pickle
import numpy as np
from fastapi import APIRouter, Body, HTTPException, status
from fastapi.encoders import jsonable_encoder
from .database import mapping_collection, chat_collection
from .models import MappingSchema, UpdateMappingSchema, ChatMessage
from typing import List

# Import NLP libraries for Chatbot
from sentence_transformers import SentenceTransformer, util

router = APIRouter()

# --------- NLP ENGINE INITIALIZATION ---------
MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
# --------- NLP ENGINE INITIALIZATION ---------
MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
# Path relative to backend/app/routes.py -> ../../ai_assistant/knowledge_base.pkl
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INDEX_FILE = os.path.join(BASE_DIR, 'ai_assistant', 'knowledge_base.pkl')

print(f"Initialisation du modèle Sentence-BERT. Recherche de l'index dans : {INDEX_FILE}")
try:
    sbert_model = SentenceTransformer(MODEL_NAME)
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, "rb") as f:
            knowledge_base = pickle.load(f)
        print("Modèle et base de connaissances (RAG) chargés avec succès.")
    else:
        print(f"Erreur: Fichier index non trouvé à {INDEX_FILE}")
        knowledge_base = None
except Exception as e:
    print(f"Attention: Impossible de charger le modèle IA ou le fichier index: {e}")
    sbert_model = None
    knowledge_base = None

def clean_rag_text(text):
    """Clean up raw RAG text for final human-like display."""
    if not text: return ""
    # Remove technical prefixes and formatting
    technical_prefixes = [
        "Label:", "Description:", "Definition:", "Name:", 
        "Output:", "Answer:", "Meaning:", "Texte extrait:",
        "Question:", "Réponse:", "[FR]", "[EN]"
    ]
    for prefix in technical_prefixes:
        text = text.replace(prefix, "")
    
    # Remove excessive bolding and separators
    text = text.replace("**", "").replace(" | ", ". ").replace(";", ".").strip()
    
    # Ensure it starts with a capital and ends with a dot
    if text:
        text = text[0].upper() + text[1:]
        if not text.endswith(('.', '!', '?')): 
            text += '.'
    return text

# --------- CRUD MAPPINGS ---------
# ... (rest of CRUD remains the same)

# --------- ASSISTANT IA CHAT ---------

@router.post("/chat", response_description="Envoyer un message à l'assistant AI")
async def chat_with_assistant(question: dict = Body(...)):
    user_text = question.get("text", "")
    lang = question.get("lang", "fr") # 'fr' or 'en'
    
    if not sbert_model or not knowledge_base:
        msg = "Le moteur de l'Assistant IA n'est pas prêt. Veuillez lancer build_index.py." if lang == 'fr' else "AI Engine not ready. Please run build_index.py."
        return {"response": f"[Mode Dégradé] {msg}"}
    
    # 1. Encoder la question
    query_embedding = sbert_model.encode(user_text, convert_to_tensor=True)
    corpus_embeddings = knowledge_base["embeddings"]
    
    # 2. Recherche sémantique
    hits = util.semantic_search(query_embedding, corpus_embeddings, top_k=5)[0]
    
    if len(hits) == 0:
        msg = "Je n'ai pas trouvé d'information correspondante." if lang == 'fr' else "I couldn't find any relevant information."
        return {"response": msg}
    
    # 3. Sélection intelligente par langue (Priorité au [FR]/[EN])
    best_hit = hits[0]
    lang_tag = f"[{lang.upper()}]"
    
    for hit in hits:
        doc_text = knowledge_base["documents"][hit['corpus_id']].get('text', '')
        if lang_tag in doc_text:
            best_hit = hit
            break # On prend le premier qui correspond à la langue demandée
            
    # 4. Formater la réponse (Natural Language)
    doc = knowledge_base["documents"][best_hit['corpus_id']]
    score = best_hit['score']
    
    display_text = doc.get('text', '')
    
    # Extract the main information part if Question/Réponse format
    if "Réponse:" in display_text:
        parts = display_text.split("Réponse:")
        clean_display = clean_rag_text(parts[1])
    else:
        clean_display = clean_rag_text(display_text)

    # Return only the useful text, no technical prefixes or sources unless critical
    if score < 0.20:
        return {"response": "Désolé, je n'ai pas trouvé d'information assez précise pour répondre à votre question." if lang == 'fr' else "Sorry, I couldn't find precise enough information to answer your question."}
    
    return {"response": clean_display}
