# Ghost in the Codebase

> "Every Codebase Has a Story. Some Are Waiting to Be Resurrected."

A spooky but genuinely useful local-first AI assistant that explores unfamiliar or abandoned open-source repositories and brings their forgotten code back to life.

## Features

- **Haunted Repository Explorer** - Upload/import repos safely with path traversal protection
- **Codebase Resurrection** - Analyze structure, dependencies, and important files
- **Ask the Ghost** - Local AI assistant powered by Ollama
- **Ghost Story Generator** - Technically-grounded narrative about your codebase
- **Forgotten Code Detector** - Find TODOs, complex code, and maintenance opportunities
- **Privacy-First** - Everything runs locally by default

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, Flask
- **AI:** Ollama (local, open-weight models)
- **Analysis:** Python AST, static analysis
- **Storage:** SQLite (local)

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- [Ollama](https://ollama.ai/) (optional, for AI features)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp ../.env.example ../.env
python app.py
```

Backend runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### Ollama Setup (Optional)

```bash
ollama pull qwen2.5:3b
ollama serve
```

## Importing a Repository

Browsers cannot read an arbitrary filesystem path typed into a text box, so the import screen uses browser-supported selection instead:

- **Browse Folder** - pick a repository directory with the HTML directory picker
- **Upload .zip** - upload a zipped repository
- **Drag & drop** - drop a folder or `.zip` archive onto the import zone

A selected folder is packaged into a `.zip` in the browser and sent to the local Flask backend, which validates it and runs the analysis pipeline.

## Security

- Path traversal protection for extracted archives
- No code execution
- Local-first by default
- CORS restricted
- Input validation

## License

MIT License
