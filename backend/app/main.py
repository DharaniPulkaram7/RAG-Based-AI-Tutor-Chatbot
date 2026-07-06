import json
import shutil
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from .ai import answer_question, chunk_pages, extract_pages, make_quiz, make_summary, rebuild_subject_index
from .auth import create_token, current_user, hash_password, require_roles, user_dict, verify_password
from .config import UPLOAD_DIR, settings
from .database import Base, SessionLocal, engine, get_db
from .models import ChatHistory, Document, DocumentChunk, Quiz, Subject, User
from .schemas import FacultyRequest, LoginRequest, QuestionRequest, QuizRequest, RegisterRequest, SubjectRequest, SummaryRequest


def initialize_database():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@smartedu.com").first():
            db.add(User(name="SmartEdu Admin", email="admin@smartedu.com", password_hash=hash_password("admin123"), role="admin"))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": settings.app_name, "status": "running"}


@app.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(func.lower(User.email) == data.email.lower()).first():
        raise HTTPException(409, "Email already registered")
    user = User(name=data.name, email=data.email.lower(), password_hash=hash_password(data.password), role="student")
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_token(user), "token_type": "bearer", "user": user_dict(user)}


@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_token(user), "token_type": "bearer", "user": user_dict(user)}


@app.post("/auth/logout")
def logout(_: User = Depends(current_user)):
    return {"message": "Logged out. Remove the bearer token on the client."}


@app.get("/auth/me")
def me(user: User = Depends(current_user)):
    return user_dict(user)


@app.post("/auth/create_faculty")
def create_faculty(data: FacultyRequest, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    if db.query(User).filter(func.lower(User.email) == data.email.lower()).first():
        raise HTTPException(409, "Email already registered")
    user = User(name=data.name, email=data.email.lower(), password_hash=hash_password(data.password), role="faculty")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_dict(user)


@app.get("/subjects")
def list_subjects(db: Session = Depends(get_db), _: User = Depends(current_user)):
    return [{"id": s.id, "name": s.name, "code": s.code, "description": s.description, "document_count": len(s.documents)} for s in db.query(Subject).order_by(Subject.name).all()]


@app.post("/subjects")
def create_subject(data: SubjectRequest, db: Session = Depends(get_db), user: User = Depends(require_roles("faculty", "admin"))):
    if db.query(Subject).filter((func.lower(Subject.name) == data.name.lower()) | (func.lower(Subject.code) == data.code.lower())).first():
        raise HTTPException(409, "Subject name or code already exists")
    subject = Subject(name=data.name, code=data.code.upper(), description=data.description, created_by=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "name": subject.name, "code": subject.code, "description": subject.description}


@app.put("/subjects/{subject_id}")
def update_subject(subject_id: int, data: SubjectRequest, db: Session = Depends(get_db), _: User = Depends(require_roles("faculty", "admin"))):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    subject.name, subject.code, subject.description = data.name, data.code.upper(), data.description
    db.commit()
    return {"message": "Subject updated"}


@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("faculty", "admin"))):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    for document in subject.documents:
        Path(document.stored_path).unlink(missing_ok=True)
    db.delete(subject)
    db.commit()
    rebuild_subject_index(db, subject_id)
    return {"message": "Subject deleted"}


@app.get("/materials")
def list_materials(subject_id: int | None = None, db: Session = Depends(get_db), _: User = Depends(current_user)):
    query = db.query(Document)
    if subject_id:
        query = query.filter(Document.subject_id == subject_id)
    return [{"id": d.id, "filename": d.filename, "file_type": d.file_type, "subject_id": d.subject_id, "subject_name": d.subject.name, "chunk_count": len(d.chunks), "created_at": d.created_at} for d in query.order_by(Document.created_at.desc()).all()]


