import requests
import json

def test_query(text):
    print(f"\n--- Test Question: {text} ---")
    try:
        response = requests.post(
            "http://localhost:8000/api/chat",
            json={"text": text},
            timeout=60
        )
        if response.status_code == 200:
            print("Assistant IA Response:")
            print(response.json().get("response"))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")

# 1. French Query (EBA concept)
test_query("Explique-moi comment corriger une erreur NULL VALUE sur unitRef.")

# 2. English Query (XBRL concept)
test_query("What does the concept us-gaap:Assets mean?")
