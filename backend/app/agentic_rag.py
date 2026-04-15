import json
import urllib.request
import urllib.error
from typing import Dict, Any

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2:latest"

def call_ollama(prompt: str, system: str = "") -> str:
    """Appelle l'API locale Ollama sans stream (pour les décisions)"""
    data = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("response", "")
    except Exception as e:
        print(f"[Ollama Error] {e}")
        return ""

def call_ollama_stream(prompt: str, system: str = ""):
    """Appelle l'API locale Ollama avec stream et yield les morceaux de texte"""
    data = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "system": system,
        "stream": True,
        "options": {"temperature": 0.2}
    }
    
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            for line in response:
                if line:
                    decoded_line = line.decode('utf-8')
                    try:
                        json_line = json.loads(decoded_line)
                        chunk = json_line.get("response", "")
                        if chunk:
                            yield chunk
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        print(f"[Ollama Stream Error] {e}")
        yield "Désolé, une erreur technique m'empêche de vous répondre avec le streaming."

async def execute_agentic_workflow_stream(user_text: str, lang: str, semantic_search_fn, get_stats_fn):
    """
    Exécute le workflow Agentic RAG puis yield la réponse directement.
    """
    lang_instruction = (
        "You MUST answer ENTIRELY in FRENCH. Do not use English words unless they are technical XBRL tags."
        if lang == 'fr' else 
        "You MUST answer ENTIRELY in ENGLISH. Do not use French words."
    )

    system_prompt = (
        "You are ParamIQ AI, an expert agent in XBRL reporting and EBA taxonomy.\n"
        f"{lang_instruction}\n\n"
        "You have access to tools:\n"
        "1. RAG_Search: Search EBA Knowledge Base for definitions or XBRL tags.\n"
        "2. DB_Stats: Retrieve statistics about validated files.\n"
    )
    
    decision_system = (
        "You are a router. Analyze the user query. If they ask about XBRL/EBA knowledge, output exactly {\"tool\": \"RAG_Search\"}.\n"
        "If they ask about database validation stats, output exactly {\"tool\": \"DB_Stats\"}.\n"
        "Otherwise, output exactly {\"tool\": \"None\"}.\n"
        "DO NOT output ANY OTHER TEXT except the JSON."
    )

    # Étape 1 : Le LLM décide s'il a besoin d'un outil
    print(f"[Agentic RAG] Analyse de la question: {user_text}")
    decision_prompt = f"User query: {user_text}\nOutput JSON ONLY:"
    
    decision_response = call_ollama(decision_prompt, system=decision_system)
    decision_response = decision_response.strip().replace("```json", "").replace("```", "").strip()
    
    print(f"[Agentic RAG] Décision initiale: {decision_response}")
    
    observation = ""
    tool_name = "None"
    
    try:
        if "RAG_Search" in decision_response:
            tool_name = "RAG_Search"
        elif "DB_Stats" in decision_response:
            tool_name = "DB_Stats"
    except Exception:
        pass

    # Étape 2 : Exécution de l'outil
    if tool_name == "RAG_Search":
        print("[Agentic RAG] Appel RAG_Search")
        docs = semantic_search_fn(user_text, top_k=2)
        if docs:
            snippets = [f"- {d['doc'].get('text', '')}" for d in docs]
            observation = "\n".join(snippets)
        else:
            observation = "No relevant information found in EBA knowledge base."
            
    elif tool_name == "DB_Stats":
        print("[Agentic RAG] Appel DB_Stats")
        stats = get_stats_fn()
        observation = f"Database stats: {json.dumps(stats)}"

    # Étape 3 : Génération de la réponse finale en streaming
    final_prompt = f"User asked: {user_text}\n\n"
    if observation:
        final_prompt += f"System Observation from tools:\n{observation}\n\nBased on this observation, provide a clear, accurate, and professional response."
    else:
        final_prompt += "Please reply directly as the ParamIQ AI expert."

    # Pour FastAPI StreamingResponse (qui accepte un générateur asynchrone ou synchrone,
    # nous utilisons un générateur asynchrone qui appelle le générateur synchrone)
    for chunk in call_ollama_stream(final_prompt, system=system_prompt):
        yield chunk
