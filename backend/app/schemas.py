from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class FacultyRequest(RegisterRequest):
    pass


class SubjectRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    code: str = Field(min_length=2, max_length=50)
    description: str = ""


class QuestionRequest(BaseModel):
    subject_id: int
    question: str = Field(min_length=2)


class QuizRequest(BaseModel):
    subject_id: int
    difficulty: str
    question_count: int


class SummaryRequest(BaseModel):
    subject_id: int

