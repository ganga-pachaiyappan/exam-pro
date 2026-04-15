from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class RoleEnum(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class QuestionTypeEnum(str, enum.Enum):
    mcq = "mcq"
    coding = "coding"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(RoleEnum), default=RoleEnum.employee)
    address = Column(Text, default="")
    phone = Column(String(20), default="")
    photo_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    exam_attempts = relationship("ExamAttempt", back_populates="user")
    certificates = relationship(
        "Certificate",
        back_populates="user",
        foreign_keys="Certificate.user_id",
    )
    approved_certificates = relationship(
        "Certificate",
        back_populates="approver",
        foreign_keys="Certificate.approved_by",
    )
    payments = relationship("Payment", back_populates="user")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    duration_minutes = Column(Integer, default=30)
    total_marks = Column(Float, default=100)
    pass_percentage = Column(Float, default=50)
    certificate_price = Column(Float, default=499)
    currency = Column(String(10), default="INR")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="exam")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    question_type = Column(SAEnum(QuestionTypeEnum), default=QuestionTypeEnum.mcq)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=True)
    option_b = Column(String(500), nullable=True)
    option_c = Column(String(500), nullable=True)
    option_d = Column(String(500), nullable=True)
    correct_option = Column(String(1), nullable=True)  # a, b, c, d
    code_template = Column(Text, default="")
    expected_answer = Column(Text, default="")
    marks = Column(Float, default=1)

    exam = relationship("Exam", back_populates="questions")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    score = Column(Float, default=0)
    total_marks = Column(Float, default=0)
    percentage = Column(Float, default=0)
    passed = Column(Boolean, default=False)
    answers = Column(Text, default="{}")  # JSON string of answers
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="exam_attempts")
    exam = relationship("Exam", back_populates="attempts")
    certificate = relationship("Certificate", back_populates="attempt", uselist=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    attempt_id = Column(Integer, ForeignKey("exam_attempts.id"), nullable=False)
    certificate_url = Column(String(500), default="")
    is_approved = Column(Boolean, default=False)
    payment_required = Column(Boolean, default=True)
    is_payment_completed = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    payment_completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="certificates", foreign_keys=[user_id])
    approver = relationship("User", back_populates="approved_certificates", foreign_keys=[approved_by])
    attempt = relationship("ExamAttempt", back_populates="certificate")
    payment = relationship("Payment", back_populates="certificate", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certificate_id = Column(Integer, ForeignKey("certificates.id"), nullable=False, unique=True)
    provider = Column(String(50), default="demo")
    amount = Column(Float, default=0)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="paid")
    transaction_ref = Column(String(100), default="")
    invoice_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="payments")
    certificate = relationship("Certificate", back_populates="payment")
