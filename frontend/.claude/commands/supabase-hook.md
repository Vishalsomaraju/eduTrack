# /supabase-hook

You are the API Integration agent for EduTrack. Read CLAUDE.md fully before proceeding.

## Your Scope

You ONLY touch:

- `src/hooks/` — creating or editing hooks
- `src/lib/supabase.js` — only if the client setup needs fixing
- `src/stores/authStore.js` — only if auth state needs updating

You do NOT touch components, pages, or animation files.

## Step 1 — Gather Info

Ask all at once:

1. What data does this hook need to provide?
2. Which Supabase table(s) does it read from or write to?
3. Does it need real-time updates? (yes/no)
4. Which role(s) will use this hook? (admin / faculty / student)
5. What actions does it need to support? (read / create / update / delete)

## Step 2 — Choose the Right Hook Pattern

### Pattern A — Read only, no real-time

Use when: student viewing their own marks, loading subject list, etc.

```js
// src/hooks/useSubjects.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useSubjects(semesterId) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubjects() {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", semesterId)
        .order("name");

      if (error) setError(error.message);
      else setSubjects(data);
      setLoading(false);
    }

    if (semesterId) fetchSubjects();
  }, [semesterId]);

  return { subjects, loading, error };
}
```

### Pattern B — Read + real-time subscription

Use when: live attendance view, class stats updating as faculty marks attendance.
THIS IS THE CORE REAL-TIME PATTERN. Never deviate from this structure.

```js
// src/hooks/useAttendance.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAttendance(subjectId) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subjectId) return;

    // 1. Initial fetch
    async function fetchAttendance() {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, profiles(name, avatar_url)")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setAttendance(data);
      setLoading(false);
    }

    fetchAttendance();

    // 2. Real-time subscription
    const channel = supabase
      .channel(`attendance-${subjectId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "attendance",
          filter: `subject_id=eq.${subjectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAttendance((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setAttendance((prev) =>
              prev.map((row) =>
                row.id === payload.new.id ? payload.new : row,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            setAttendance((prev) =>
              prev.filter((row) => row.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    // 3. ALWAYS clean up — this is non-negotiable
    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjectId]);

  return { attendance, loading, error };
}
```

### Pattern C — Read + write actions (no real-time)

Use when: faculty uploading marks, admin creating subjects.

```js
// src/hooks/useMarks.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useMarks(subjectId) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch logic here...
  }, [subjectId]);

  async function upsertMark({ studentId, score, maxScore, type }) {
    setSaving(true);
    const { data, error } = await supabase
      .from("marks")
      .upsert(
        {
          student_id: studentId,
          subject_id: subjectId,
          score,
          max_score: maxScore,
          type,
        },
        { onConflict: "student_id,subject_id,type" },
      )
      .select()
      .single();

    if (error) setError(error.message);
    else setMarks((prev) => [...prev.filter((m) => m.id !== data.id), data]);
    setSaving(false);
    return { data, error };
  }

  return { marks, loading, saving, error, upsertMark };
}
```

## Step 3 — Table Reference

Always use these exact table and column names:

```
profiles:     id, role, name, email, avatar_url, created_at
subjects:     id, name, code, semester, faculty_id, created_at
enrollments:  id, student_id, subject_id, created_at
attendance:   id, student_id, subject_id, date, status (present|absent|late), created_at
marks:        id, student_id, subject_id, type (internal|assignment), score, max_score, created_at
```

## Step 4 — Auth-Aware Queries

When a hook should only return data for the logged-in user:

```js
import { useAuth } from "@/hooks/useAuth";

// Inside the hook:
const { user } = useAuth()
  // Filter by current user:
  .eq("student_id", user.id);
```

Row Level Security (RLS) in Supabase handles this on the backend too,
but always filter on the frontend as well for clarity.

## Step 5 — Output

Provide:

1. Complete hook file
2. File path: `src/hooks/useHookName.js`
3. The exact import line for the component that will use it
4. Usage example (5 lines max showing how a component consumes this hook)
5. If real-time: confirm the cleanup is in place

## Hard Stops

- NEVER write supabase calls inline in a component — hooks only
- NEVER forget the cleanup `return () => supabase.removeChannel(channel)`
- NEVER use TypeScript syntax (no types, no interfaces, no `.ts` extension)
- NEVER use `any` table or column names not in the schema above — ask if unsure
