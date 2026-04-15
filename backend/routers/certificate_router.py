import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from database import get_db
from models import User, Certificate, ExamAttempt, Exam
from schemas import CertificateOut
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/certificates", tags=["certificates"])

CERT_DIR = "uploads/certificates"


def serialize_certificate(cert: Certificate, user_name: str, exam_title: str, percentage: float) -> CertificateOut:
    return CertificateOut(
        id=cert.id,
        user_id=cert.user_id,
        attempt_id=cert.attempt_id,
        user_name=user_name,
        exam_title=exam_title,
        percentage=percentage,
        payment_required=cert.payment_required,
        is_payment_completed=cert.is_payment_completed,
        payment_status="paid" if cert.is_payment_completed else "pending",
        invoice_ready=bool(cert.payment and cert.payment.invoice_url),
        is_approved=cert.is_approved,
        created_at=cert.created_at,
        approved_at=cert.approved_at,
    )


def generate_certificate_pdf(user_name: str, exam_title: str, score: float, date: str, cert_id: int) -> str:
    os.makedirs(CERT_DIR, exist_ok=True)
    filepath = os.path.join(CERT_DIR, f"cert_{cert_id}.pdf")

    c = canvas.Canvas(filepath, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Background
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Border
    c.setStrokeColor(colors.HexColor("#1e3a5f"))
    c.setLineWidth(3)
    c.rect(30, 30, width - 60, height - 60, fill=0, stroke=1)
    c.setLineWidth(1)
    c.rect(40, 40, width - 80, height - 80, fill=0, stroke=1)

    # Title
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(colors.HexColor("#1e3a5f"))
    c.drawCentredString(width / 2, height - 120, "CERTIFICATE OF COMPLETION")

    # Decorative line
    c.setStrokeColor(colors.HexColor("#3b82f6"))
    c.setLineWidth(2)
    c.line(width / 2 - 150, height - 135, width / 2 + 150, height - 135)

    # Body
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2, height - 180, "This is to certify that")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawCentredString(width / 2, height - 220, user_name)

    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2, height - 260, "has successfully completed the examination")

    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(colors.HexColor("#1e3a5f"))
    c.drawCentredString(width / 2, height - 300, f'"{exam_title}"')

    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2, height - 340, f"with a score of {score}%")

    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 380, f"Date: {date}")

    # Certificate ID
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.drawCentredString(width / 2, 60, f"Certificate ID: EXAMPRO-{cert_id:06d}")

    c.save()
    return filepath


@router.get("/me", response_model=list[CertificateOut])
def my_certificates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    result = []
    for cert in certs:
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == cert.attempt_id).first()
        exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first() if attempt else None
        result.append(
            serialize_certificate(
                cert,
                current_user.name,
                exam.title if exam else "Unknown",
                attempt.percentage if attempt else 0,
            )
        )
    return result


@router.get("/all", response_model=list[CertificateOut])
def all_certificates(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    certs = db.query(Certificate).all()
    result = []
    for cert in certs:
        user = db.query(User).filter(User.id == cert.user_id).first()
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == cert.attempt_id).first()
        exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first() if attempt else None
        result.append(
            serialize_certificate(
                cert,
                user.name if user else "Unknown",
                exam.title if exam else "Unknown",
                attempt.percentage if attempt else 0,
            )
        )
    return result


@router.post("/{cert_id}/approve", response_model=CertificateOut)
def approve_certificate(cert_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    attempt = db.query(ExamAttempt).filter(ExamAttempt.id == cert.attempt_id).first()
    exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first() if attempt else None
    user = db.query(User).filter(User.id == cert.user_id).first()

    # Generate PDF
    filepath = generate_certificate_pdf(
        user_name=user.name if user else "Unknown",
        exam_title=exam.title if exam else "Unknown",
        score=attempt.percentage if attempt else 0,
        date=datetime.utcnow().strftime("%B %d, %Y"),
        cert_id=cert.id,
    )

    cert.is_approved = True
    cert.approved_by = admin.id
    cert.approved_at = datetime.utcnow()
    cert.certificate_url = filepath
    db.commit()
    db.refresh(cert)

    return serialize_certificate(
        cert,
        user.name if user else "Unknown",
        exam.title if exam else "Unknown",
        attempt.percentage if attempt else 0,
    )


@router.get("/{cert_id}/download")
def download_certificate(cert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if not cert.is_approved:
        raise HTTPException(status_code=403, detail="Certificate not yet approved")
    if cert.payment_required and not cert.is_payment_completed:
        raise HTTPException(status_code=403, detail="Certificate payment is required before download")
    if cert.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    if not cert.certificate_url or not os.path.exists(cert.certificate_url):
        raise HTTPException(status_code=404, detail="Certificate file not found")
    return FileResponse(cert.certificate_url, filename=f"certificate_{cert_id}.pdf", media_type="application/pdf")
