import os
import pandas as pd
import numpy as np
import pickle
import glob
from sentence_transformers import SentenceTransformer
from datasets import load_from_disk, Dataset

DATA_DIR = r"C:\Users\USER\Desktop\data"
MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
INDEX_FILE = 'knowledge_base.pkl'
MAX_ROWS_PER_FILE = 500  # sampling higher for better depth
MAX_TOTAL_DOCS = 3500   # Total limit for local search performance

def smart_format(row, source_name):
    # Columns to ignore entirely
    ignore_cols = {'id', 'uuid', 'ner_tags', 'tokens', 'doc_path', 'context_id', 'index', 'Unnamed: 0'}
    # Columns that are definitely "content"
    priority_cols = ['label', 'description', 'definition', 'name', 'answer', 'output', 'meaning', 'term', 'concept']
    
    parts = []
    
    # Check for specific dataset patterns
    if 'tokens' in row and 'ner_tags' in row:
        # It's an NER dataset, maybe we can reconstruct the text
        tokens = row.get('tokens', [])
        if isinstance(tokens, str):
            try: tokens = eval(tokens) 
            except: pass
        if isinstance(tokens, list):
            return "Texte extrait: " + " ".join([str(t) for t in tokens])
    
    # General logic: pick priority columns first
    found_priority = False
    for col in priority_cols:
        if col in row and pd.notna(row[col]) and str(row[col]).strip() != '':
            parts.append(f"{col.capitalize()}: {row[col]}")
            found_priority = True
    
    # If no priority columns, take everything else except technical noise
    if not found_priority:
        for col, val in row.items():
            if col.lower() not in ignore_cols and pd.notna(val) and str(val).strip() != '':
                parts.append(f"{col}: {val}")
    
    return " | ".join(parts[:5]) # keep it concise

def process_csv(file_path):
    print(f"Indexation CSV: {file_path}")
    try:
        df = pd.read_csv(file_path, nrows=MAX_ROWS_PER_FILE)
        docs = []
        source_name = os.path.basename(file_path)
        for _, row in df.iterrows():
            text = smart_format(row, source_name)
            if not text: continue
            docs.append({
                "text": text,
                "source": source_name,
                "code": str(row.get('code', row.get('id', 'N/A')))
            })
        return docs
    except Exception as e:
        print(f"Erreur CSV {file_path}: {e}")
        return []

def process_arrow_dir(dir_path):
    print(f"Indexation Arrow (Dataset): {dir_path}")
    try:
        # Check if it's a valid HF dataset directory
        ds = load_from_disk(dir_path)
        # Take a sample to avoid memory overflow
        num_rows = min(len(ds), MAX_ROWS_PER_FILE)
        sample = ds.select(range(num_rows))
        
        docs = []
        source_name = os.path.basename(dir_path)
        for row in sample:
            text = smart_format(row, source_name)
            if not text: continue
            docs.append({
                "text": text,
                "source": source_name,
                "code": str(row.get('code', row.get('id', 'N/A')))
            })
        return docs
    except Exception as e:
        print(f"Erreur Arrow {dir_path}: {e}")
        return []

def build_knowledge_base():
    print(f"Initialisation du modèle {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    all_documents = []

    # 1. Walk through all files and directories
    for root, dirs, files in os.walk(DATA_DIR):
        # Check for CSV files
        for file in files:
            if file.endswith('.csv'):
                all_documents.extend(process_csv(os.path.join(root, file)))
        
        # Check for Arrow datasets (usually a dir with dataset_info.json or state.json)
        if 'dataset_info.json' in files or 'state.json' in files:
            all_documents.extend(process_arrow_dir(root))
        
        # Safety break if we have enough documents
        if len(all_documents) >= MAX_TOTAL_DOCS:
            print(f"Atteint la limite de {MAX_TOTAL_DOCS} documents. Arrêt de l'indexation.")
            break

    print(f"Indexation terminée. {len(all_documents)} documents chargés.")
    
    if not all_documents:
        print("Aucun document trouvé.")
        return

    print("Calcul des vecteurs (Embeddings)...")
    texts = [doc["text"] for doc in all_documents]
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    
    kb = {
        "documents": all_documents,
        "embeddings": embeddings
    }
    
    with open(INDEX_FILE, "wb") as f:
        pickle.dump(kb, f)
    
    print(f"Base de connaissances sauvegardée dans {INDEX_FILE}")

if __name__ == "__main__":
    build_knowledge_base()
