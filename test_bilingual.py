import requests
import json

def test_chat(text, lang):
    print(f"\n--- Testing Lang: {lang} | Text: {text} ---")
    try:
        response = requests.post(
            "http://localhost:8000/api/chat",
            json={"text": text, "lang": lang},
            timeout=60
        )
        if response.status_code == 200:
            print("Response:")
            print(response.json().get("response"))
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    # Test French
    test_chat("Explique-moi l'erreur unitRef", "fr")
    # Test English
    test_chat("How to fix the unitRef error?", "en")
    # Test concept in English
    test_chat("What is us-gaap:Assets?", "en")
