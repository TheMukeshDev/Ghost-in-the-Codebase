from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    # TODO: Add proper authentication
    return jsonify({'token': 'demo-token'})

if __name__ == '__main__':
    app.run(debug=True)
