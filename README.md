# SmartEdu_v2

SmartEdu is a college RAG tutor platform. Faculty maintain subject-specific study materials; students ask grounded questions, generate quizzes, and create summaries from those materials.

## Stack

- React, Vite, Tailwind CSS, React Router, Axios
- FastAPI, SQLAlchemy, SQLite, JWT
- Gemini, Sentence Transformers, FAISS

## Quick start (Windows PowerShell)

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. API docs are at `http://localhost:8000/docs`.

## Default admin

- Email: `admin@smartedu.com`
- Password: `admin123`

Change the password and `SECRET_KEY` before any real deployment.

## AI configuration

The default `EMBEDDING_PROVIDER=sentence-transformers` uses `all-MiniLM-L6-v2` (or the configured `EMBEDDING_MODEL`). The first run downloads the model. If the model is unavailable, the app automatically uses a deterministic local hash embedding fallback so uploads remain functional.

Set `GEMINI_API_KEY` to enable Gemini-generated answers, quizzes, and summaries. Without a key, retrieval remains functional and the app uses extractive answer, quiz, and summary fallbacks.

## Supported materials

Text-based PDF, PPTX, and DOCX files are supported. Scanned PDFs require OCR, which is outside this MVP.
