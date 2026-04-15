from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Exam, ExamAttempt, Certificate, Payment
from schemas import DashboardStats, AdminDashboardStats
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/me", response_model=DashboardStats)
def my_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_exams = db.query(Exam).filter(Exam.is_active == True).count()
    attempts = db.query(ExamAttempt).filter(ExamAttempt.user_id == current_user.id).all()
    passed = [a for a in attempts if a.passed]
    avg_score = sum(a.percentage for a in attempts) / len(attempts) if attempts else 0
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    payments = db.query(Payment).filter(Payment.user_id == current_user.id, Payment.status == "paid").all()

    user_averages = []
    # Only count employee accounts for ranking valuation (exclude admin accounts)
    for user in db.query(User).filter(User.role == "employee").all():
        user_attempts = db.query(ExamAttempt).filter(ExamAttempt.user_id == user.id).all()
        average = sum(a.percentage for a in user_attempts) / len(user_attempts) if user_attempts else 0
        user_averages.append((user.id, average))
    ranked = sorted(user_averages, key=lambda item: item[1], reverse=True)
    leaderboard_rank = next((index + 1 for index, item in enumerate(ranked) if item[0] == current_user.id), len(ranked) or 1)

    return DashboardStats(
        total_exams=total_exams,
        attempted_exams=len(attempts),
        passed_exams=len(passed),
        avg_score=round(avg_score, 2),
        leaderboard_rank=leaderboard_rank,
        certificates_locked=sum(1 for c in certs if c.payment_required and not c.is_payment_completed),
        certificates_pending=sum(1 for c in certs if not c.is_approved),
        certificates_approved=sum(1 for c in certs if c.is_approved),
        total_spent=round(sum(p.amount for p in payments), 2),
    )


@router.get("/admin", response_model=AdminDashboardStats)
def admin_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_exams = db.query(Exam).count()
    total_attempts = db.query(ExamAttempt).count()
    total_certs = db.query(Certificate).count()
    pending = db.query(Certificate).filter(Certificate.is_approved == False).count()
    paid_certs = db.query(Certificate).filter(Certificate.is_payment_completed == True).count()
    pending_payments = db.query(Certificate).filter(Certificate.payment_required == True, Certificate.is_payment_completed == False).count()
    attempts = db.query(ExamAttempt).all()
    payments = db.query(Payment).filter(Payment.status == "paid").all()
    pass_rate = (sum(1 for a in attempts if a.passed) / len(attempts) * 100) if attempts else 0

    return AdminDashboardStats(
        total_users=total_users,
        total_exams=total_exams,
        total_attempts=total_attempts,
        total_certificates=total_certs,
        paid_certificates=paid_certs,
        pending_certificates=pending,
        pending_payments=pending_payments,
        avg_pass_rate=round(pass_rate, 2),
        total_revenue=round(sum(payment.amount for payment in payments), 2),
    )
