import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Exam, Question, ExamAttempt, Certificate, QuestionTypeEnum
from schemas import (
    ExamCreate, ExamOut, ExamDetailOut, ExamDetailAdminOut,
    SubmitExam, AttemptOut, QuestionOut, QuestionOutAdmin
)
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/exams", tags=["exams"])


def serialize_exam(exam: Exam) -> ExamOut:
    return ExamOut(
        **{c.name: getattr(exam, c.name) for c in exam.__table__.columns},
        question_count=len(exam.questions),
    )


def score_coding_answer(answer: str, expected_answer: str, marks: float) -> float:
    normalized = (answer or "").strip().lower()
    expected = [part.strip().lower() for part in expected_answer.replace("\n", ",").split(",") if part.strip()]
    if not expected:
        return 0.0
    matched = sum(1 for keyword in expected if keyword in normalized)
    ratio = matched / len(expected)
    return round(marks * ratio, 2)


# ---- Admin CRUD ----
@router.post("/", response_model=ExamOut)
def create_exam(data: ExamCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    exam = Exam(
        title=data.title,
        description=data.description,
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        pass_percentage=data.pass_percentage,
        certificate_price=data.certificate_price,
        currency=data.currency,
        created_by=admin.id,
    )
    db.add(exam)
    db.flush()
    for q in data.questions:
        question = Question(
            exam_id=exam.id,
            question_type=q.question_type,
            question_text=q.question_text,
            option_a=q.option_a, option_b=q.option_b,
            option_c=q.option_c, option_d=q.option_d,
            correct_option=q.correct_option.lower() if q.correct_option else None,
            code_template=q.code_template,
            expected_answer=q.expected_answer,
            marks=q.marks,
        )
        db.add(question)
    db.commit()
    db.refresh(exam)
    return serialize_exam(exam)


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam(exam_id: int, data: ExamCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam.title = data.title
    exam.description = data.description
    exam.duration_minutes = data.duration_minutes
    exam.total_marks = data.total_marks
    exam.pass_percentage = data.pass_percentage
    exam.certificate_price = data.certificate_price
    exam.currency = data.currency
    # Replace questions
    db.query(Question).filter(Question.exam_id == exam_id).delete()
    for q in data.questions:
        question = Question(
            exam_id=exam.id,
            question_type=q.question_type,
            question_text=q.question_text,
            option_a=q.option_a, option_b=q.option_b,
            option_c=q.option_c, option_d=q.option_d,
            correct_option=q.correct_option.lower() if q.correct_option else None,
            code_template=q.code_template,
            expected_answer=q.expected_answer,
            marks=q.marks,
        )
        db.add(question)
    db.commit()
    db.refresh(exam)
    return serialize_exam(exam)


@router.delete("/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return {"detail": "Exam deleted"}


# ---- List exams ----
@router.get("/", response_model=list[ExamOut])
def list_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exams = db.query(Exam).filter(Exam.is_active == True).all()
    return [serialize_exam(e) for e in exams]


# ---- Attempt history ----
@router.get("/attempts/me", response_model=list[AttemptOut])
def my_attempts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempts = db.query(ExamAttempt).filter(ExamAttempt.user_id == current_user.id).all()
    result = []
    for a in attempts:
        exam = db.query(Exam).filter(Exam.id == a.exam_id).first()
        result.append(AttemptOut(
            **{c.name: getattr(a, c.name) for c in a.__table__.columns},
            exam_title=exam.title if exam else "Deleted Exam",
        ))
    return result


@router.get("/attempts/all", response_model=list[AttemptOut])
def all_attempts(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    attempts = db.query(ExamAttempt).all()
    result = []
    for a in attempts:
        exam = db.query(Exam).filter(Exam.id == a.exam_id).first()
        result.append(AttemptOut(
            **{c.name: getattr(a, c.name) for c in a.__table__.columns},
            exam_title=exam.title if exam else "Deleted Exam",
        ))
    return result


@router.get("/{exam_id}", response_model=ExamDetailOut)
def get_exam(exam_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    questions = [QuestionOut.model_validate(q) for q in exam.questions]
    return ExamDetailOut(
        **{c.name: getattr(exam, c.name) for c in exam.__table__.columns},
        question_count=len(questions),
        questions=questions,
    )


@router.get("/{exam_id}/admin", response_model=ExamDetailAdminOut)
def get_exam_admin(exam_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    questions = [QuestionOutAdmin.model_validate(q) for q in exam.questions]
    return ExamDetailAdminOut(
        **{c.name: getattr(exam, c.name) for c in exam.__table__.columns},
        question_count=len(questions),
        questions=questions,
    )


# ---- Take exam ----
@router.post("/{exam_id}/submit", response_model=AttemptOut)
def submit_exam(exam_id: int, data: SubmitExam, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Auto-score
    answer_map = {}
    submitted_answers = {a.question_id: a for a in data.answers}
    score = 0
    total = 0
    for q in exam.questions:
        total += q.marks
        submitted = submitted_answers.get(q.id)
        if not submitted:
            continue

        if q.question_type == QuestionTypeEnum.mcq:
            selected = (submitted.selected_option or "").lower()
            answer_map[q.id] = {"type": "mcq", "selected_option": selected}
            if selected and selected == (q.correct_option or ""):
                score += q.marks
        else:
            coding_answer = (submitted.coding_answer or "").strip()
            answer_map[q.id] = {"type": "coding", "coding_answer": coding_answer}
            score += score_coding_answer(coding_answer, q.expected_answer or "", q.marks)

    percentage = (score / total * 100) if total > 0 else 0
    passed = percentage >= exam.pass_percentage

    attempt = ExamAttempt(
        user_id=current_user.id,
        exam_id=exam_id,
        score=round(score, 2),
        total_marks=total,
        percentage=round(percentage, 2),
        passed=passed,
        answers=json.dumps(answer_map),
        submitted_at=datetime.utcnow(),
    )
    db.add(attempt)
    db.flush()

    # Auto-create certificate request if passed
    if passed:
        cert = Certificate(
            user_id=current_user.id,
            attempt_id=attempt.id,
            payment_required=exam.certificate_price > 0,
            is_payment_completed=exam.certificate_price <= 0,
            payment_completed_at=datetime.utcnow() if exam.certificate_price <= 0 else None,
        )
        db.add(cert)

    db.commit()
    db.refresh(attempt)
    return AttemptOut(
        **{c.name: getattr(attempt, c.name) for c in attempt.__table__.columns},
        exam_title=exam.title,
    )
