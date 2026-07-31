import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiClock, FiUser, FiDollarSign, FiSend, FiUpload, FiBriefcase, FiZap, FiShield, FiXCircle, FiGlobe, FiCheckCircle } from 'react-icons/fi';

export default function JobDetail() {
  const { id } = useParams();
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isAuth, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [cover, setCover] = useState('');
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data.data)).catch(() => { }).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('cover_letter', cover);
      if (resume) fd.append('resume', resume);
      await api.post(`/jobs/${id}/apply`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(isBn ? 'আবেদন সফলভাবে পাঠানো হয়েছে!' : 'Application submitted successfully!');
      setApplied(true); setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Application failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" /></div>;
  if (!job) return <div className="empty"><div className="empty-icon"><FiXCircle size={48} style={{ opacity: 0.4 }} /></div><div>Job not found</div></div>;

  const TYPE_COLOR = { 'full-time': 'var(--green)', 'part-time': 'var(--cyan)', 'freelance': 'var(--purple)', 'internship': 'var(--amber)', 'govt': 'var(--red)' };

  return (
    <div>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0d0005 0%, #130008 40%, #080E1A 100%)'
          : 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 40%, #f1f5f9 100%)',
        padding: '4rem 0 3rem',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px', width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(230,57,70,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%', width: 300, height: 300, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.06,
          backgroundImage: `linear-gradient(var(--red) 1px, transparent 1px),
                            linear-gradient(90deg, var(--red) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)',
                color: 'var(--red)', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                {isBn ? 'চাকরির বিস্তারিত' : 'Job Details'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.25rem' }}>
              <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ minWidth: 120 }}><FiArrowLeft size={13} />{t('common.back')}</Link>
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {isBn ? 'চাকরির বিস্তারিত দেখুন' : 'View Job Details'}<br />
              <span style={{
                background: 'linear-gradient(135deg, #E63946, #ff6b6b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {isBn ? 'দ্রুত আবেদন করুন' : 'Apply swiftly'}
              </span>{' '}{isBn ? 'এবং ঠিক চাকরি পান' : 'and find the right role'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {isBn ? 'এই পৃষ্ঠায় চাকরির বিবরণ, আবেদনের তথ্য এবং নিয়োগকারীর যোগাযোগ দেখুন।' : 'See job description, application details, and employer contact on one page.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: isBn ? 'পূর্ণ বিবরণ' : 'Full Details', value: isBn ? 'সরাসরি' : 'Complete', icon: <FiBriefcase size={16} />, color: 'var(--red)' },
                { label: isBn ? 'আবেদন' : 'Apply', value: isBn ? 'সহজ' : 'Easy', icon: <FiZap size={16} />, color: 'var(--cyan)' },
                { label: isBn ? 'নিরাপদ' : 'Trusted', value: isBn ? 'ভেরিফাইড' : 'Verified', icon: <FiShield size={16} />, color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16, padding: '1rem 1.25rem', minWidth: 110, textAlign: 'center',
                }}>
                  <div style={{ color: s.color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: `${TYPE_COLOR[job.type]}18`, color: TYPE_COLOR[job.type] }}>{job.type}</span>
                {job.is_remote && <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiGlobe size={13} /> Remote</span>}
                <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span>
              </div>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>{(isBn && job.title_bn) ? job.title_bn : job.title}</h1>
              <div style={{ fontSize: '1.1rem', color: 'var(--cyan)', fontWeight: 700, marginBottom: '1.5rem' }}>{(isBn && job.company_bn) ? job.company_bn : job.company}</div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                {job.district && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiMapPin size={13} />{job.district}{job.division && `, ${job.division}`}</span>}
                {job.salary_min && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiDollarSign size={13} />৳{Number(job.salary_min).toLocaleString()}{job.salary_max && `–${Number(job.salary_max).toLocaleString()}`}</span>}
                {job.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiClock size={13} />{isBn ? 'শেষ তারিখ' : 'Deadline'}: {new Date(job.deadline).toLocaleDateString()}</span>}
                {job.poster_name && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiUser size={13} />{job.poster_name}</span>}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>{isBn ? 'বিস্তারিত বিবরণ' : 'Job Description'}</h3>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{(isBn && job.description_bn) ? job.description_bn : job.description}</div>
              </div>
              {job.requirements && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>{isBn ? 'যোগ্যতা ও প্রয়োজনীয়তা' : 'Requirements'}</h3>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{job.requirements}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem', fontSize: '0.83rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{isBn ? 'ধরন' : 'Type'}</span>
                  <span style={{ fontWeight: 600, color: TYPE_COLOR[job.type] }}>{job.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{isBn ? 'বিভাগ' : 'Category'}</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{job.category}</span>
                </div>
                {job.salary_min && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{isBn ? 'বেতন' : 'Salary'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--green)' }}>৳{Number(job.salary_min).toLocaleString()}+</span>
                </div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{isBn ? 'দেখেছেন' : 'Views'}</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{job.views}</span>
                </div>
              </div>

              {job.external_link ? (
                <a href={job.external_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }}>
                  <FiGlobe size={14} />{isBn ? 'মূল ওয়েবসাইটে আবেদন করুন' : 'Apply on Original Website'}
                </a>
              ) : !applied ? (
                isAuth ? (
                  <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }}>
                    <FiSend size={14} />{t('jobs.apply')}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                    {t('nav.login')} {isBn ? 'করে আবেদন করুন' : 'to Apply'}
                  </Link>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--green-light)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiCheckCircle size={16} /> {isBn ? 'আবেদন পাঠানো হয়েছে' : 'Application Submitted'}
                </div>
              )}
              {!job.external_link && job.poster_email && (
                <a href={`mailto:${job.poster_email}`} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                  {t('common.contact')} Employer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 500, padding: '2rem', animation: 'fadeUp 0.25s ease' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 5, color: '#fff' }}>{t('jobs.apply')}: {(isBn && job.title_bn) ? job.title_bn : job.title}</h2>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{(isBn && job.company_bn) ? job.company_bn : job.company}</p>
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isBn ? 'আপনার নাম' : 'Your Name'}</label>
                  <input type="text" value={user?.name || ''} disabled className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed', padding: '10px 14px', background: 'var(--surface-2)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isBn ? 'ফোন / ইমেইল' : 'Phone / Email'}</label>
                  <input type="text" value={user?.phone || user?.email || ''} disabled className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed', padding: '10px 14px', background: 'var(--surface-2)' }} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '-8px' }}>
                * {isBn ? 'আপনার প্রোফাইলের তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হবে।' : 'Your profile details will be attached automatically.'}
              </p>

              <div className="form-group">
                <label className="form-label">{isBn ? 'কভার লেটার' : 'Cover Letter'}</label>
                <textarea value={cover} onChange={e => setCover(e.target.value)} placeholder={isBn ? 'নিজের সম্পর্কে সংক্ষেপে লিখুন...' : 'Briefly introduce yourself...'} className="form-textarea" style={{ minHeight: 110 }} />
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'রেজুমে (PDF/DOC)' : 'Resume (PDF/DOC)'}</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', border: '2px dashed var(--border)', borderRadius: 10, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <FiUpload size={16} style={{ color: 'var(--text-dim)' }} />
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{resume ? resume.name : (isBn ? 'ফাইল বেছে নিন' : 'Choose file')}</span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? <div className="spinner spinner-sm" /> : t('common.submit')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
