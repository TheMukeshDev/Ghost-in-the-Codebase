import os
import requests

class AIService:
    def __init__(self):
        self.base_url = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
        self.model = os.environ.get('OLLAMA_MODEL', 'qwen2.5:3b')
    
    def is_available(self):
        try:
            resp = requests.get(f'{self.base_url}/api/tags', timeout=2)
            return resp.status_code == 200
        except Exception:
            return False
    
    def ask(self, question, context=''):
        if not self.is_available():
            return {
                'answer': 'Ollama is not available. Using deterministic analysis only.',
                'source': 'fallback',
                'model': None
            }
        try:
            prompt = f"""You are a helpful codebase explainer. Answer based only on the provided code context.
Do not fabricate files or line numbers.

Context:
{context}

Question: {question}

Answer:"""
            resp = requests.post(f'{self.base_url}/api/generate', json={
                'model': self.model,
                'prompt': prompt,
                'stream': False
            }, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    'answer': data.get('response', ''),
                    'source': 'ollama',
                    'model': self.model
                }
            else:
                return {'answer': 'Error generating response', 'source': 'error', 'model': self.model}
        except Exception as e:
            return {'answer': f'Error: {str(e)}', 'source': 'error', 'model': self.model}
