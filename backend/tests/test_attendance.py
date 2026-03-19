# tests/test_attendance.py
# Pure unit tests — no DB, no network required.
# These test the risk detection logic that will live in
# app/attendance/service.py.

from app.attendance.service import (
    calculate_percentage,
    is_at_risk,
)
from app.marks.service import is_marks_at_risk

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_calculate_percentage():
    assert calculate_percentage(8, 10) == 80.0
    assert calculate_percentage(0, 0) == 0.0
    assert calculate_percentage(3, 4) == 75.0


def test_is_at_risk():
    assert is_at_risk(74.9) is True
    assert is_at_risk(75.0) is False
    assert is_at_risk(80.0) is False


def test_marks_at_risk():
    assert is_marks_at_risk(39, 100) is True
    assert is_marks_at_risk(40, 100) is False
    assert is_marks_at_risk(0, 0) is True
