# ExamPro - FastAPI Backend

## Setup

```bash
cd fastapi-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Default Admin
- Email: `admin@gmail.com`
- Password: `Admin@123`

## API Docs
Visit `http://localhost:8000/docs` for Swagger UI.

## Folder Structure
```
fastapi-backend/
├── main.py          # App entry, CORS, seed admin
├── database.py      # SQLite + SQLAlchemy setup
├── models.py        # DB models
├── schemas.py       # Pydantic schemas
├── auth.py          # JWT auth utilities
├── routers/
│   ├── auth_router.py        # Login, me
│   ├── user_router.py        # Profile, photo, admin CRUD
│   ├── exam_router.py        # Exam CRUD, submit, attempts
│   ├── certificate_router.py # Cert approve, download PDF
│   └── dashboard_router.py   # Stats for employee & admin
├── uploads/         # User photos & certificates
└── exampro.db       # SQLite database (auto-created)
```
