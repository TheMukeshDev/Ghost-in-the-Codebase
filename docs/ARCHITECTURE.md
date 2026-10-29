# Architecture

## Overview

Ghost in the Codebase is a local-first application with a React frontend and Flask backend.

## Components

### Backend
- **Routes** - API endpoints for repositories, analysis, AI
- **Services** - Storage (SQLite), AI service (Ollama)
- **Analyzers** - Repository analysis using AST
- **Security** - Path validation, zip security checks

### Frontend
- **Pages** - Landing, Import, Dashboard, Settings
- **API Client** - Axios wrapper

## Data Flow

1. User selects a repository folder or uploads a `.zip` archive (or drops it on the import zone)
2. The browser packages a folder selection into a `.zip` and sends it to the backend
3. Backend validates the archive, extracts it safely, and indexes the files
4. Analyzer extracts structure, languages, dependencies
5. Frontend displays the interactive dashboard
6. User can ask questions - context retrieved locally, sent to Ollama if available

## Privacy

All repository data stays on disk. AI prompts go only to a local Ollama instance.
