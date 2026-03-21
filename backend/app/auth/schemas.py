from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    aadhar: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = 'CSE'
    created_at: Optional[datetime] = None


class VerifyResponse(BaseModel):
    valid: bool
    user: UserProfile


class StudentProfileDetail(BaseModel):
    id: str
    roll_number: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    admission_type: Optional[str] = None
    father_name: Optional[str] = None
    father_phone: Optional[str] = None
    father_email: Optional[str] = None
    mother_name: Optional[str] = None
    mother_phone: Optional[str] = None
    mother_email: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    joined_date: Optional[date] = None


class FacultyProfileDetail(BaseModel):
    id: str
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    joined_date: Optional[date] = None


class FullProfileResponse(BaseModel):
    profile: UserProfile
    detail: Optional[dict] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    aadhar: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    roll_number: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    admission_type: Optional[str] = None
    father_name: Optional[str] = None
    father_phone: Optional[str] = None
    father_email: Optional[str] = None
    mother_name: Optional[str] = None
    mother_phone: Optional[str] = None
    mother_email: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None


class FacultyProfileUpdate(BaseModel):
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
