import os
import pandas as pd
import numpy as np
import pickle
import glob
from sentence_transformers import SentenceTransformer
from datasets import load_from_disk, Dataset

DATA_DIR = r"C:\Users\USER\Desktop\data"
MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
INDEX_FILE = os.path.join(os.path.dirname(__file__), 'knowledge_base.pkl')
MAX_ROWS_PER_FILE = 1000  # sampling higher for better depth
MAX_TOTAL_DOCS = 5000   # Better coverage for all concepts

def smart_format(row, source_name):
    # Columns to ignore entirely
    ignore_cols = {'id', 'uuid', 'ner_tags', 'tokens', 'doc_path', 'context_id', 'index', 'Unnamed: 0'}
    
    # Specific handling for the XBRL dataset (instruction/input/output)
    if 'input' in row and 'output' in row:
        input_text = str(row['input']).strip()
        output_text = str(row['output']).strip()
        # Remove "Answer:" prefix if present in input
        input_text = input_text.replace("\nAnswer:", "").strip()
        return f"Question: {input_text} | Réponse: {output_text}"

    # Columns that are definitely "content"
    priority_cols = ['label', 'description', 'definition', 'name', 'answer', 'output', 'meaning', 'term', 'concept']
    
    parts = []
    
    # Check for specific dataset patterns (NER)
    if 'tokens' in row and 'ner_tags' in row:
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

def process_markdown(file_path):
    print(f"Indexation Markdown: {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Split by sections (approximate) or just take the whole thing if small
            # For platform_context, we can index by paragraphs or sections
            sections = content.split('##')
            docs = []
            source_name = os.path.basename(file_path)
            for section in sections:
                if not section.strip(): continue
                docs.append({
                    "text": section.strip(),
                    "source": source_name,
                    "code": "DOC"
                })
            return docs
    except Exception as e:
        print(f"Erreur Markdown {file_path}: {e}")
        return []

def process_arrow_dir(dir_path):
    print(f"Indexation Arrow (Dataset): {dir_path}")
    try:
        ds = load_from_disk(dir_path)
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

    # 1. Index platform context and expert knowledge first
    context_files = [
        os.path.join(os.path.dirname(__file__), 'platform_context.md'),
        os.path.join(os.path.dirname(__file__), 'expert_knowledge.md')
    ]
    for cf in context_files:
        if os.path.exists(cf):
            all_documents.extend(process_markdown(cf))

    # 2. Walk through data files
    for root, dirs, files in os.walk(DATA_DIR):
        if len(all_documents) >= MAX_TOTAL_DOCS: break

        for file in files:
            if len(all_documents) >= MAX_TOTAL_DOCS: break
            if file.endswith('.csv'):
                all_documents.extend(process_csv(os.path.join(root, file)))
        
        if len(all_documents) < MAX_TOTAL_DOCS:
            if 'dataset_info.json' in files or 'state.json' in files:
                all_documents.extend(process_arrow_dir(root))

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
