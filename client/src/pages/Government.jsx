import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  FiPhone, FiMapPin, FiSearch, FiShield, FiClock,
  FiAlertTriangle, FiActivity, FiNavigation, FiChevronRight,
  FiZap, FiCopy, FiCheckCircle, FiHeart, FiSmile, FiExternalLink,
  FiFileText, FiCreditCard
} from 'react-icons/fi';
import {
  MdAccountBalance, MdArticle, MdCardTravel, MdTerrain, MdLightbulb
} from 'react-icons/md';

/* ── Constants ──────────────────────────────────────────── */
const TYPES = ['nid', 'schemes', 'passport', 'land', 'utility', 'other'];

const TYPE_META = {
  nid: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: FiCreditCard, label: 'NID & Identity' },
  schemes: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: FiFileText, label: 'Gov Schemes' },
  passport: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdCardTravel, label: 'Passport & Visa' },
  land: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: MdTerrain, label: 'Land Services' },
  utility: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: FiZap, label: 'Utility Bills' },
  other: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdAccountBalance, label: 'Other' },
};

const IMPORTANT_LINKS = [
  { label: 'Bangladesh Portal', sublabel: 'bangladesh.gov.bd', color: '#3B82F6', Icon: MdAccountBalance, link: 'https://bangladesh.gov.bd' },
  { label: 'NID Service', sublabel: 'services.nidw.gov.bd', color: '#10B981', Icon: FiCreditCard, link: 'https://services.nidw.gov.bd' },
  { label: 'E-Passport', sublabel: 'epassport.gov.bd', color: '#F59E0B', Icon: MdCardTravel, link: 'https://epassport.gov.bd' },
  { label: 'Land Ministry', sublabel: 'minland.gov.bd', color: '#EF4444', Icon: MdTerrain, link: 'https://minland.gov.bd' },
  { label: 'Birth Registration', sublabel: 'bdris.gov.bd', color: '#06B6D4', Icon: FiFileText, link: 'https://bdris.gov.bd' },
];

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

