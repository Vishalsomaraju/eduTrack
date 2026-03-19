from app.analytics.service import compute_grade
from app.attendance.service import (
    calculate_percentage, is_at_risk
)

def test_compute_grade():
    assert compute_grade(95) == "O"
    assert compute_grade(90) == "O"
    assert compute_grade(89) == "A+"
    assert compute_grade(75) == "A+"
    assert compute_grade(74) == "A"
    assert compute_grade(60) == "A"
    assert compute_grade(59) == "B+"
    assert compute_grade(50) == "B+"
    assert compute_grade(49) == "B"
    assert compute_grade(40) == "B"
    assert compute_grade(39) == "F"
    assert compute_grade(0)  == "F"

def test_grade_boundaries():
    # Exactly at boundaries
    assert compute_grade(90.0) == "O"
    assert compute_grade(75.0) == "A+"
    assert compute_grade(60.0) == "A"
    assert compute_grade(50.0) == "B+"
    assert compute_grade(40.0) == "B"
