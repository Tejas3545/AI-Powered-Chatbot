from flask import Flask, render_template, request, jsonify
from chatbot import get_ai_response
from database import init_db, log_message

app = Flask(__name__)
init_db()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chatbot_response():
    user_input = request.json.get("message")
    bot_reply = get_ai_response(user_input)
    log_message(user_input, bot_reply)
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
