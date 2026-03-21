import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { SkeletonCard, EmptyState } from '@/components/ui';
import { BookOpen, Lock } from 'lucide-react';
import api from '@/lib/api';

const CURRENT_SEM = 4;
const semLabelMap = { 1:'1-1', 2:'1-2', 3:'2-1', 4:'2-2', 5:'3-1', 6:'3-2', 7:'4-1', 8:'4-2' };

const ELECTIVE_SLOTS = {
  5: [{ slot: 'PE1', label: 'Professional Elective I', group: 'PE1' }, { slot: 'PE2', label: 'Professional Elective II', group: 'PE2' }],
  6: [{ slot: 'OE1', label: 'Open Elective I', group: 'OE1' }, { slot: 'PE3', label: 'Professional Elective III', group: 'PE3' }],
  7: [{ slot: 'PE4', label: 'Professional Elective IV', group: 'PE4' }, { slot: 'PE5', label: 'Professional Elective V', group: 'PE5' }, { slot: 'OE2', label: 'Open Elective II', group: 'OE2' }],
  8: [{ slot: 'PE6', label: 'Professional Elective VI', group: 'PE6' }, { slot: 'OE3', label: 'Open Elective III', group: 'OE3' }],
};

const SLOT_PREFIX = { PE1:'CS51', PE2:'CS52', PE3:'CS63', PE4:'CS74', PE5:'CS75', PE6:'CS86', OE1:'CS61', OE2:'CS72', OE3:'CS83' };

function ElectiveDropdown({ options, slot, sem, onSelect, onCancel }) {
  const [selected, setSelected] = useState('');
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginTop:4 }}>
      <select value={selected} onChange={e => setSelected(e.target.value)} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--input-bg)', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:'0.875rem', minWidth:220, outline:'none' }}>
        <option value=''>Select a subject...</option>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.code} — {opt.name}</option>)}
      </select>
      <button disabled={!selected} onClick={() => onSelect(selected)} style={{ background: selected ? 'var(--accent)' : 'var(--bg-elevated)', border:'none', borderRadius:6, padding:'6px 14px', cursor: selected ? 'pointer' : 'not-allowed', color: selected ? '#fff' : 'var(--text-muted)', fontSize:'0.8rem', fontWeight:600 }}>Confirm</button>
      <button onClick={onCancel} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'6px 14px', cursor:'pointer', color:'var(--text-secondary)', fontSize:'0.8rem' }}>Cancel</button>
    </div>
  );
}

function ElectiveSlotRow({ slot, sem, allSubjects, registered, deadlines, onRegister, role }) {
  const [selecting, setSelecting] = useState(false);
  const deadline = deadlines[slot.slot];
  const isLocked = deadline ? new Date() > new Date(deadline) : false;
  const prefix = SLOT_PREFIX[slot.slot];
  const options = allSubjects.filter(s => s.code && prefix && s.code.startsWith(prefix) && s.subject_type === 'elective');

  if (registered) {
    const subj = registered.subjects || allSubjects.find(s => s.id === registered.subject_id);
    return (
      <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--accent-subtle)' }}>
        <td style={{ padding:'12px 16px' }}><span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.75rem', color:'var(--accent)' }}>{subj?.code || '—'}</span></td>
        <td style={{ padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{subj?.name || 'Unknown'}</span>
            <span style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:700 }}>({slot.label})</span>
            {!isLocked && role === 'student' && (
              <button onClick={() => setSelecting(true)} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.7rem', marginLeft:8 }}>Change</button>
            )}
            {isLocked && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:2 }}><Lock size={12}/> Locked</span>}
          </div>
          {selecting && <ElectiveDropdown options={options} slot={slot} sem={sem} onSelect={(id) => { onRegister(id, slot.slot, sem); setSelecting(false); }} onCancel={() => setSelecting(false)} />}
        </td>
        <td style={{ padding:'12px 16px', textAlign:'center', color:'var(--text-secondary)' }}>{subj?.credits || 3}</td>
        <td style={{ padding:'12px 16px', textAlign:'center' }}><span style={{ background:'var(--bg-elevated)', color:'var(--text-muted)', borderRadius:9999, padding:'2px 10px', fontSize:'0.7rem', fontWeight:700 }}>Elective</span></td>
        <td style={{ padding:'12px 16px' }}><span style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontStyle:'italic' }}>—</span></td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
      <td style={{ padding:'12px 16px' }}><span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>—</span></td>
      <td style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <span style={{ color:'var(--text-muted)', fontStyle:'italic', fontSize:'0.875rem' }}>{slot.label} — Not selected</span>
          {role === 'student' && !isLocked && (
            <>
              {!selecting ? (
                <button onClick={() => setSelecting(true)} style={{ alignSelf:'flex-start', background:'var(--accent)', border:'none', borderRadius:6, padding:'5px 14px', cursor:'pointer', color:'#fff', fontSize:'0.8rem', fontWeight:600, fontFamily: 'var(--font-display)' }}>+ Choose Elective</button>
              ) : (
                <ElectiveDropdown options={options} slot={slot} sem={sem} onSelect={(id) => { onRegister(id, slot.slot, sem); setSelecting(false); }} onCancel={() => setSelecting(false)} />
              )}
            </>
          )}
          {isLocked && <span style={{ fontSize:'0.75rem', color:'var(--accent-red)', display:'flex', alignItems:'center', gap:4 }}><Lock size={12} /> Registration closed</span>}
        </div>
      </td>
      <td style={{ padding:'12px 16px', textAlign:'center', color:'var(--text-muted)' }}>3</td>
      <td style={{ padding:'12px 16px', textAlign:'center' }}><span style={{ background:'var(--bg-elevated)', color:'var(--text-muted)', borderRadius:9999, padding:'2px 10px', fontSize:'0.7rem', fontWeight:700 }}>Elective</span></td>
      <td />
    </tr>
  );
}

