import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiMapPin, FiSearch, FiPhone, FiShield, FiUsers,
  FiHeart, FiBook, FiAlertCircle, FiCoffee, FiFeather,
  FiMonitor, FiStar, FiCheckCircle, FiChevronRight, FiClock
} from 'react-icons/fi';
import SortDropdown from '../components/ui/SortDropdown';

/* ── Constants ──────────────────────────────────────────── */
const CATS = ['general', 'medical', 'education', 'disaster', 'food', 'environment', 'tech', 'other'];

const TYPE_META = {
  'general':     { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: FiUsers, label: 'General' },
  'medical':     { color: '#E63946', bg: 'rgba(230,57,70,0.1)', icon: FiHeart, label: 'Medical' },
  'education':   { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: FiBook, label: 'Education' },
  'disaster':    { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: FiAlertCircle, label: 'Disaster' },
  'food':        { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: FiCoffee, label: 'Food' },
  'environment': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: FiFeather, label: 'Environment' },
  'tech':        { color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: FiMonitor, label: 'Tech' },
  'other':       { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', icon: FiStar, label: 'Other' },
};

/* ── Animated Counter ─────────────────────────────────── */
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(end / 50);
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(t); }
          else setCount(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Volunteers() {
  const { t, isBn } = useLang();
  const { isAuth }  = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [params, setParams] = useSearchParams();
  const actionQuery = params.get('action');
  const catQuery = params.get('category') || '';
  const searchQuery = params.get('search') || '';

  const [vols, setVols]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [search, setSearch]   = useState(searchQuery);
  const [showReg, setShowReg] = useState(false);
  const [myVol, setMyVol]     = useState(null);
  const [regForm, setRegForm] = useState({ skills:'', availability:'', category:'general', division:'', district:'', bio:'' });

  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  useEffect(() => {
    setSearch(searchQuery);
    setPage(1);
  }, [catQuery, searchQuery]);

  useEffect(() => {
    if (actionQuery === 'register' && !myVol) setShowReg(true);
  }, [actionQuery, myVol]);

  const fetchVols = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit:12, ...(catQuery&&{category:catQuery}), ...(searchQuery&&{search:searchQuery}) });
      if (params.get('sort')) q.set('sort', params.get('sort'));
      const { data } = await api.get(`/volunteers?${q}`);
      setVols(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setVols([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVols(); }, [page, catQuery, searchQuery, params.get('sort')]); // eslint-disable-line
  useEffect(() => {
    if (isAuth) api.get('/volunteers/me').then(r=>setMyVol(r.data.data)).catch(()=>{});
  }, [isAuth]);

  const closeReg = () => {
    setShowReg(false);
    const newParams = new URLSearchParams(params);
    newParams.delete('action');
    setParams(newParams);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/volunteers', regForm);
      toast.success(isBn ? 'আপনার রেজিস্ট্রেশন অনুমোদনের জন্য পাঠানো হয়েছে!' : 'Registration submitted for admin review!');
      setShowReg(false);
      fetchVols();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCat = (c) => {
    const newParams = new URLSearchParams(params);
    if (c) newParams.set('category', c);
    else newParams.delete('category');
    setParams(newParams);
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams(params);
    if (search) newParams.set('search', search);
    else newParams.delete('search');
    setParams(newParams);
  };

  const stats = [
    { label: isBn ? 'স্বেচ্ছাসেবক' : 'Total Volunteers', value: total, icon: <FiUsers size={16} />, color: '#8B5CF6' },
    { label: isBn ? 'ক্যাটাগরি' : 'Categories', value: CATS.length, icon: <FiStar size={16} />, color: '#F59E0B' },
    { label: isBn ? 'সক্রিয়' : 'Active Duty', value: total > 0 ? Math.ceil(total * 0.8) : 0, icon: <FiCheckCircle size={16} />, color: '#10B981' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ════════════════ HERO SECTION ════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0f0a1f 0%, #170d2b 40%, #0d121f 100%)'
          : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #f0fdf4 100%)',
        padding: '4.5rem 0 3.5rem',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px', width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%', width: 300, height: 300, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                color: 'var(--purple)', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                {isBn ? 'সমাজসেবা' : 'Community Service'}
              </span>
            </div>
            
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.1, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '750px',
            }}>
              {t("volunteers.title")}{' '}
              <span style={{
                background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {isBn ? 'একসাথে' : 'Together'}
              </span>
            </h1>
            <p style={{
              fontSize: '1.1rem', color: 'var(--text-dim)', maxWidth: '600px',
              lineHeight: 1.6, marginBottom: '2.5rem',
            }}>
              {t("volunteers.sub") || "Join our community of volunteers and make a positive impact."}
            </p>

            <div style={{
              display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
              width: '100%', maxWidth: '600px',
            }}>
              <div style={{
                flex: '1 1 300px', display: 'flex', background: 'var(--surface)',
                borderRadius: 999, padding: '6px', border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: 'var(--text-muted)' }}>
                  <FiSearch size={18} />
                </div>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder={isBn ? 'নাম বা দক্ষতা খুঁজুন...' : 'Search by name or skill...'}
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    outline: 'none', fontSize: '0.95rem', color: 'var(--text)',
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: 'var(--purple)', color: '#fff', border: 'none',
                    padding: '10px 24px', borderRadius: 999, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  {isBn ? 'খুঁজুন' : 'Search'}
                </button>
              </div>
            </div>
            
            {isAuth && !myVol && (
              <button
                onClick={() => setShowReg(true)}
                style={{
                  marginTop: '1.5rem', background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 999,
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiHeart size={16} /> {t('volunteers.register')}
              </button>
            )}
            {myVol && (
              <div style={{
                marginTop: '1.5rem', padding: '10px 18px', background: 'var(--green-light)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, fontSize: '0.9rem',
                color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <FiCheckCircle size={16}/> {isBn ? 'আপনি নিবন্ধিত স্বেচ্ছাসেবক' : 'You are a registered volunteer'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════ STATS STRIP ════════════════ */}
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 20 }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.5rem', display: 'flex', justifyContent: 'center',
          gap: '3rem', flexWrap: 'wrap', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}>
          {stats.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${st.color}15`, color: st.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {st.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
                  <Counter end={st.value} suffix="+" />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {st.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        
        {/* Categories */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => handleCat('')}
            style={{
              padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: '0.85rem',
              border: !catQuery ? 'none' : '1px solid var(--border)',
              background: !catQuery ? 'var(--text)' : 'transparent',
              color: !catQuery ? 'var(--bg)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {isBn ? 'সব' : 'All'}
          </button>
          {CATS.map(c => {
            const meta = TYPE_META[c] || TYPE_META.other;
            const Icon = meta.icon;
            const isActive = catQuery === c;
            return (
              <button
                key={c}
                onClick={() => handleCat(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: '0.85rem',
                  border: isActive ? `1px solid ${meta.color}` : '1px solid var(--border)',
                  background: isActive ? meta.bg : 'transparent',
                  color: isActive ? meta.color : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Icon size={14} /> {meta.label}
              </button>
            );
          })}
        </div>

        {/* Result meta & actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? "Loading..." : <><strong style={{ color: 'var(--text)' }}>{total}</strong> volunteers found</>}
          </span>
          <SortDropdown />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : vols.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <FiUsers size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{t('common.noResults') || "No volunteers found"}</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid-4">
            {vols.map((v, i) => {
              const meta = TYPE_META[v.category] || TYPE_META.other;
              const Icon = meta.icon;
              return (
                <div key={v.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column',
                  animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: meta.bg, filter: 'blur(30px)', opacity: 0.5, borderRadius: '50%', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 16,
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#fff', fontSize: '1.2rem',
                      boxShadow: `0 4px 12px ${meta.color}40`,
                    }}>
                      {v.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: meta.bg, color: meta.color,
                      padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800,
                    }}>
                      <Icon size={10} /> {meta.label}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>{v.name}</h3>
                    {!!v.is_verified && <FiShield size={14} style={{ color: '#3B82F6' }} />}
                  </div>
                  
                  {v.district && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      <FiMapPin size={12} style={{ color: meta.color, opacity: 0.8 }} /> {v.district} {v.division && `(${v.division})`}
                    </div>
                  )}

                  {v.availability && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 12, background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 6 }}>
                      <FiClock size={10} /> {v.availability}
                    </div>
                  )}

                  {v.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                      {v.skills.split(',').slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{
                          background: 'var(--surface-3)', color: 'var(--text)',
                          border: '1px solid var(--border)',
                          padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                        }}>
                          {s.trim()}
                        </span>
                      ))}
                      {v.skills.split(',').length > 3 && (
                        <span style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{v.skills.split(',').length - 3}</span>
                      )}
                    </div>
                  )}

                  <div style={{ flex: 1 }} />
                  
                  {v.bio && (
                    <p style={{
                      fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', marginBottom: '1rem',
                      background: 'var(--surface-3)', padding: '8px 12px', borderRadius: 8,
                      borderLeft: `2px solid ${meta.color}`
                    }}>
                      "{v.bio}"
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button style={{
                      flex: 1, padding: '10px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <FiPlus size={14} /> Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: '3rem' }}>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= pages).map(p => (
              <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        )}
      </div>

      {/* ════════════════ REGISTER MODAL ════════════════ */}
      {showReg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={closeReg} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{
            position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 24, width: '100%', maxWidth: 500, padding: '2.5rem',
            animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiHeart size={20} />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', margin: 0 }}>{t('volunteers.register')}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{isBn ? 'দয়া করে সঠিক তথ্য প্রদান করুন' : 'Provide your details to join'}</p>
              </div>
            </div>
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{isBn ? 'ক্যাটাগরি' : 'Category'}</label>
                <select value={regForm.category} onChange={e => setRegForm(f => ({ ...f, category: e.target.value }))} className="form-select" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                  {CATS.map(c => <option key={c} value={c}>{TYPE_META[c]?.label || c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'দক্ষতা (কমা দিয়ে আলাদা করুন)' : 'Skills (comma-separated)'}</label>
                <input value={regForm.skills} onChange={e => setRegForm(f => ({ ...f, skills: e.target.value }))} placeholder="First Aid, Teaching, IT" className="form-input" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'উপলব্ধতা' : 'Availability'}</label>
                <input value={regForm.availability} onChange={e => setRegForm(f => ({ ...f, availability: e.target.value }))} placeholder="Weekends, Evenings" className="form-input" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিভাগ (এলাকা)' : 'Division'}</label>
                  <input value={regForm.division} onChange={e => setRegForm(f => ({ ...f, division: e.target.value }))} placeholder="Dhaka" className="form-input" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                  <input value={regForm.district} onChange={e => setRegForm(f => ({ ...f, district: e.target.value }))} placeholder="Mirpur" className="form-input" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'সংক্ষিপ্ত পরিচয়' : 'Bio'}</label>
                <textarea value={regForm.bio} onChange={e => setRegForm(f => ({ ...f, bio: e.target.value }))} placeholder={isBn ? 'নিজের সম্পর্কে সংক্ষেপে লিখুন...' : 'Brief intro...'} className="form-textarea" style={{ minHeight: 100, background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                <button type="submit" className="btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--purple)', color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 700 }}>
                  {t('common.submit')}
                </button>
                <button type="button" onClick={closeReg} className="btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)', padding: '12px', borderRadius: 12, fontWeight: 700 }}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
