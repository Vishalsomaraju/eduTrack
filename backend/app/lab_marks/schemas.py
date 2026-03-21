from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LabMarksCreate(BaseModel):
  student_id:         str
  subject_id:         str
  internal_viva:      float = 0
  observation_record: float = 0
  lab_performance:    float = 0
  external_viva:      float = 0
  external_record:    float = 0
  lab_exam:           float = 0

class LabMarksUpdate(BaseModel):
  internal_viva:      Optional[float] = None
  observation_record: Optional[float] = None
  lab_performance:    Optional[float] = None
  external_viva:      Optional[float] = None
  external_record:    Optional[float] = None
  lab_exam:           Optional[float] = None

class LabMarksResponse(BaseModel):
  id: str
  student_id: str
  subject_id: str
  internal_viva:      float
  observation_record: float
  lab_performance:    float
  external_viva:      float
  external_record:    float
  lab_exam:           float
  # Computed
  internal_total: float = 0
  external_total: float = 0
  total:          float = 0
  percentage:     float = 0
  grade:          str = 'F'
  created_at: Optional[datetime] = None