function SubjectRow({ subj, sem, role }) {
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [editing, setEditing] = useState(false);
  const [syllabusText, setSyllabusText] = useState(subj.syllabus_text || '');
  const [saving, setSaving] = useState(false);

  const typeColors = {
    core: { bg:'var(--accent-blue-bg)', color:'var(--accent-blue)' },
    lab: { bg:'var(--accent-green-bg)', color:'var(--accent-green)' },
    elective: { bg:'var(--accent-subtle)', color:'var(--accent)' },
    mc: { bg:'var(--bg-elevated)', color:'var(--text-muted)' },
  };
  const tc = typeColors[subj.subject_type] || typeColors.core;

  return (
    <>
      <tr style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <td style={{ padding:'12px 16px' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subj.code}</span></td>
        <td style={{ padding:'12px 16px', color:'var(--text-primary)', fontWeight: 500 }}>{subj.name}</td>
        <td style={{ padding:'12px 16px', textAlign:'center', color:'var(--text-secondary)' }}>{subj.credits}</td>
        <td style={{ padding:'12px 16px', textAlign:'center' }}><span style={{ background: tc.bg, color: tc.color, borderRadius: 9999, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>{subj.subject_type}</span></td>
        <td style={{ padding:'12px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {subj.syllabus_text ? (
              <button onClick={() => setShowSyllabus(s => !s)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {showSyllabus ? 'Hide' : 'View'}
              </button>
            ) : (
              <span style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontStyle:'italic' }}>Not uploaded</span>
            )}
            
            {(role === 'faculty' || role === 'admin') && (
              !editing && <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem' }}>{subj.syllabus_text ? 'Edit' : 'Add'}</button>
            )}
          </div>

          {editing && (
            <div style={{ marginTop:8 }}>
              <textarea value={syllabusText} onChange={e => setSyllabusText(e.target.value)} rows={6} style={{ width:'100%', padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--input-bg)', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:'0.85rem', resize:'vertical', outline: 'none' }} placeholder="Enter syllabus units, topics..." />
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await api.patch(`/courses/subjects/${subj.id}/syllabus`, { syllabus_text: syllabusText });
                      subj.syllabus_text = syllabusText; 
                      setEditing(false);
                    } catch(e) {
                      alert('Save failed');
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:6, padding:'5px 14px', cursor: saving ? 'not-allowed' : 'pointer', fontSize:'0.8rem' }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'5px 14px', cursor:'pointer', color:'var(--text-secondary)', fontSize:'0.8rem' }}>Cancel</button>
              </div>
            </div>
          )}
        </td>
      </tr>
      {showSyllabus && subj.syllabus_text && !editing && (
        <tr>
          <td colSpan={5} style={{ padding: '0 16px 16px 48px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', paddingTop: 12 }}>
              {subj.syllabus_text}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CoursesPage() {
  const { role } = useAuthStore();
  const [allSubjects, setAllSubjects] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [deadlines, setDeadlines] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(CURRENT_SEM);

  useEffect(() => {
    Promise.all([
      api.get('/courses/subjects'),
      api.get('/courses/my-electives'),
      api.get('/courses/deadlines'),
    ]).then(([subs, regs, dlns]) => {
      setAllSubjects(Array.isArray(subs) ? subs : []);
      setMyRegistrations(Array.isArray(regs) ? regs : []);
      setDeadlines(dlns || {});
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const registeredMap = myRegistrations.reduce((acc, r) => { acc[r.slot] = r; return acc; }, {});
  const subjectsBySem = allSubjects.reduce((acc, s) => {
    const key = Number(s.semester);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const handleRegister = async (subjectId, slot, semester) => {
    try {
      const res = await api.post('/courses/register-elective', { subject_id: subjectId, slot, semester });
      setMyRegistrations(prev => {
        const filtered = prev.filter(r => r.slot !== slot);
        return [...filtered, res];
      });
    } catch (err) {
      console.error('Registration failed:', err);
      let errMsg = err.message;
      if (err.data && err.data.detail) errMsg = err.data.detail;
      alert('Failed to register: ' + errMsg);
    }
  };

  if (loading) return <div style={{ padding: 24 }}><SkeletonCard /></div>;

  const coreSubjects = (subjectsBySem[activeSem] || []).filter(s => s.subject_type !== 'elective');
  const totalCredits = coreSubjects.reduce((sum, s) => sum + s.credits, 0) + (ELECTIVE_SLOTS[activeSem] || []).length * 3;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>My Courses</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>R22 B.Tech CSE — KPRIT Hyderabad</p>
      </div>

      <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>📍 Current Semester: II Year II Semester (2-2)</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Academic Year 2024-25</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
          <button
            key={sem}
            onClick={() => setActiveSem(sem)}
            style={{ padding: '6px 16px', borderRadius: 9999, border: activeSem === sem ? 'none' : '1px solid var(--border)', background: activeSem === sem ? 'var(--accent)' : 'transparent', color: activeSem === sem ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {semLabelMap[sem]}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Semester {semLabelMap[activeSem]}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Total Credits: {totalCredits}</p>
          </div>
          {activeSem < CURRENT_SEM && <span style={{ background:'var(--accent-green-bg)', color:'var(--accent-green)', border:'1px solid var(--accent-green-border)', borderRadius:9999, padding:'4px 12px', fontSize:'0.75rem', fontWeight:700 }}>✓ Completed</span>}
          {activeSem === CURRENT_SEM && <span style={{ background:'var(--accent-subtle)', color:'var(--accent)', border:'1px solid var(--accent)', borderRadius:9999, padding:'4px 12px', fontSize:'0.75rem', fontWeight:700 }}>● In Progress</span>}
          {activeSem > CURRENT_SEM && <span style={{ background:'var(--bg-elevated)', color:'var(--text-muted)', border:'1px solid var(--border)', borderRadius:9999, padding:'4px 12px', fontSize:'0.75rem', fontWeight:700 }}>○ Upcoming</span>}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding:'10px 16px', textAlign:'left', color:'var(--text-muted)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', width:80 }}>Code</th>
                <th style={{ padding:'10px 16px', textAlign:'left', color:'var(--text-muted)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase' }}>Subject</th>
                <th style={{ padding:'10px 16px', textAlign:'center', color:'var(--text-muted)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', width:80 }}>Credits</th>
                <th style={{ padding:'10px 16px', textAlign:'center', color:'var(--text-muted)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', width:100 }}>Type</th>
                <th style={{ padding:'10px 16px', textAlign:'left', color:'var(--text-muted)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase' }}>Syllabus</th>
              </tr>
            </thead>
            <tbody>
              {coreSubjects.map(subj => <SubjectRow key={subj.id} subj={subj} sem={activeSem} role={role} />)}
              {(ELECTIVE_SLOTS[activeSem] || []).map(slot => (
                <ElectiveSlotRow key={slot.slot} slot={slot} sem={activeSem} allSubjects={allSubjects} registered={registeredMap[slot.slot]} deadlines={deadlines} onRegister={handleRegister} role={role} />
              ))}
              {coreSubjects.length === 0 && (!ELECTIVE_SLOTS[activeSem] || ELECTIVE_SLOTS[activeSem].length === 0) && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No courses populated for this semester.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