/* ── Main Component ───────────────────────────────────── */
export default function GovernmentPage() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const typeFilter = params.get('type') || '';

  const isDark = theme === 'dark';

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page, limit: 12, category: 'government',
        ...(typeFilter && typeFilter !== 'all' && { subtype: typeFilter }),
        ...(search && { search }),
      });
      const { data } = await api.get(`/directory?${q}`);
      if (data.data && data.data.rows) {
        setServices(data.data.rows);
        setTotal(data.data.total);
        setPages(data.data.pages || Math.ceil(data.data.total / 12));
      } else {
        setServices([]);
        setTotal(0);
        setPages(1);
      }
    } catch {
      setServices([]);
      setTotal(0);
      setPages(1);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]); // eslint-disable-line
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(); };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ════════════════ HERO SECTION ════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #021a14 0%, #062b20 40%, #0a1f24 100%)'
          : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #cffafe 100%)',
        padding: '4rem 0 3rem',
      }}>
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.06,
          backgroundImage: `linear-gradient(var(--green) 1px, transparent 1px),
                            linear-gradient(90deg, var(--green) 1px, transparent 1px)`,
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
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                color: 'var(--green)', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--green)',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                {t("government.hero_badge") || "Official Government Portals"}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              Citizen <span style={{
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Services</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("government.hero_sub") || "Access all essential Bangladesh government services, digital forms, and social safety net programs."}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: t("government.stat_services") || 'Services', value: 350, suffix: '+', icon: <FiShield size={16} />, color: 'var(--green)' },
                { label: t("government.stat_portals") || 'Portals', value: 120, suffix: '+', icon: <MdAccountBalance size={16} />, color: 'var(--cyan)' },
                { label: t("government.stat_verified") || 'Official', value: 100, suffix: '%', icon: <FiCheckCircle size={16} />, color: 'var(--blue)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16, padding: '1rem 1.25rem', minWidth: 110, textAlign: 'center',
                }}>
                  <div style={{ color: s.color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                    <Counter end={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ IMPORTANT LINKS STRIP ════════════════ */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '1.5rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <FiZap size={14} style={{ color: 'var(--amber)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {t("government.quick_links") || "Important Portals"}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '4.75rem',
          }}>
            {IMPORTANT_LINKS.map((h, i) => {
              const Icon = h.Icon;
              return (
                <a
                  key={h.label}
                  href={h.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: `linear-gradient(135deg, ${h.color}10, ${h.color}06)`,
                    border: `1px solid ${h.color}28`,
                    borderRadius: 14, padding: '0.85rem 1rem',
                    textDecoration: 'none', cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(12px)',
                    transitionDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = h.color + '60';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${h.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = h.color + '28';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `${h.color}18`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: h.color,
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: h.color }}>
                        {h.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: 600, lineHeight: 1.2, marginTop: 2 }}>{h.sublabel}</div>
                  </div>
                  <FiExternalLink size={14} style={{ color: h.color, opacity: 0.6, flexShrink: 0 }} />
                </a>
              );
            })}
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
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-dim)', pointerEvents: 'none',
              }} size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("government.search_placeholder") || "Search by service name (e.g. NID, Passport, Bill)..."}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem', background: '#10B981', borderColor: '#10B981' }}>
              <FiSearch size={14} /> {t("common.search")}
            </button>
          </form>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiActivity size={11} style={{ marginRight: 4 }} />{t("common.filter")}:
            </span>
            <button
              onClick={() => { setParams({}); setPage(1); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                background: !typeFilter ? 'var(--green)' : 'transparent',
                borderColor: !typeFilter ? 'var(--green)' : 'var(--border-2)',
                color: !typeFilter ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t("government.all") || "All Services"}
            </button>
            {TYPES.map(tp => {
              const m = TYPE_META[tp];
              const active = typeFilter === tp;
              const Icon = m.icon;
              return (
                <button
                  key={tp}
                  onClick={() => { setParams({ type: tp }); setPage(1); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                    background: active ? m.color : 'transparent',
                    borderColor: active ? m.color : 'var(--border-2)',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.color = m.color; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                >
                  <Icon size={12} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {typeFilter && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: TYPE_META[typeFilter]?.bg,
                color: TYPE_META[typeFilter]?.color,
                border: `1px solid ${TYPE_META[typeFilter]?.color}30`,
                padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
              }}>
                {React.createElement(TYPE_META[typeFilter]?.icon, { size: 12 })}
                {' '}{TYPE_META[typeFilter]?.label}
              </span>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{total}</strong> {t("government.found") || "services found"}</>}
            </span>
          </div>
          {typeFilter && (
            <button
              onClick={() => { setParams({}); setPage(1); }}
              style={{
                fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t("government.clear_filter") || "Clear all"} ×
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '1.5rem', minHeight: 180,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[60, 100, 80, 40].map((w, j) => (
                    <div key={j} style={{
                      height: j === 0 ? 40 : 12, width: `${w}%`, borderRadius: 8,
                      background: 'var(--surface-3)',
                      animation: 'shimmer 1.6s infinite',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <MdAccountBalance size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("government.no_results") || "No government services found"}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("government.no_results_sub") || "Try adjusting your search or filter."}</div>
            <button onClick={() => { setParams({}); setSearch(''); setPage(1); fetchData(); }} className="btn btn-outline btn-sm">
              {t("government.reset") || "Reset Filters"}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {services.map((s, i) => {
              const meta = TYPE_META[s.subtype] || TYPE_META.other;
              const Icon = meta.icon;
              return (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 18, padding: '1.5rem', position: 'relative',
                    overflow: 'hidden', transition: 'all 0.24s cubic-bezier(0.4,0,0.2,1)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(20px)',
                    transitionDelay: `${Math.min(i * 50, 300)}ms`,
                    display: 'flex', flexDirection: 'column'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = meta.color + '40';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${meta.color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${meta.color}, transparent)`,
                    borderRadius: '18px 18px 0 0',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: meta.bg, border: `1px solid ${meta.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: meta.color,
                    }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {s.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiCheckCircle size={9} /> Official
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: `${meta.color}15`, color: meta.color,
                        border: `1px solid ${meta.color}30`,
                        padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                      }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.6rem', fontSize: '1.1rem', lineHeight: 1.35,
                  }}>
                    {(isBn && s.name_bn) ? s.name_bn : s.name}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
                    {(isBn && s.description_bn) ? s.description_bn : (s.description || 'No description available for this service.')}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} style={{
                        flex: 1, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--surface-2)', color: 'var(--text)', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--border)', fontSize: '0.85rem'
                      }}>
                        <FiPhone size={14} style={{ marginRight: 6 }} /> Helpline
                      </a>
                    )}
                    {s.website ? (
                      <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noreferrer" style={{
                        flex: 1.5, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: meta.color, color: '#fff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', gap: 6, textDecoration: 'none', fontSize: '0.85rem'
                      }}>
                        Apply Online <FiExternalLink size={14} />
                      </a>
                    ) : (
                      <div style={{
                        flex: 1.5, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--surface-3)', color: 'var(--text-dim)', borderRadius: '12px', fontWeight: 700, border: 'none', gap: 6, fontSize: '0.85rem'
                      }}>
                        Apply Online
                      </div>
                    )}
                  </div>
                </div>
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

      {/* ════════════════ SAFETY TIPS ════════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(16,185,129,0.12)', color: 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCheckCircle size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{t("government.tips_title") || "Using Digital Services"}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t("government.tips_sub") || "Important points to remember when using online government portals."}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiShield, color: '#10B981', title: "Verify URL", desc: "Always check that the website ends in .gov.bd before entering details." },
              { Icon: FiClock, color: '#F59E0B', title: "Patience", desc: "Some government sites might be slow during peak hours. Try in the evening." },
              { Icon: FiAlertTriangle, color: '#E63946', title: "Beware of Scams", desc: "Government will never ask for your passwords or PINs via phone call." },
              { Icon: FiFileText, color: '#3B82F6', title: "Keep Documents Ready", desc: "Have scanned copies of NID, photos, and certificates before applying." },
            ].map((tip, i) => {
              const Icon = tip.Icon;
              return (
                <div key={i} style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '1.25rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  transition: 'all 0.22s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = tip.color + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${tip.color}15`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: tip.color,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 4 }}>{tip.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{tip.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity:1; transform:scale(1); }
          50%       { opacity:0.5; transform:scale(1.4); }
        }
        @keyframes shimmer {
          0%   { opacity:0.5; }
          50%  { opacity:1; }
          100% { opacity:0.5; }
        }
      `}</style>
    </div>
  );
}