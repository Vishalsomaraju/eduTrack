import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/components/ui";

function Field({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: 4,
        fontFamily: "var(--font-display)",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "0.9rem",
        color: value ? "var(--text-primary)" : "var(--text-muted)",
        fontFamily: "var(--font-body)",
        fontStyle: value ? "normal" : "italic",
      }}>
        {value || "Not set"}
      </div>
    </div>
  );
}

function SectionCard({ title, sectionKey, children, onEdit, onSave, onCancel, editing, saving }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "clamp(1rem, 2vw, 1.5rem)",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border)",
      }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--text-primary)",
          margin: 0,
        }}>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {editing ? (
            <>
              <button onClick={onCancel} style={{
                padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
              }}>Cancel</button>
              <button onClick={onSave} disabled={saving} style={{
                padding: "4px 12px", borderRadius: 6, border: "none",
                background: "var(--accent)", color: "#fff", cursor: saving ? "not-allowed" : "pointer",
                fontSize: "0.8rem", opacity: saving ? 0.7 : 1,
              }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button onClick={onEdit} style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)",
              background: "transparent", color: "var(--text-secondary)", cursor: "pointer",
              fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4,
            }}>✎ Edit</button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--input-bg)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontSize: "0.875rem", outline: "none",
};

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    api.get("/auth/profile/me")
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (sectionKey) => {
    setEditing(sectionKey);
    setFormData(sectionKey === "personal" ? { ...data.profile } : { ...data.detail });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({});
  };

  const handleSave = async (sectionKey, endpoint) => {
    setSaving(true);
    try {
      await api.patch(endpoint, formData);
      const updatedData = { ...data };
      if (sectionKey === "personal") {
        updatedData.profile = { ...data.profile, ...formData };
      } else {
        updatedData.detail = { ...data.detail, ...formData };
      }
      setData(updatedData);
      setEditing(null);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return showToast("Image size must be less than 2MB", "error");
    }
    setAvatarUploading(true);
    try {
      const sessionData = await supabase.auth.getSession();
      const token = sessionData.data.session?.access_token;
      const formUpload = new FormData();
      formUpload.append("file", file);
      
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/auth/profile/me/avatar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formUpload
      });
      if (!res.ok) throw new Error("Failed to upload avatar");
      
      const responseData = await res.json();
      setData(p => ({ ...p, profile: { ...p.profile, avatar_url: responseData.avatar_url } }));
      showToast("Avatar updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: "1.5rem", alignItems: "start" }}>
      <div style={{ background: "var(--bg-surface)", borderRadius: 12, padding: 24, textAlign: "center", border: "1px solid var(--border)" }}>
        <div style={{ width: 120, height: 120, borderRadius: 9999, background: "var(--bg-elevated)", margin: "0 auto 16px" }} />
        <div style={{ height: 24, width: "60%", background: "var(--bg-elevated)", margin: "0 auto 8px", borderRadius: 4 }} />
        <div style={{ height: 16, width: "40%", background: "var(--bg-elevated)", margin: "0 auto 8px", borderRadius: 4 }} />
      </div>
      <div>
        <SkeletonCard /><div style={{ marginTop: 16 }}><SkeletonCard /></div><div style={{ marginTop: 16 }}><SkeletonCard /></div>
      </div>
    </div>
  );

  if (error) return <div style={{ color: "var(--accent-red)" }}>Error: {error}</div>;

  const { profile, detail } = data;
  const role = profile?.role;

  const initials = (!profile.name ? "??" : profile.name.trim().split(/\s+/).length === 1 ? profile.name.substring(0, 2).toUpperCase() : (profile.name.trim().split(/\s+/)[0][0] + profile.name.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase());

  const formatAdmissionType = (type) => ({ convenor: "Convenor Quota", management: "Management Quota", lateral_entry: "Lateral Entry" }[type] || type || "—");

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* LEFT PANEL */}
        <div style={{ position: isMobile ? "static" : "sticky", top: 72, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(1.25rem, 2vw, 1.5rem)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div 
            style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", marginBottom: 16 }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
            onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = 0}
          >
            {profile.avatar_url ? (
               <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
               <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--accent)" }}>{initials}</span>
            )}
            <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
              {avatarUploading ? <span style={{ color: "#fff", fontSize: "0.8rem" }}>Uploading...</span> : <Camera color="#fff" size={28} />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarUpload} />
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: "var(--text-primary)", textAlign: "center", margin: 0, marginTop: 16 }}>{profile.name}</h2>
          
          <div style={{ background: role === "student" ? "var(--accent-green-bg)" : role === "admin" ? "var(--accent-blue-bg)" : "var(--accent-glow)", color: role === "student" ? "var(--accent-green)" : role === "admin" ? "var(--accent-blue)" : "var(--accent-hover)", padding: "4px 12px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "capitalize", marginTop: 12, border: `1px solid ${role === "student" ? "var(--accent-green-border)" : role === "admin" ? "var(--accent-blue-border)" : "var(--border)"}` }}>{role}</div>
          
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: 8 }}>{profile.email}</div>
          {profile.department && <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", marginTop: 4 }}>{profile.department} Department</div>}
          
          <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

          {role === "student" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {["📅 Year " + (detail?.year || "—"), "📚 Sem " + (detail?.semester || "—"), "🎓 " + formatAdmissionType(detail?.admission_type)].map((txt, i) => (
                <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 9999, padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{txt}</div>
              ))}
            </div>
          )}

          {(role === "faculty" || role === "admin") && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 9999, padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>💼 {detail?.designation || "Faculty"}</div>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 9999, padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>⭐ {detail?.experience_years || 0} yrs</div>
            </div>
          )}

          <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

          <div style={{ width: "100%" }}>
             <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 700, fontFamily: "var(--font-display)" }}>MEMBER SINCE</div>
             <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: 4 }}>
               {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
             </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div>
          {/* Section 1 */}
          <SectionCard title="Personal Information" sectionKey="personal" editing={editing === "personal"} saving={saving} onEdit={() => handleEdit("personal")} onCancel={handleCancel} onSave={() => handleSave("personal", "/auth/profile/me")}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px 24px" }}>
               {editing === "personal" ? (
                 <>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Full Name</div><input type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Phone</div><input type="text" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Date of Birth</div><input type="date" value={formData.date_of_birth || ""} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Gender</div>
                     <select value={formData.gender || ""} onChange={e => setFormData({...formData, gender: e.target.value})} style={inputStyle}>
                       <option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                     </select>
                   </div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Blood Group</div>
                     <select value={formData.blood_group || ""} onChange={e => setFormData({...formData, blood_group: e.target.value})} style={inputStyle}>
                       <option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                     </select>
                   </div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Aadhar Number</div><input type="text" value={formData.aadhar || ""} onChange={e => setFormData({...formData, aadhar: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Department</div><input type="text" value={formData.department || ""} onChange={e => setFormData({...formData, department: e.target.value})} style={inputStyle} /></div>
                   <div style={{ gridColumn: "1 / -1" }}><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Address</div>
                     <textarea value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} />
                   </div>
                 </>
               ) : (
                 <>
                   <Field label="Full Name" value={profile.name} /><Field label="Phone" value={profile.phone} /><Field label="Date of Birth" value={profile.date_of_birth} />
                   <Field label="Gender" value={profile.gender} /><Field label="Blood Group" value={profile.blood_group} />
                   <Field label="Aadhar Number" value={profile.aadhar ? `XXXX-XXXX-${profile.aadhar.slice(-4)}` : null} />
                   <Field label="Department" value={profile.department} />
                   <div style={{ gridColumn: "1 / -1" }}><Field label="Address" value={profile.address} /></div>
                 </>
               )}
            </div>
          </SectionCard>

          {/* Section 2 */}
          {role === "student" && (
            <SectionCard title="Academic Details" sectionKey="academic" editing={editing === "academic"} saving={saving} onEdit={() => handleEdit("academic")} onCancel={handleCancel} onSave={() => handleSave("academic", "/auth/profile/me/student")}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px 24px" }}>
                {editing === "academic" ? (
                  <>
                    <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Roll Number</div><input type="text" value={formData.roll_number || ""} onChange={e => setFormData({...formData, roll_number: e.target.value})} style={inputStyle} /></div>
                    <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Year</div>
                      <select value={formData.year || ""} onChange={e => setFormData({...formData, year: e.target.value ? parseInt(e.target.value) : null})} style={inputStyle}>
                        <option value="">Select...</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                      </select>
                    </div>
                    <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Semester</div>
                      <select value={formData.semester || ""} onChange={e => setFormData({...formData, semester: e.target.value ? parseInt(e.target.value) : null})} style={inputStyle}>
                        <option value="">Select...</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Admission Type</div>
                      <select value={formData.admission_type || ""} onChange={e => setFormData({...formData, admission_type: e.target.value})} style={inputStyle}>
                        <option value="">Select...</option><option value="convenor">Convenor Quota</option><option value="management">Management Quota</option><option value="lateral_entry">Lateral Entry</option>
                      </select>
                    </div>
                    <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Joined Date</div><input type="date" value={formData.joined_date || ""} onChange={e => setFormData({...formData, joined_date: e.target.value})} style={inputStyle} /></div>
                  </>
                ) : (
                  <>
                    <Field label="Roll Number" value={detail?.roll_number} />
                    <Field label="Year" value={detail?.year ? `${detail.year}${detail.year === 1?"st":detail.year === 2?"nd":detail.year === 3?"rd":"th"} Year` : null} />
                    <Field label="Semester" value={detail?.semester} />
                    <Field label="Admission Type" value={formatAdmissionType(detail?.admission_type)} />
                    <Field label="Joined Date" value={detail?.joined_date} />
                  </>
                )}
              </div>
            </SectionCard>
          )}

          {/* Section 3 */}
          {role === "student" && (
            <SectionCard title="Family Information" sectionKey="family" editing={editing === "family"} saving={saving} onEdit={() => handleEdit("family")} onCancel={handleCancel} onSave={() => handleSave("family", "/auth/profile/me/student")}>
              {editing === "family" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px 24px" }}>
                   <div style={{ gridColumn: "1 / -1", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginTop: 8 }}>Father Details</div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Name</div><input value={formData.father_name || ""} onChange={e => setFormData({...formData, father_name: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Phone</div><input value={formData.father_phone || ""} onChange={e => setFormData({...formData, father_phone: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Email</div><input value={formData.father_email || ""} onChange={e => setFormData({...formData, father_email: e.target.value})} style={inputStyle} /></div>
                   
                   <div style={{ gridColumn: "1 / -1", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginTop: 16 }}>Mother Details</div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Name</div><input value={formData.mother_name || ""} onChange={e => setFormData({...formData, mother_name: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Phone</div><input value={formData.mother_phone || ""} onChange={e => setFormData({...formData, mother_phone: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Email</div><input value={formData.mother_email || ""} onChange={e => setFormData({...formData, mother_email: e.target.value})} style={inputStyle} /></div>
                   
                   <div style={{ gridColumn: "1 / -1", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginTop: 16 }}>Guardian Details</div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Name</div><input value={formData.guardian_name || ""} onChange={e => setFormData({...formData, guardian_name: e.target.value})} style={inputStyle} /></div>
                   <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Phone</div><input value={formData.guardian_phone || ""} onChange={e => setFormData({...formData, guardian_phone: e.target.value})} style={inputStyle} /></div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "clamp(1rem, 1.5vw, 1.25rem)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 16 }}>Father</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Field label="Name" value={detail?.father_name} />
                      <Field label="Phone" value={detail?.father_phone} />
                      <Field label="Email" value={detail?.father_email} />
                    </div>
                  </div>
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "clamp(1rem, 1.5vw, 1.25rem)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 16 }}>Mother</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Field label="Name" value={detail?.mother_name} />
                      <Field label="Phone" value={detail?.mother_phone} />
                      <Field label="Email" value={detail?.mother_email} />
                    </div>
                  </div>
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "clamp(1rem, 1.5vw, 1.25rem)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 16 }}>Guardian (Optional)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {detail?.guardian_name || detail?.guardian_phone ? (
                        <>
                          <Field label="Name" value={detail.guardian_name} />
                          <Field label="Phone" value={detail.guardian_phone} />
                        </>
                      ) : (
                        <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>Not provided</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* Section 4 */}
          {(role === "faculty" || role === "admin") && (
            <SectionCard title="Professional Details" sectionKey="professional" editing={editing === "professional"} saving={saving} onEdit={() => handleEdit("professional")} onCancel={handleCancel} onSave={() => handleSave("professional", "/auth/profile/me/faculty")}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px 24px" }}>
                 {editing === "professional" ? (
                   <>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Employee ID</div><input value={formData.employee_id || ""} onChange={e => setFormData({...formData, employee_id: e.target.value})} style={inputStyle} /></div>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Designation</div><input value={formData.designation || ""} onChange={e => setFormData({...formData, designation: e.target.value})} style={inputStyle} /></div>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Qualification</div><input value={formData.qualification || ""} onChange={e => setFormData({...formData, qualification: e.target.value})} style={inputStyle} /></div>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Specialization</div><input value={formData.specialization || ""} onChange={e => setFormData({...formData, specialization: e.target.value})} style={inputStyle} /></div>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Experience (Years)</div><input type="number" value={formData.experience_years || ""} onChange={e => setFormData({...formData, experience_years: e.target.value ? parseInt(e.target.value) : null})} style={inputStyle} /></div>
                     <div><div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)" }}>Joined Date</div><div style={{ fontSize: "0.875rem", padding: "8px 0", color: "var(--text-muted)" }}>{detail?.joined_date || "Not set"}</div></div>
                   </>
                 ) : (
                   <>
                     <Field label="Employee ID" value={detail?.employee_id} />
                     <Field label="Designation" value={detail?.designation} />
                     <Field label="Qualification" value={detail?.qualification} />
                     <Field label="Specialization" value={detail?.specialization} />
                     <Field label="Experience" value={detail?.experience_years ? `${detail.experience_years} years` : null} />
                     <Field label="Joined Date" value={detail?.joined_date} />
                   </>
                 )}
              </div>
            </SectionCard>
          )}

          {/* Section 5 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(1rem, 2vw, 1.5rem)", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", margin: 0, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              Account & Security
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Appearance</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Current theme: {theme === "dark" ? "Dark" : "Light"}</div>
              </div>
              <button onClick={toggleTheme} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}>
                Toggle Theme
              </button>
            </div>
            <button
              onClick={async () => { await signOut(); navigate("/login"); }}
              style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 8, border: "none", background: "var(--accent-red)", color: "#fff", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem" }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 72, right: 16, background: toast.type === "error" ? "var(--accent-red)" : "var(--accent-green)", color: "#fff", padding: "12px 24px", borderRadius: 8, zIndex: 100, boxShadow: "var(--shadow-md)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
          {toast.message}
        </div>
      )}
    </>
  );
}
