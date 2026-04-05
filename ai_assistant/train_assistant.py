import os
import sys

# Add the current directory to sys.path to allow importing build_index
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from build_index import build_knowledge_base

def train():
    print("=== ParamIQ AI Assistant: Reconstitution de la base de connaissances ===")
    print("Cette opération va indexer les documents de la plateforme et le dataset XBRL.")
    try:
        build_knowledge_base()
        print("\n[SUCCÈS] L'entraînement/indexation est terminé.")
        print("Vous pouvez maintenant redémarrer le backend pour charger la nouvelle base.")
    except Exception as e:
        print(f"\n[ERREUR] Une erreur est survenue lors de l'indexation : {e}")

if __name__ == "__main__":
    train()
