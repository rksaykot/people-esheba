import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import SortDropdown from '../components/ui/SortDropdown';
import DistrictDropdown from '../components/ui/DistrictDropdown';
import {
  FiPhone, FiMapPin, FiSearch, FiShield, FiClock,
  FiAlertTriangle, FiActivity, FiNavigation, FiChevronRight,
  FiZap, FiCopy, FiCheckCircle, FiHeart, FiSmile
} from 'react-icons/fi';
import {
  MdLocalHospital, MdLocalPolice, MdLocalFireDepartment,
  MdAirlineSeatReclineNormal, MdPsychology, MdSupportAgent
} from 'react-icons/md';

/* ── Constants ──────────────────────────────────────────── */
const TYPES = ['police', 'fire', 'ambulance', 'mental', 'other'];

const TYPE_META = {
  police: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: MdLocalPolice, label: 'Police' },
  fire: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdLocalFireDepartment, label: 'Fire' },
  ambulance: { color: '#E63946', bg: 'rgba(230,57,70,0.1)', icon: MdAirlineSeatReclineNormal, label: 'Ambulance' },
  mental: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdPsychology, label: 'Mental' },
  other: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: MdSupportAgent, label: 'Other' },
};

/* Critical hotlines */
const HOTLINES = [
  { number: '999', label: 'National Emergency', sublabel: 'Police · Fire · Ambulance', color: '#E63946', Icon: FiAlertTriangle },
  { number: '199', label: 'Fire Service', sublabel: 'Fire & Civil Defence', color: '#F59E0B', Icon: MdLocalFireDepartment },
  { number: '1090', label: 'Poison Control', sublabel: 'NIMH Helpline', color: '#8B5CF6', Icon: FiAlertTriangle },
  { number: '16789', label: 'Women Helpline', sublabel: 'National Women Helpline', color: '#EC4899', Icon: FiHeart },
  { number: '1098', label: 'Child Helpline', sublabel: 'Shishu Helpline', color: '#10B981', Icon: FiSmile },
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

/* ── Copy Button ──────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? 'var(--green)' : 'var(--text-dim)',
      display: 'flex', alignItems: 'center', padding: 4,
      borderRadius: 6, transition: 'all 0.2s',
    }}>
      {copied ? <FiCheckCircle size={13} /> : <FiCopy size={13} />}
    </button>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function EmergencyPage() {
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
        page, limit: 12,
        ...(typeFilter && { type: typeFilter }),
        ...(search && { search }),
        ...(params.get('district') && { district: params.get('district') }),
        ...(params.get('sort') && { sort: params.get('sort') }),
      });
      const { data } = await api.get(`/emergency?${q}`);
      if (data.data && data.data.rows) {
        const nonHospitalRows = data.data.rows.filter(r => r.type !== 'hospital');
        setServices(nonHospitalRows);
        setTotal(data.data.total - (data.data.rows.length - nonHospitalRows.length));
        setPages(data.data.pages);
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

  useEffect(() => { fetchData(); }, [page, typeFilter, search, params.get('sort'), params.get('district')]); // eslint-disable-line
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(); };

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
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(230,57,70,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
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
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--red)',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                {t("emergency.live_badge")}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t("emergency.hero_title")}<br />
              <span style={{
                background: 'linear-gradient(135deg, #E63946, #ff6b6b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t("emergency.hero_highlight")}
              </span>{' '}Bangladesh
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("emergency.hero_sub")}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: t("emergency.stat_services"), value: 500, suffix: '+', icon: <FiShield size={16} />, color: 'var(--red)' },
                { label: t("emergency.stat_districts"), value: 64, suffix: '', icon: <FiMapPin size={16} />, color: 'var(--cyan)' },
                { label: t("emergency.stat_verified"), value: 98, suffix: '%', icon: <FiCheckCircle size={16} />, color: 'var(--green)' },
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

      {/* ════════════════ HOTLINES STRIP ════════════════ */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '1.5rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <FiZap size={14} style={{ color: 'var(--amber)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {t("emergency.quick_dial")}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            {HOTLINES.map((h, i) => {
              const Icon = h.Icon;
              return (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
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
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: h.color, fontVariantNumeric: 'tabular-nums' }}>
                        {h.number}
                      </span>
                      <CopyBtn text={h.number} />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>{h.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 1 }}>{h.sublabel}</div>
                  </div>
                  <FiPhone size={14} style={{ color: h.color, opacity: 0.6, flexShrink: 0 }} />
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
                placeholder={t("emergency.search")}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem' }}>
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
                background: !typeFilter ? 'var(--red)' : 'transparent',
                borderColor: !typeFilter ? 'var(--red)' : 'var(--border-2)',
                color: !typeFilter ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t("emergency.all")}
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
                  <Icon size={12} /> {tp === 'all' ? t("emergency.all") : t("emergency." + tp)}
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
                {' '}{t("emergency." + typeFilter)}
              </span>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{total}</strong> {t("emergency.found")}</>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DistrictDropdown />
            <SortDropdown />
            {(typeFilter || params.get('district')) && (
              <button
                onClick={() => { setParams({}); setPage(1); }}
                style={{
                  fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {t("emergency.clear_filter")} ×
              </button>
            )}
          </div>
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
            <MdLocalHospital size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("emergency.no_results")}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("emergency.no_results_sub")}</div>
            <button onClick={() => { setParams({}); setSearch(''); setPage(1); fetchData(); }} className="btn btn-outline btn-sm">
              {t("emergency.reset")}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {services.map((s, i) => {
              const meta = TYPE_META[s.type] || TYPE_META.other;
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
                    cursor: 'default',
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
                      {!!s.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiShield size={9} /> Verified
                        </span>
                      )}
                      {!!s.is_24h && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)',
                          border: '1px solid rgba(6,182,212,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiClock size={9} /> 24/7
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.6rem', fontSize: '0.97rem', lineHeight: 1.35,
                  }}>
                    {(isBn && s.name_bn) ? s.name_bn : s.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.1rem' }}>
                    {s.address && (
                      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <FiMapPin size={11} style={{ marginTop: 2, flexShrink: 0, color: meta.color, opacity: 0.7 }} />
                        {(isBn && s.address_bn) ? s.address_bn : s.address}
                      </span>
                    )}
                    {s.district && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        <FiNavigation size={10} style={{ color: meta.color, opacity: 0.6 }} />
                        {s.district}{s.division && `, ${s.division}`}
                      </span>
                    )}
                  </div>

                  {s.phone ? (
                    <a
                      href={`tel:${s.phone}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 12,
                        background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                        color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                        boxShadow: `0 4px 14px ${meta.color}30`,
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FiPhone size={14} /> {s.phone}
                      </span>
                      <FiChevronRight size={15} style={{ opacity: 0.7 }} />
                    </a>
                  ) : (
                    <div style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--surface-3)', color: 'var(--text-dim)',
                      fontSize: '0.8rem', fontWeight: 600, textAlign: 'center',
                    }}>
                      {t("emergency.no_phone")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
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
              background: 'rgba(230,57,70,0.12)', color: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAlertTriangle size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{t("emergency.tips_title")}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t("emergency.tips_sub")}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiAlertTriangle, color: '#E63946', title: t("emergency.tips.calm_title"), desc: t("emergency.tips.calm_desc") },
              { Icon: FiMapPin, color: '#06B6D4', title: t("emergency.tips.loc_title"), desc: t("emergency.tips.loc_desc") },
              { Icon: FiPhone, color: '#10B981', title: t("emergency.tips.call_title"), desc: t("emergency.tips.call_desc") },
              { Icon: FiHeart, color: '#F59E0B', title: t("emergency.tips.aid_title"), desc: t("emergency.tips.aid_desc") },
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