@app.post("/materials/upload")
def upload_material(
    subject_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("faculty", "admin")),
):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".pptx", ".docx"}:
        raise HTTPException(400, "Only PDF, PPTX, and DOCX files are supported")
    destination = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
    try:
        with destination.open("wb") as output:
            shutil.copyfileobj(file.file, output)
        pages = extract_pages(destination, suffix)
        chunks = chunk_pages(pages)
        if not chunks:
            raise ValueError("No extractable text found")
        document = Document(filename=file.filename or destination.name, stored_path=str(destination), file_type=suffix[1:], subject_id=subject_id, uploaded_by=user.id)
        db.add(document)
        db.flush()
        for index, (page, content) in enumerate(chunks):
            db.add(DocumentChunk(document_id=document.id, content=content, page_number=page, chunk_index=index))
        db.commit()
        rebuild_subject_index(db, subject_id)
        return {"message": "Material uploaded and indexed", "document_id": document.id, "chunks": len(chunks)}
    except Exception as exc:
        db.rollback()
        destination.unlink(missing_ok=True)
        raise HTTPException(400, f"Document processing failed: {exc}")


@app.delete("/materials/{document_id}")
def delete_material(document_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("faculty", "admin"))):
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    subject_id = document.subject_id
    Path(document.stored_path).unlink(missing_ok=True)
    db.delete(document)
    db.commit()
    rebuild_subject_index(db, subject_id)
    return {"message": "Material deleted"}


@app.post("/subjects/{subject_id}/rebuild")
def rebuild(subject_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("faculty", "admin"))):
    if not db.get(Subject, subject_id):
        raise HTTPException(404, "Subject not found")
    return {"message": "Embeddings rebuilt", "chunks": rebuild_subject_index(db, subject_id)}


@app.post("/rag/ask")
def ask(data: QuestionRequest, db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    subject = db.get(Subject, data.subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    answer, chunk = answer_question(db, subject.id, data.question)
    chat = ChatHistory(user_id=user.id, subject_id=subject.id, question=data.question, answer=answer, document_name=chunk.document.filename if chunk else None, page_number=chunk.page_number if chunk else None)
    db.add(chat)
    db.commit()
    return {"answer": answer, "subject": subject.name, "document_name": chat.document_name, "page_number": chat.page_number}


@app.get("/rag/history")
def history(db: Session = Depends(get_db), user: User = Depends(current_user)):
    query = db.query(ChatHistory)
    if user.role != "admin":
        query = query.filter(ChatHistory.user_id == user.id)
    return [{"id": h.id, "question": h.question, "answer": h.answer, "subject": h.subject.name, "document_name": h.document_name, "page_number": h.page_number, "created_at": h.created_at} for h in query.order_by(ChatHistory.created_at.desc()).limit(100).all()]


@app.post("/quiz/generate")
def generate_quiz(data: QuizRequest, db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    if data.difficulty.lower() not in {"easy", "medium", "hard"} or data.question_count not in {5, 10, 20}:
        raise HTTPException(400, "Invalid difficulty or question count")
    try:
        content = make_quiz(db, data.subject_id, data.difficulty.lower(), data.question_count)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    quiz = Quiz(user_id=user.id, subject_id=data.subject_id, difficulty=data.difficulty.lower(), question_count=data.question_count, content_json=json.dumps(content))
    db.add(quiz)
    db.commit()
    return {"quiz_id": quiz.id, "questions": content}


@app.post("/summary/generate")
def generate_summary(data: SummaryRequest, db: Session = Depends(get_db), _: User = Depends(require_roles("student", "admin"))):
    try:
        return {"summary": make_summary(db, data.subject_id)}
    except ValueError as exc:
        raise HTTPException(400, str(exc))


@app.get("/admin/users")
def users(db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return [user_dict(user) | {"created_at": user.created_at} for user in db.query(User).order_by(User.created_at.desc()).all()]


@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_roles("admin"))):
    if user_id == admin.id:
        raise HTTPException(400, "You cannot delete your own account")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "admin":
        raise HTTPException(400, "Admin accounts cannot be deleted here")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@app.get("/admin/analytics")
def analytics(db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return {
        "total_users": db.query(User).count(),
        "total_students": db.query(User).filter(User.role == "student").count(),
        "total_faculty": db.query(User).filter(User.role == "faculty").count(),
        "total_subjects": db.query(Subject).count(),
        "total_documents": db.query(Document).count(),
        "total_questions_asked": db.query(ChatHistory).count(),
    }
