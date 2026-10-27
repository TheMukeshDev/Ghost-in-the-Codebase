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
- **Components** - Reusable UI components
- **API Client** - Axios wrapper

## Data Flow

1. User imports repository (local path)
2. Backend validates and indexes files
3. Analyzer extracts structure, languages, dependencies
4. Frontend displays interactive dashboard
5. User can ask questions - context retrieved locally, sent to Ollama if available

## Privacy

All repository data stays on disk. AI prompts go only to local Ollama instance.
