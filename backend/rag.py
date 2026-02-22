import faiss
import numpy as np
import pickle
import os
import re
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastembed import TextEmbedding
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

VECTOR_STORE_PATH = "vector_store.index"
METADATA_PATH = "metadata.pkl"

embedding_model = TextEmbedding("BAAI/bge-small-en-v1.5")


def extract_text(file_path, filename):
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(file_path)
        text_data = []
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                text_data.append({
                    "text": text,
                    "page": page_num + 1,
                    "source": filename
                })
        return text_data

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read()
        page_size = 3000
        text_data = []
        for i in range(0, len(full_text), page_size):
            chunk_text = full_text[i:i + page_size].strip()
            if chunk_text:
                text_data.append({
                    "text": chunk_text,
                    "page": (i // page_size) + 1,
                    "source": filename
                })
        return text_data

    elif ext in (".docx", ".doc"):
        try:
            from docx import Document
        except ImportError:
            raise ImportError("python-docx is not installed.")
        doc = Document(file_path)
        text_data = []
        page_num = 1
        buffer = ""
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            buffer += text + "\n"
            if len(buffer) >= 3000:
                text_data.append({
                    "text": buffer.strip(),
                    "page": page_num,
                    "source": filename
                })
                buffer = ""
                page_num += 1
        if buffer.strip():
            text_data.append({
                "text": buffer.strip(),
                "page": page_num,
                "source": filename
            })
        return text_data

    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_text(text_data):
    splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    chunks = []
    for item in text_data:
        split_texts = splitter.split_text(item["text"])
        for i, chunk in enumerate(split_texts):
            chunks.append({
                "text": chunk,
                "page": item["page"],
                "source": item["source"],
                "chunk_index": i
            })
    return chunks


def save_vector_store(embeddings, chunks):
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings, dtype=np.float32))
    faiss.write_index(index, VECTOR_STORE_PATH)
    with open(METADATA_PATH, "wb") as f:
        pickle.dump(chunks, f)


def load_vector_store():
    index = faiss.read_index(VECTOR_STORE_PATH)
    with open(METADATA_PATH, "rb") as f:
        chunks = pickle.load(f)
    return index, chunks


def process_documents(file_paths_and_names):
    if os.path.exists(METADATA_PATH) and os.path.exists(VECTOR_STORE_PATH):
        existing_index, existing_chunks = load_vector_store()
        existing_embeddings = existing_index.reconstruct_n(0, existing_index.ntotal)
    else:
        existing_chunks = []
        existing_embeddings = None

    existing_sources = {c["source"] for c in existing_chunks}
    new_chunks = []
    for file_path, filename in file_paths_and_names:
        if filename in existing_sources:
            continue
        pages = extract_text(file_path, filename)
        chunks = chunk_text(pages)
        new_chunks.extend(chunks)

    if not new_chunks:
        return 0

    new_embeddings = np.array(
        list(embedding_model.embed([c["text"] for c in new_chunks])),
        dtype=np.float32
    )

    if existing_embeddings is not None and len(existing_embeddings) > 0:
        all_embeddings = np.vstack([existing_embeddings, new_embeddings])
        all_chunks = existing_chunks + new_chunks
    else:
        all_embeddings = new_embeddings
        all_chunks = new_chunks

    save_vector_store(all_embeddings, all_chunks)
    return len(new_chunks)


def get_documents():
    if not os.path.exists(METADATA_PATH):
        return []
    with open(METADATA_PATH, "rb") as f:
        chunks = pickle.load(f)
    docs = {}
    for chunk in chunks:
        src = chunk["source"]
        docs[src] = docs.get(src, 0) + 1
    return [{"name": k, "chunks": v} for k, v in docs.items()]


def delete_document(doc_name):
    if not os.path.exists(METADATA_PATH):
        return
    with open(METADATA_PATH, "rb") as f:
        chunks = pickle.load(f)
    remaining = [c for c in chunks if c["source"] != doc_name]
    if remaining:
        embeddings = np.array(
            list(embedding_model.embed([c["text"] for c in remaining])),
            dtype=np.float32
        )
        save_vector_store(embeddings, remaining)
    else:
        if os.path.exists(VECTOR_STORE_PATH):
            os.remove(VECTOR_STORE_PATH)
        if os.path.exists(METADATA_PATH):
            os.remove(METADATA_PATH)


def _detect_target_doc(question: str, all_sources: list) -> str | None:
    q_lower = question.lower()
    best_match = None
    best_score = 0
    for source in all_sources:
        name = os.path.splitext(source)[0].lower()
        words = re.split(r'[\s\-_]+', name)
        words = [w for w in words if len(w) > 2]
        score = sum(1 for w in words if w in q_lower)
        if score > best_score:
            best_score = score
            best_match = source
    return best_match if best_score >= 1 else None


def answer_question(question, chat_history, target_doc=None):
    if not os.path.exists(VECTOR_STORE_PATH):
        return {"answer": "No documents uploaded yet.", "sources": []}

    index, chunks = load_vector_store()
    all_sources = list({c["source"] for c in chunks})

    if target_doc:
        chosen_doc = target_doc
    else:
        chosen_doc = _detect_target_doc(question, all_sources)

    if chat_history and len(chat_history) >= 2:
        last_user = next(
            (m["content"] for m in reversed(chat_history[:-1]) if m["role"] == "user"), ""
        )
        search_query = f"{last_user} {question}"
    else:
        search_query = question

    question_vector = np.array(
        list(embedding_model.embed([search_query])),
        dtype=np.float32
    )

    top_k = min(30, index.ntotal)
    distances, indices_result = index.search(question_vector, top_k)

    all_candidates = []
    for i, idx in enumerate(indices_result[0]):
        if idx == -1:
            continue
        chunk = chunks[idx].copy()
        chunk["score"] = round(float(distances[0][i]), 4)
        all_candidates.append(chunk)

    if not all_candidates:
        return {"answer": "No relevant content found.", "sources": []}

    if chosen_doc:
        filtered = [c for c in all_candidates if c["source"] == chosen_doc]
        retrieved_chunks = filtered[:5] if filtered else all_candidates[:5]
    else:
        top5 = all_candidates[:5]
        source_scores: dict = {}
        for c in top5:
            src = c["source"]
            source_scores[src] = source_scores.get(src, 0) + (1.0 / (c["score"] + 1e-6))
        best_doc = max(source_scores, key=source_scores.get)
        best_doc_chunks = [c for c in all_candidates if c["source"] == best_doc]
        retrieved_chunks = best_doc_chunks[:5] if best_doc_chunks else all_candidates[:5]

    context = ""
    for chunk in retrieved_chunks:
        context += f"[Source: {chunk['source']} | Page: {chunk['page']}]\n{chunk['text']}\n\n"

    history_text = ""
    for msg in chat_history[-4:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content']}\n"

    prompt = f"""You are a helpful assistant that answers questions strictly based on the provided document context.

RULES:
- Answer ONLY using the context below.
- If the answer is not found in the context, say exactly: "This information is not available in the uploaded documents."
- Do NOT make up or guess any information.
- Be clear and concise.

CONVERSATION HISTORY:
{history_text}

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    answer = response.choices[0].message.content

    seen = set()
    sources = []
    for chunk in retrieved_chunks:
        key = f"{chunk['source']} — Page {chunk['page']} (score: {chunk['score']})"
        if key not in seen:
            seen.add(key)
            sources.append(key)

    return {"answer": answer, "sources": sources}