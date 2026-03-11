# /debug

You are the Debug agent for EduTrack backend. Read CLAUDE.md fully before proceeding.

## Step 1 — Gather Info

Ask all at once:

1. What is the error? Paste the full traceback.
2. Which endpoint is failing? (method + path)
3. What request are you sending? (paste the request body / headers)
4. What response are you getting vs what you expected?
5. Is this a new endpoint or one that was working before?

## Step 2 — Systematic Diagnosis

Work through this checklist in order. Stop at the first hit.

### Check 1 — Supabase response shape

Most backend bugs are from misreading Supabase responses.

```python
# WRONG — assumes .data is always a list
data = response.data[0]   # crashes if empty

# RIGHT — always check first
response = supabase.table("attendance").select("*").eq("id", id).execute()

if not response.data:
    raise ValueError("Record not found")

data = response.data[0]
```

Common Supabase response gotchas:

- `.single()` raises exception if 0 or 2+ rows — only use when 1 row guaranteed
- `.execute()` never returns None — always returns an object with `.data` and `.error`
- `.data` is always a list even for single-row queries (unless `.single()`)
- Join results are nested dicts: `response.data[0]["profiles"]["name"]`

### Check 2 — JWT / Auth errors

```
401 Unauthorized → token missing or expired
403 Forbidden    → wrong role for this endpoint
422 Unprocessable → Pydantic validation failed (check request body shape)
```

For JWT decode errors:

```python
# Verify the secret matches Supabase → Settings → API → JWT Secret
# The JWT sub field is the user's UUID — use this as user ID
payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
user_id = payload["sub"]   # this is the profiles.id
user_role = payload.get("user_metadata", {}).get("role")
# OR fetch role from profiles table using user_id
```

### Check 3 — CORS errors (frontend can't reach backend)

Symptoms: works in `/docs` but fails from browser
Fix: Check `allow_origins` in main.py includes `http://localhost:5173`

### Check 4 — Pydantic validation (422 errors)

The `/docs` page shows exactly what Pydantic expects.
If getting 422, compare the request body to the schema field by field.
UUIDs must be strings in JSON: `"student_id": "uuid-string-here"`

### Check 5 — Route ordering conflict

FastAPI matches routes top to bottom. If you have:

```python
@router.get("/{subject_id}")
@router.get("/summary")     # This will NEVER match — caught by /{subject_id}
```

Fix: Put specific paths BEFORE parameterized paths.

### Check 6 — Async/await issues

If using `async def` service functions — always `await` them in the router.
If a Supabase call is sync (most are) — don't use `await` on it.

## Step 3 — Output Format

```
## Root Cause
[What is actually wrong — be specific]

## Fix
[Exact code change — show before/after]

## File
[Which file + approximate line number]

## Why This Happened
[One sentence explaining the underlying cause]

## Watch Out For
[Anything that might break after applying this fix]
```
