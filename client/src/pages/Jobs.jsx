import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  FiPlus, FiBriefcase, FiMapPin, FiClock, FiArrowRight,
  FiSearch, FiUsers, FiDollarSign, FiHome, FiZap,
  FiShield, FiCheckCircle, FiGlobe
} from 'react-icons/fi';
import SortDropdown from '../components/ui/SortDropdown';

const TYPES = ['full-time', 'part-time', 'freelance', 'internship', 'govt'];
const TYPE_COLORS = {
  'full-time': '#10B981',
  'part-time': '#06B6D4',
  'freelance': '#8B5CF6',
  'internship': '#F59E0B',
  'govt': '#E63946'
};

export default function Jobs({ forcedType = '', forcedRemote = false, title = '', subtitle = '' }) {
  const { t, isBn } = useLang();
  const { isAuth } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [params, setParams] = useSearchParams();
  const typeFilter = forcedType || params.get('type') || '';
  const querySearch = params.get('search') || '';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(querySearch);
  const [remote, setRemote] = useState(forcedRemote);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  useEffect(() => {
    setSearch(querySearch);
    setPage(1);
  }, [typeFilter, querySearch]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page, limit: 12,
        ...(typeFilter && { type: typeFilter }),
        ...(querySearch && { search: querySearch }),
        ...(remote && { remote: 'true' }),
        ...(params.get('sort') && { sort: params.get('sort') })
      });
      const { data } = await api.get(`/jobs?${q}`);
      setJobs(data.data.rows);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, typeFilter, querySearch, remote, params.get('sort')]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(params);
    if (search) newParams.set('search', search);
    else newParams.delete('search');
    setParams(newParams);
  };

  const handleType = (tp) => {
    const newParams = new URLSearchParams(params);
    if (tp) newParams.set('type', tp);
    else newParams.delete('type');
    setParams(newParams);
  };

  // For stats in hero
  const stats = [
    { label: 'Jobs Available', value: total, icon: <FiBriefcase size={16} />, color: 'var(--purple)' },
    { label: 'Categories', value: TYPES.length, icon: <FiZap size={16} />, color: 'var(--cyan)' },
    { label: 'Remote Friendly', value: 'Many', icon: <FiGlobe size={16} />, color: 'var(--green)' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ════════════════ HERO SECTION ════════════════ */}
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
                {t("jobs.hero_badge")}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px',
            }}>
              {title || t("jobs.hero_title")}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #E63946, #ff6b6b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {title ? '' : t("jobs.hero_highlight")}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {subtitle || t("jobs.hero_sub")}
            </p>
            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16, padding: '1rem 1.25rem', minWidth: 120, textAlign: 'center',
                }}>
                  <div style={{ color: s.color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {/* Search + Filters */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.25rem', marginBottom: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-dim)', pointerEvents: 'none',
              }} size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("jobs.search_placeholder")}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem' }}>
              <FiSearch size={14} /> {isBn ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          {(!forcedType && !forcedRemote) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
                <FiBriefcase size={11} style={{ marginRight: 4 }} /> Type:
              </span>
              <button
                onClick={() => handleType('')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                  cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                  background: !typeFilter ? 'var(--cyan)' : 'transparent',
                  borderColor: !typeFilter ? 'var(--cyan)' : 'var(--border-2)',
                  color: !typeFilter ? '#fff' : 'var(--text-muted)',
                }}
              >
                {isBn ? 'সকল ধরন' : 'All Types'}
              </button>
              {TYPES.map(tp => {
                const active = typeFilter === tp;
                return (
                  <button
                    key={tp}
                    onClick={() => handleType(tp)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                      background: active ? TYPE_COLORS[tp] : 'transparent',
                      borderColor: active ? TYPE_COLORS[tp] : 'var(--border-2)',
                      color: active ? '#fff' : TYPE_COLORS[tp],
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.borderColor = TYPE_COLORS[tp];
                        e.currentTarget.style.background = `${TYPE_COLORS[tp]}10`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--border-2)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {t(`jobs.${tp.replace('-', '')}`) || tp}
                  </button>
                );
              })}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700, color: remote ? 'var(--cyan)' : 'var(--text-muted)',
                background: remote ? 'rgba(6,182,212,0.08)' : 'var(--surface-2)',
                border: `1px solid ${remote ? 'var(--cyan)' : 'var(--border-2)'}`,
                padding: '6px 14px', borderRadius: 999, transition: 'all 0.18s',
                userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={e => setRemote(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--cyan)' }}
                />
                <FiHome size={12} /> {isBn ? 'রিমোট' : 'Remote only'}
              </label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
            {typeFilter && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${TYPE_COLORS[typeFilter]}18`,
                color: TYPE_COLORS[typeFilter],
                border: `1px solid ${TYPE_COLORS[typeFilter]}30`,
                padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
              }}>
                <FiBriefcase size={12} /> {typeFilter}
              </span>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{total}</strong> {t("jobs.found")}</>}
            </span>
          </div>
          {isAuth && (
            <Link to="/jobs/new" className="btn btn-primary btn-sm">
              <FiPlus size={14} /> {t('jobs.post')}
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 18, padding: '1.5rem', minHeight: 140,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[60, 100, 80].map((w, j) => (
                    <div key={j} style={{
                      height: j === 0 ? 24 : 12, width: `${w}%`, borderRadius: 8,
                      background: 'var(--surface-3)', animation: 'shimmer 1.6s infinite',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <FiBriefcase size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{isBn ? 'কোনো চাকরি পাওয়া যায়নি' : 'No jobs found'}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{isBn ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন' : 'Try adjusting your search or filters'}</div>
            <button onClick={() => { setSearch(''); setRemote(false); handleType(''); }} className="btn btn-outline btn-sm">
              {isBn ? 'রিসেট ফিল্টার' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {jobs.map(job => {
              const color = TYPE_COLORS[job.type] || 'var(--cyan)';
              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 18, padding: '1.25rem 1.5rem',
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = `${color}40`;
                      e.currentTarget.style.boxShadow = `0 12px 30px ${color}18`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: `linear-gradient(90deg, ${color}, transparent)`,
                      borderRadius: '18px 18px 0 0',
                    }} />
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${color}18`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: color, flexShrink: 0, fontWeight: 700, fontSize: '1.1rem',
                    }}>
                      {job.company?.[0]?.toUpperCase() || <FiBriefcase size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <h3 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.97rem', marginBottom: 4 }}>
                            {(isBn && job.title_bn) ? job.title_bn : job.title}
                          </h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {(isBn && job.company_bn) ? job.company_bn : job.company}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: `${color}18`, color: color,
                            border: `1px solid ${color}30`,
                            padding: '2px 10px', borderRadius: 999,
                            fontSize: '0.65rem', fontWeight: 800,
                          }}>
                            {job.type}
                          </span>
                          {job.is_remote && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)',
                              border: '1px solid rgba(6,182,212,0.2)',
                              padding: '2px 8px', borderRadius: 999,
                              fontSize: '0.65rem', fontWeight: 700,
                            }}>
                              <FiHome size={10} /> Remote
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: 8, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {job.district && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiMapPin size={11} style={{ color }} /> {job.district}
                          </span>
                        )}
                        {job.salary_min && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiDollarSign size={11} style={{ color: 'var(--green)' }} />
                            ৳{Number(job.salary_min).toLocaleString()}+
                          </span>
                        )}
                        {job.deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiClock size={11} style={{ color: 'var(--amber)' }} />
                            {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiUsers size={11} /> {job.applicants || 0} {isBn ? 'আবেদন' : 'applicants'}
                        </span>
                      </div>
                    </div>
                    <FiArrowRight size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: '2rem' }}>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2))
              .filter(p => p <= pages)
              .map(p => (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
}