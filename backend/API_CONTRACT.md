# API Contract — EduTrack

# Shared between frontend and backend teams.

# Any change here must be communicated to both sides before implementation.

# Last updated: [DATE]

---

## Base URL

```
Development:  http://localhost:8000
Production:   https://[render-url].onrender.com
```

## Auth Header

All protected endpoints require:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Endpoints

### 🔐 Auth

| Method | Path           | Auth   | Description                       |
| ------ | -------------- | ------ | --------------------------------- |
| POST   | `/auth/verify` | Bearer | Verify JWT, return profile + role |
| GET    | `/auth/me`     | Bearer | Get current user profile          |

**GET /auth/me → Response:**

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "admin | faculty | student",
  "avatar_url": "string | null"
}
```

---

### 👥 Students

| Method | Path             | Role           | Description            |
| ------ | ---------------- | -------------- | ---------------------- |
| GET    | `/students/`     | admin          | List all students      |
| GET    | `/students/me`   | student        | Own profile            |
| GET    | `/students/{id}` | admin, faculty | Single student profile |

---

### 📚 Subjects

| Method | Path                      | Role           | Description                      |
| ------ | ------------------------- | -------------- | -------------------------------- |
| GET    | `/subjects/`              | all            | List subjects (filtered by role) |
| POST   | `/subjects/`              | admin          | Create subject                   |
| PUT    | `/subjects/{id}`          | admin          | Update subject                   |
| DELETE | `/subjects/{id}`          | admin          | Delete subject                   |
| GET    | `/subjects/{id}/students` | faculty, admin | Enrolled students list           |

**POST /subjects/ → Request Body:**

```json
{
  "name": "Data Structures",
  "code": "CS301",
  "semester": 3,
  "faculty_id": "uuid"
}
```

---

### 📋 Attendance

| Method | Path                                  | Role           | Description                |
| ------ | ------------------------------------- | -------------- | -------------------------- |
| GET    | `/attendance/{subject_id}`            | faculty, admin | All attendance for subject |
| GET    | `/attendance/{subject_id}/student/me` | student        | Own attendance for subject |
| GET    | `/attendance/{subject_id}/summary`    | all            | % summary per student      |
| POST   | `/attendance/`                        | faculty        | Mark attendance            |
| PUT    | `/attendance/{id}`                    | faculty        | Edit attendance record     |

**POST /attendance/ → Request Body:**

```json
{
  "student_id": "uuid",
  "subject_id": "uuid",
  "date": "2024-11-15",
  "status": "present | absent | late"
}
```

**GET /attendance/{subject_id}/summary → Response:**

```json
[
  {
    "student_id": "uuid",
    "student_name": "string",
    "present": 18,
    "absent": 4,
    "late": 1,
    "total": 23,
    "percentage": 82.6,
    "is_at_risk": false
  }
]
```

---

### 📝 Marks

| Method | Path                  | Role           | Description                    |
| ------ | --------------------- | -------------- | ------------------------------ |
| GET    | `/marks/{subject_id}` | faculty, admin | All marks for subject          |
| GET    | `/marks/student/me`   | student        | Own marks (all subjects)       |
| POST   | `/marks/`             | faculty        | Create or update mark (upsert) |

**POST /marks/ → Request Body:**

```json
{
  "student_id": "uuid",
  "subject_id": "uuid",
  "type": "internal | assignment",
  "score": 34,
  "max_score": 50
}
```

---

### 📊 Analytics

| Method | Path                            | Role           | Description                   |
| ------ | ------------------------------- | -------------- | ----------------------------- |
| GET    | `/analytics/attendance-trend`   | faculty, admin | 30-day daily attendance trend |
| GET    | `/analytics/grade-distribution` | faculty, admin | Score distribution buckets    |
| GET    | `/analytics/at-risk`            | faculty, admin | Students flagged as at-risk   |
| GET    | `/analytics/subject-comparison` | admin          | Cross-subject performance     |

**Query params for analytics:**

- `subject_id` (required for faculty, optional for admin)
- `days` (optional, default 30)

**GET /analytics/at-risk → Response:**

```json
[
  {
    "student_id": "uuid",
    "student_name": "string",
    "attendance_percentage": 68.0,
    "average_score_percentage": 38.5,
    "risk_reasons": ["low_attendance", "low_marks"]
  }
]
```

---

## Risk Thresholds (hardcoded — do not change without team agreement)

```
Attendance at-risk:  < 75%
Marks at-risk:       < 40% of max_score
```

---

## Error Response Shape

All errors follow this format:

```json
{
  "detail": "Human readable error message"
}
```

| Status | Meaning                           |
| ------ | --------------------------------- |
| 400    | Bad request / validation error    |
| 401    | Missing or invalid token          |
| 403    | Valid token but insufficient role |
| 404    | Resource not found                |
| 422    | Pydantic validation failed        |
| 500    | Internal server error             |

---

## Change Log

| Date   | Change                   | Who  |
| ------ | ------------------------ | ---- |
| [DATE] | Initial contract defined | Both |
