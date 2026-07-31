import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FiPhone, FiMapPin, FiSearch, FiPlus, FiDroplet,
  FiCheckCircle, FiXCircle, FiArrowRight,
  FiShield, FiClock, FiUsers, FiLayers
} from 'react-icons/fi';
import SortDropdown from '../components/ui/SortDropdown';

const GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GROUP_COLORS = {
  'A+':'#E63946', 'A-':'#c1121f',
  'B+':'#06B6D4', 'B-':'#0284c7',
  'AB+':'#8B5CF6','AB-':'#6d28d9',
  'O+':'#10B981', 'O-':'#059669'
};

/* ── Animated Counter (same as Emergency page) ──── */
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

export default function Blood() {
  const { t, isBn } = useLang();
  const { isAuth } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams] = useSearchParams();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState({ blood_group: '', district: '' });
  const [showReg, setShowReg] = useState(false);
  const [myDonor, setMyDonor] = useState(null);
  const [regForm, setRegForm] = useState({
    blood_group: '', district: '', division: '', address: '', emergency_contact: ''
  });
  const [visible, setVisible] = useState(false);

  // Stats for hero counters
  const [stats, setStats] = useState({ registered: 0, available: 500, districts: 64 });

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  // Fetch main donor list
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 16, ...filter });
      if (searchParams.get('sort')) q.set('sort', searchParams.get('sort'));
      const { data } = await api.get(`/blood-donors?${q}`);
      setDonors(data.data.rows);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonors(); }, [page, filter.blood_group, filter.district, searchParams.get('sort')]); // eslint-disable-line

  // Fetch hero stats (available & districts) - graceful fallback
  useEffect(() => {
    api.get('/blood-donors/stats')
      .then(({ data }) => {
        if (data?.data) {
          setStats({
            registered: data.data.registered || 0,
            available: data.data.available || 500,
            districts: data.data.districts || 64,
          });
        }
      })
      .catch(() => {
        // Keep default fallback values
      });
  }, []);

  useEffect(() => {
    if (isAuth) api.get('/blood-donors/me').then(r => setMyDonor(r.data.data)).catch(() => {});
  }, [isAuth]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.blood_group) return toast.error('Blood group required');
    try {
      const { data } = await api.post('/blood-donors', regForm);
      setMyDonor(data.data);
      setShowReg(false);
      toast.success(isBn ? 'আপনার রেজিস্ট্রেশন অনুমোদনের জন্য পাঠানো হয়েছে!' : 'Registration submitted for admin review!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleAvail = async () => {
    try {
      const { data } = await api.put('/blood-donors/availability');
      setMyDonor(d => ({ ...d, is_available: data.data.is_available }));
      toast.success(data.message);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ════════════════ HERO SECTION ════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0f0a1e 0%, #140d28 40%, #080E1A 100%)'
          : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #f1f5f9 100%)',
        padding: '5rem 0 3.5rem',
      }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.06,
          backgroundImage: `linear-gradient(var(--purple) 1px, transparent 1px),
                            linear-gradient(90deg, var(--purple) 1px, transparent 1px)`,
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
            {/* Eyebrow badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                color: 'var(--purple)', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--purple)',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                Live Blood Donor Network
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)', fontWeight: 900,
              lineHeight: 1.05, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '800px',
            }}>
              {t('blood.title')}
            </h1>
            <p style={{
              color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 520, lineHeight: 1.7,
              margin: '0 auto 2.5rem',
            }}>
              {t('blood.sub')}
            </p>

            {/* Three counter cards */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap',
            }}>
              {/* Registered Donors – dynamic from total */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16, padding: '1.2rem 1.5rem', minWidth: 140, textAlign: 'center',
              }}>
                <div style={{ color: 'var(--purple)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
                  <FiUsers size={16} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                  {loading ? '...' : <Counter end={total} suffix="+" />}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Registered Donors
                </div>
              </div>

              {/* Available Now */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16, padding: '1.2rem 1.5rem', minWidth: 140, textAlign: 'center',
              }}>
                <div style={{ color: 'var(--green)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
                  <FiCheckCircle size={16} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                  <Counter end={stats.available} suffix="+" />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Available Now
                </div>
              </div>

              {/* Districts Covered */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16, padding: '1.2rem 1.5rem', minWidth: 140, textAlign: 'center',
              }}>
                <div style={{ color: 'var(--cyan)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
                  <FiMapPin size={16} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                  <Counter end={stats.districts} suffix="" />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Districts Covered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

        {/* Search + Filter Bar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.25rem', marginBottom: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          {/* Blood group filter buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4,
            }}>
              <FiDroplet size={11} style={{ marginRight: 4 }} /> Blood Group:
            </span>
            <button
              onClick={() => setFilter(f => ({ ...f, blood_group: '' }))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                background: !filter.blood_group ? 'var(--purple)' : 'transparent',
                borderColor: !filter.blood_group ? 'var(--purple)' : 'var(--border-2)',
                color: !filter.blood_group ? '#fff' : 'var(--text-muted)',
              }}
            >
              All Groups
            </button>
            {GROUPS.map(g => {
              const active = filter.blood_group === g;
              return (
                <button
                  key={g}
                  onClick={() => setFilter(f => ({ ...f, blood_group: g }))}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                    background: active ? GROUP_COLORS[g] : 'transparent',
                    borderColor: active ? GROUP_COLORS[g] : 'var(--border-2)',
                    color: active ? '#fff' : GROUP_COLORS[g],
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = GROUP_COLORS[g];
                      e.currentTarget.style.background = `${GROUP_COLORS[g]}10`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border-2)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <FiDroplet size={11} /> {g}
                </button>
              );
            })}
          </div>

          {/* District / Search row */}
          <form onSubmit={(e) => { e.preventDefault(); fetchDonors(); }} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-dim)', pointerEvents: 'none',
              }} size={16} />
              <input
                value={filter.district}
                onChange={e => setFilter(f => ({ ...f, district: e.target.value }))}
                placeholder={isBn ? 'জেলা লিখুন...' : 'Search by district...'}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem' }}>
              <FiSearch size={14} /> Search
            </button>
          </form>
        </div>

        {/* Result meta & actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
            {filter.blood_group && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${GROUP_COLORS[filter.blood_group]}20`,
                color: GROUP_COLORS[filter.blood_group],
                border: `1px solid ${GROUP_COLORS[filter.blood_group]}30`,
                padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
              }}>
                <FiDroplet size={12} /> {filter.blood_group}
              </span>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {loading ? 'Searching...' : <><strong style={{ color: 'var(--text)' }}>{total}</strong> donors found</>}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAuth && myDonor && (
              <button onClick={toggleAvail} className={`btn ${myDonor.is_available ? 'btn-secondary' : 'btn-primary'}`} style={{ fontSize: '0.85rem' }}>
                {myDonor.is_available ? <><FiXCircle size={14} /> {t('blood.unavailable')}</> : <><FiCheckCircle size={14} /> {t('blood.available')}</>}
              </button>
            )}
            {isAuth && !myDonor && (
              <button onClick={() => setShowReg(true)} className="btn btn-primary">
                <FiPlus size={14} /> {t('blood.register')}
              </button>
            )}
          </div>
        </div>

        {/* Donor Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 18, padding: '1.5rem', minHeight: 180,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[60, 100, 80, 40].map((w, j) => (
                    <div key={j} style={{
                      height: j === 0 ? 40 : 12, width: `${w}%`, borderRadius: 8,
                      background: 'var(--surface-3)', animation: 'shimmer 1.6s infinite',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <FiDroplet size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>No donors found</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Try adjusting your filters</div>
            <button onClick={() => { setFilter({ blood_group: '', district: '' }); setPage(1); fetchDonors(); }} className="btn btn-outline btn-sm">
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}>
            {donors.map((d, i) => {
              const bgColor = GROUP_COLORS[d.blood_group] || 'var(--purple)';
              return (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 18, padding: '1.5rem', position: 'relative',
                    overflow: 'hidden', transition: 'all 0.24s cubic-bezier(0.4,0,0.2,1)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(20px)',
                    transitionDelay: `${Math.min(i * 40, 250)}ms`,
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = bgColor + '40';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${bgColor}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${bgColor}, transparent)`,
                    borderRadius: '18px 18px 0 0',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${bgColor}20`, border: `1px solid ${bgColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: bgColor, fontWeight: 900, fontSize: '0.9rem',
                      boxShadow: `0 0 16px ${bgColor}33`,
                    }}>
                      {d.blood_group}
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      background: d.is_available ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                      color: d.is_available ? 'var(--green)' : 'var(--text-dim)',
                      border: `1px solid ${d.is_available ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)'}`,
                      padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                    }}>
                      {d.is_available ? <FiCheckCircle size={9} /> : <FiClock size={9} />}
                      {d.is_available ? t('blood.available') : t('blood.unavailable')}
                    </span>
                  </div>

                  <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.6rem', fontSize: '0.97rem', lineHeight: 1.35 }}>
                    {d.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.1rem' }}>
                    {d.district && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <FiMapPin size={11} style={{ color: bgColor, opacity: 0.7 }} />
                        {d.district}
                      </span>
                    )}
                    {d.last_donation && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        <FiClock size={10} style={{ color: bgColor, opacity: 0.6 }} />
                        {t('blood.lastDonation')}: {new Date(d.last_donation).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {d.phone && d.is_available ? (
                    <a
                      href={`tel:${d.phone}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        padding: '10px 14px', borderRadius: 12,
                        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
                        color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                        boxShadow: `0 4px 14px ${bgColor}30`,
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <FiPhone size={14} /> {t('common.contact')}
                    </a>
                  ) : (
                    <div style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--surface-3)', color: 'var(--text-dim)',
                      fontSize: '0.8rem', fontWeight: 600, textAlign: 'center',
                    }}>
                      {d.is_available ? 'No phone listed' : 'Not available'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pb-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1 bg-surface"
              style={{
                borderColor: 'var(--border)',
                color: page === 1 ? 'var(--text-dim)' : 'var(--text)',
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              {isBn ? 'পূর্ববর্তী' : 'Previous'}
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center`}
                style={{
                  background: page === p ? '#E63946' : 'var(--surface-2)',
                  color: page === p ? '#fff' : 'var(--text)',
                  border: page === p ? '1px solid #E63946' : '1px solid var(--border)',
                }}
              >
                {isBn ? p.toLocaleString('bn-BD') : p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1 bg-surface"
              style={{
                borderColor: 'var(--border)',
                color: page === pages ? 'var(--text-dim)' : 'var(--text)',
                opacity: page === pages ? 0.5 : 1,
              }}
            >
              {isBn ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* ════════════════ REGISTER DONOR MODAL ════════════════ */}
      {showReg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowReg(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{
            position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 24, width: '100%', maxWidth: 440, padding: '2rem',
            animation: 'fadeUp 0.25s ease',
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(139,92,246,0.12)', color: 'var(--purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiDroplet size={17} />
              </div>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>{t('blood.register')}</h2>
            </div>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{isBn ? 'রক্তের গ্রুপ' : 'Blood Group'} *</label>
                <select value={regForm.blood_group} onChange={e => setRegForm(f => ({ ...f, blood_group: e.target.value }))} className="form-select" required>
                  <option value="">{isBn ? 'বেছে নিন' : 'Select group'}</option>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিভাগ' : 'Division'}</label>
                  <input value={regForm.division} onChange={e => setRegForm(f => ({ ...f, division: e.target.value }))} placeholder="Dhaka" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                  <input value={regForm.district} onChange={e => setRegForm(f => ({ ...f, district: e.target.value }))} placeholder="Mirpur" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'জরুরি যোগাযোগ' : 'Emergency Contact'}</label>
                <input value={regForm.emergency_contact} onChange={e => setRegForm(f => ({ ...f, emergency_contact: e.target.value }))} placeholder="01XXXXXXXXX" className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{t('common.submit')}</button>
                <button type="button" onClick={() => setShowReg(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}