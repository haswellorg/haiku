from flask import Flask, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


todos = []

@app.route("/api/header")
def header():
    return "<h3>Header<h3>"

@app.route("/api/todo", methods = ["POST", "GET"])
def todo():
    if request.method == "POST":
        todos.append(request.get_json().get("todo"))
        response = app.response_class(
            response=json.dumps(todos),
            status=200,
            mimetype='application/json'
        )
        return response
    elif request.method == "GET":
        response = app.response_class(
            response=json.dumps(todos),
            status=200,
            mimetype='application/json'
        )
        return response

@app.route("/api/todo/delete", methods = ["POST"])
def delete_todo():
    if request.method == "POST":
        
        todos.delete(request.get_json().get("todo"))

        response = app.response_class(
            response=json.dumps(todos),
            status=200,
            mimetype='application/json'
        )
        return response


if __name__ == '__main__':
    app.run(debug=True)