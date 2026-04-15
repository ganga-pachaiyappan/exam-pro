from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base, SessionLocal
from models import User, RoleEnum
from auth import hash_password
from routers import auth_router, user_router, exam_router, certificate_router, dashboard_router, payment_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ExamPro API", version="1.0.0")

# CORS - allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(exam_router.router)
app.include_router(certificate_router.router)
app.include_router(dashboard_router.router)
app.include_router(payment_router.router)


# Seed admin user
@app.on_event("startup")
def seed_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if not admin:
            admin = User(
                name="Admin",
                email="admin@gmail.com",
                hashed_password=hash_password("Admin@123"),
                role=RoleEnum.admin,
            )
            db.add(admin)
            db.commit()
            print("Admin user created: admin@gmail.com / Admin@123")
        else:
            print("Admin user already exists")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "ExamPro API is running", "docs": "/docs"}
