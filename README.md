# RAG Knowledge Assistant

An AI-powered document Q&A system. Upload company documents and ask questions — answers come ONLY from your documents with source citations.

## 🔗 Live Demo
https://ornate-rugelach-348383.netlify.app

**Login:** username: `user` | password: `user123`

## 📸 Screenshots
![Login](output screenshot\login page.png)
![interface](output screenshot\empty interface.png) 
![Upload](output screenshot\after loading pdf.png)
![Chat](output screenshot\after question.png)


## ⚙️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS — deployed on Netlify
- **Backend:** FastAPI (Python) — deployed on Railway
- **AI:** Groq LLaMA 3.3 70B
- **Vector DB:** FAISS
- **Embeddings:** FastEmbed (BAAI/bge-small-en-v1.5)

## ✨ Features
- Upload PDF, TXT, DOCX documents
- Semantic search across documents
- Answers strictly from uploaded documents
- Source citation with page numbers
- Multi-turn chat history
- Document management (add/delete)
- User authentication

## 🚀 Run Locally
1. Clone the repo
2. Backend:
```bash
   cd backend
   pip install -r requirements.txt
   # Add GROQ_API_KEY to .env
   uvicorn main:app --reload
```
3. Frontend:
```bash
   cd frontend
   npm install
   npm run dev
```