# RAG Knowledge Assistant

A web app where users upload company documents and ask questions.
The system answers ONLY from those documents and shows sources.

## Features
- Upload multiple PDF documents
- Ask questions in natural language
- Answers strictly from uploaded documents
- Source citation with page numbers
- Chat history with follow-up questions
- Document management (add/remove docs)
- Login authentication

## Tech Stack
- Streamlit (UI)
- FAISS (Vector Database)
- SentenceTransformers (Embeddings)
- Groq LLaMA 3.3 (LLM)
- LangChain Text Splitters
- PyPDF

## Setup
1. Clone the repo
2. Install dependencies: `pip install -r requirements.txt`
3. Add your `GROQ_API_KEY` in `.env` file
4. Run: `streamlit run app.py`

## Usage
- Login with username/password
- Upload PDF files
- Ask questions about your documents