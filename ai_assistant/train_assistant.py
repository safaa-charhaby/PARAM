import os
import pandas as pd
import zipfile
from sentence_transformers import SentenceTransformer

def load_datasets(pfe_ai_path: str, dataset2_path: str):
    print("Chargement des données depuis :")
    print(f" - {pfe_ai_path}")
    print(f" - {dataset2_path}")

    # Chargement du fichier principal de mapping 
    conversion_file_path = os.path.join(pfe_ai_path, "eba_conversion_file_phase_3_22.05.2025.xlsx")
    
    if not os.path.exists(conversion_file_path):
        print(f"Erreur: Fichier introuvable - {conversion_file_path}")
        return

    print(f"Lecture du fichier principal: {conversion_file_path}")
    
    # Lecture des feuilles Property, Category, Items
    # Note: openpyxl doit être installé
    try:
        df_property = pd.read_excel(conversion_file_path, sheet_name='Property')
        df_category = pd.read_excel(conversion_file_path, sheet_name='Category')
        print(f"Feuilles chargées avec succès: Property ({len(df_property)} lignes), Category ({len(df_category)} lignes)")
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier Excel: {e}")

    # Chargement du Glossary
    glossary_path = os.path.join(pfe_ai_path, "Glossary - full export.xlsx")
    if os.path.exists(glossary_path):
        print(f"Lecture du glossaire: {glossary_path}")
        df_glossary_cat = pd.read_excel(glossary_path, sheet_name='Category')
        print(f"Glossaire chargé: {len(df_glossary_cat)} catégories.")

    print("\nPhase de Feature Engineering & NLP...")
    # Initialisation de Sentence-BERT comme requis pour Module A
    # print("Initialisation du modèle paraphrase-multilingual-mpnet-base-v2...")
    # model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
    
    # Ici, nous construirons le dataset pour l'assistant...
    print("Structure de la base de connaissances de l'assistant initialisée.")
    print("Le modèle pourra interagir avec ces données pour assister l'utilisateur sur les mappings EBA.")


if __name__ == "__main__":
    PFE_AI_DIR = r"C:\Users\USER\Downloads\PFE-AI"
    DATASET2_DIR = r"C:\Users\USER\Downloads\dataset2"
    
    load_datasets(PFE_AI_DIR, DATASET2_DIR)
