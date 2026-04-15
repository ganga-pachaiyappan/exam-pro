from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    address: str = ""
    phone: str = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# User
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "employee"
    address: str = ""
    phone: str = ""


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    address: str
    phone: str
    photo_url: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Exam
class QuestionCreate(BaseModel):
    question_type: str = "mcq"
    question_text: str
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    code_template: str = ""
    expected_answer: str = ""
    marks: float = 1


class QuestionOut(BaseModel):
    id: int
    question_type: str
    question_text: str
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    code_template: str = ""
    marks: float

    class Config:
        from_attributes = True


class QuestionOutAdmin(QuestionOut):
    correct_option: Optional[str] = None
    expected_answer: str = ""


class ExamCreate(BaseModel):
    title: str
    description: str = ""
    duration_minutes: int = 30
    total_marks: float = 100
    pass_percentage: float = 50
    certificate_price: float = 499
    currency: str = "INR"
    questions: List[QuestionCreate] = []


class ExamOut(BaseModel):
    id: int
    title: str
    description: str
    duration_minutes: int
    total_marks: float
    pass_percentage: float
    certificate_price: float
    currency: str
    is_active: bool
    created_at: datetime
    question_count: int = 0

    class Config:
        from_attributes = True


class ExamDetailOut(ExamOut):
    questions: List[QuestionOut] = []


class ExamDetailAdminOut(ExamOut):
    questions: List[QuestionOutAdmin] = []


# Exam Attempt
class SubmitAnswer(BaseModel):
    question_id: int
    selected_option: Optional[str] = None
    coding_answer: Optional[str] = None


class SubmitExam(BaseModel):
    answers: List[SubmitAnswer]


class AttemptOut(BaseModel):
    id: int
    exam_id: int
    exam_title: str = ""
    score: float
    total_marks: float
    percentage: float
    passed: bool
    started_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Certificate
class CertificateOut(BaseModel):
    id: int
    user_id: int
    attempt_id: int
    user_name: str = ""
    exam_title: str = ""
    percentage: float = 0
    payment_required: bool = True
    is_payment_completed: bool = False
    payment_status: str = "pending"
    invoice_ready: bool = False
    is_approved: bool
    created_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Dashboard
class DashboardStats(BaseModel):
    total_exams: int
    attempted_exams: int
    passed_exams: int
    avg_score: float
    leaderboard_rank: int
    certificates_locked: int
    certificates_pending: int
    certificates_approved: int
    total_spent: float


class AdminDashboardStats(BaseModel):
    total_users: int
    total_exams: int
    total_attempts: int
    total_certificates: int
    paid_certificates: int
    pending_certificates: int
    pending_payments: int
    avg_pass_rate: float
    total_revenue: float


class PaymentRequest(BaseModel):
    provider: str = "demo"


class PaymentOut(BaseModel):
    id: int
    certificate_id: int
    provider: str
    amount: float
    currency: str
    status: str
    transaction_ref: str
    invoice_url: str
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
