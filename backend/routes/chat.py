from flask import Blueprint, request, jsonify
import requests

chat_bp = Blueprint('chat', __name__)

def get_llm_response(prompt):
    try:
        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )

        print("OLLAMA RAW:", res.text)  # DEBUG

        if res.status_code == 200:
            data = res.json()
            return data.get("response", "No response from model")
        else:
            return "Ollama error"

    except Exception as e:
        print("OLLAMA ERROR:", e)
        return "AI not working"


@chat_bp.route('/chat', methods=['POST'])
def chat():
    print("🔥 CHAT ROUTE WORKING")

    data = request.get_json()
    user_message = data.get("message") or data.get("query") or ""

    if not user_message:
        return jsonify({"message": "Empty input"})

    ai_response = get_llm_response(user_message)

    return jsonify({
        "message": ai_response
    })