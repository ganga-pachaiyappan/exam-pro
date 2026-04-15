import os
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from auth import get_current_user, require_admin
from database import get_db
from models import Certificate, Exam, ExamAttempt, Payment, User
from schemas import PaymentOut, PaymentRequest

router = APIRouter(prefix="/api/payments", tags=["payments"])

INVOICE_DIR = "uploads/invoices"


def generate_invoice_pdf(
    payment_id: int,
    transaction_ref: str,
    employee_name: str,
    employee_email: str,
    exam_title: str,
    amount: float,
    currency: str,
    provider: str,
    paid_at: datetime,
) -> str:
    os.makedirs(INVOICE_DIR, exist_ok=True)
    filepath = os.path.join(INVOICE_DIR, f"invoice_{payment_id}.pdf")

    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFillColor(colors.HexColor("#0f172a"))
    c.rect(0, height - 110, width, 110, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(42, height - 52, "ExamPro Invoice")
    c.setFont("Helvetica", 11)
    c.drawString(42, height - 74, f"Invoice ID: INV-{payment_id:06d}")
    c.drawString(42, height - 92, f"Transaction: {transaction_ref}")

    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(42, height - 150, "Billing Summary")

    y = height - 185
    rows = [
        ("Employee", employee_name),
        ("Email", employee_email),
        ("Exam", exam_title),
        ("Provider", provider.title()),
        ("Paid On", paid_at.strftime("%B %d, %Y %H:%M UTC")),
        ("Amount", f"{currency} {amount:.2f}"),
    ]
    c.setFont("Helvetica", 12)
    for label, value in rows:
        c.setFillColor(colors.HexColor("#475569"))
        c.drawString(42, y, label)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.drawString(170, y, value)
        y -= 26

    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.line(42, y - 8, width - 42, y - 8)
    y -= 36

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawString(42, y, "Certificate unlock payment received successfully.")

    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawString(42, 40, "This is a system-generated invoice for assessment certificate unlocking.")

    c.save()
    return filepath


@router.post("/certificates/{cert_id}/checkout", response_model=PaymentOut)
def checkout_certificate(
    cert_id: int,
    payload: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if cert.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if cert.is_payment_completed:
        raise HTTPException(status_code=400, detail="Certificate payment already completed")

    attempt = db.query(ExamAttempt).filter(ExamAttempt.id == cert.attempt_id).first()
    exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first() if attempt else None
    if not attempt or not exam:
        raise HTTPException(status_code=400, detail="Certificate payment context is invalid")

    paid_at = datetime.utcnow()
    transaction_ref = f"{payload.provider[:3].upper()}-{uuid4().hex[:10].upper()}"
    payment = cert.payment or Payment(
        user_id=current_user.id,
        certificate_id=cert.id,
    )
    payment.provider = payload.provider
    payment.amount = exam.certificate_price
    payment.currency = exam.currency
    payment.status = "paid"
    payment.transaction_ref = transaction_ref
    payment.paid_at = paid_at
    db.add(payment)
    db.flush()

    payment.invoice_url = generate_invoice_pdf(
        payment.id,
        transaction_ref,
        current_user.name,
        current_user.email,
        exam.title,
        exam.certificate_price,
        exam.currency,
        payload.provider,
        paid_at,
    )

    cert.is_payment_completed = True
    cert.payment_completed_at = paid_at
    db.commit()
    db.refresh(payment)

    return PaymentOut.model_validate(payment)


@router.get("/me", response_model=list[PaymentOut])
def my_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    return [PaymentOut.model_validate(payment) for payment in payments]


@router.get("/{payment_id}/invoice")
def download_invoice(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    if not payment.invoice_url or not os.path.exists(payment.invoice_url):
        raise HTTPException(status_code=404, detail="Invoice file not found")
    return FileResponse(payment.invoice_url, filename=f"invoice_{payment_id}.pdf", media_type="application/pdf")


@router.get("/admin/all", response_model=list[PaymentOut])
def all_payments(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return [PaymentOut.model_validate(payment) for payment in payments]
