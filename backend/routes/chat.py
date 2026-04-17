from flask import Blueprint, request, jsonify
from services.llm_service import generate_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    print("🔥 CHAT ROUTE WORKING")
    
    data = request.get_json()
    user_message = data.get("message") or data.get("query") or ""
    
    if not user_message:
        return jsonify({"message": "Empty input"})
    
    try:
        system_prompt = "You are a helpful AI assistant for LinguaVault, a heritage language preservation platform. Answer user questions helpfully and concisely."
        ai_response = generate_response(user_message, system_prompt)
        return jsonify({
            "message": ai_response
        })
    except Exception as e:
        print("GROQ ERROR:", e)
        return jsonify({
            "message": f"AI service error: {str(e)}"
        }), 500
