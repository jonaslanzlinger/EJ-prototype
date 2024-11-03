from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os
import re

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

# Set up OpenAI API
api_key = os.getenv("API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")

openai_client = OpenAI(api_key=api_key)
assistant = openai_client.beta.assistants.retrieve(assistant_id=assistant_id)
thread = openai_client.beta.threads.create()


# Serve static files from the public directory
@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)


# Define /chat endpoint
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    parameters = data.get("parameters")
    message = data.get("message")

    response = openai_client.beta.threads.messages.create(
        thread_id=thread.id, role="user", content=str(parameters) + " " + message
    )

    run = openai_client.beta.threads.runs.create_and_poll(
        thread_id=thread.id, assistant_id=assistant.id
    )

    if run.status == "completed":
        messages = openai_client.beta.threads.messages.list(thread_id=thread.id)
        for message in messages.data:
            if message.role == "assistant":
                for content_block in message.content:
                    if content_block.type == "text":
                        text = str(content_block.text.value)
                        text = re.sub(r"【.*】", "", text).strip()
                        return jsonify({"reply": text})

    return jsonify({"reply": "Error in processing your request"})


# Run the Flask app
if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)
