from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import shutil
import os
import tempfile
from rag import process_documents, get_documents, delete_document, answer_question

app = FastAPI()

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth ─────────────────────────────────────────────────────
USERS = {
    "admin": "admin123",
    "user": "user123"
}

class LoginRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    question: str
    chat_history: List[dict] = []

class DeleteRequest(BaseModel):
    doc_name: str

# ── Routes ───────────────────────────────────────────────────
@app.post("/login")
def login(request: LoginRequest):
    if request.username in USERS and USERS[request.username] == request.password:
        return {"success": True, "username": request.username}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    temp_files = []
    try:
        for file in files:
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(file.file, tmp)
                temp_files.append((tmp.name, file.filename))

        total_chunks = process_documents(temp_files)
        return {"success": True, "total_chunks": total_chunks}
    finally:
        for temp_path, _ in temp_files:
            if os.path.exists(temp_path):
                os.remove(temp_path)

@app.get("/documents")
def list_documents():
    return {"documents": get_documents()}

@app.post("/delete")
def delete_doc(request: DeleteRequest):
    delete_document(request.doc_name)
    return {"success": True}

@app.delete("/clear")
def clear_all():
    for path in ["vector_store.index", "metadata.pkl"]:
        if os.path.exists(path):
            os.remove(path)
    return {"success": True}

@app.post("/chat")
def chat(request: ChatRequest):
    result = answer_question(request.question, request.chat_history)
    return result
