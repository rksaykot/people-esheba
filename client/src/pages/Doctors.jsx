import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import {
  FiUser, FiSearch, FiMapPin, FiFilter, FiExternalLink,
  FiShield, FiAward, FiClock, FiHeart, FiStar, FiGlobe, FiChevronRight,
  FiPhone
} from 'react-icons/fi';
import { MdHealthAndSafety, MdScience, MdPerson, MdLocalHospital, MdSchool } from 'react-icons/md';
import SortDropdown from '../components/ui/SortDropdown';

/* ── Constants ──────────────────────────────────────────── */
const SPECIALTIES = [
  'Cardiologist', 'Pediatrician', 'Neurologist', 'Gynecologist',
  'Medicine', 'Orthopedic', 'Ophthalmologist', 'ENT', 'Dermatologist'
];

const SPECIALTY_META = {
  'Cardiologist': { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: MdHealthAndSafety, labelKey: 'health.cardio' },
  'Pediatrician': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdPerson, labelKey: 'health.pediatric' },
  'Neurologist': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdScience, labelKey: 'health.neuro' },
  'Gynecologist': { color: '#EC4899', bg: 'rgba(236,72,153,0.1)', icon: MdLocalHospital, labelKey: 'health.gyno' },
  'Medicine': { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: MdHealthAndSafety, labelKey: 'health.medicine' },
  'Orthopedic': { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: MdSchool, labelKey: 'health.ortho' },
  'Ophthalmologist': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: MdScience, labelKey: 'health.ophthalm' },
  'ENT': { color: '#F97316', bg: 'rgba(249,115,22,0.1)', icon: MdLocalHospital, labelKey: 'health.ent' },
  'Dermatologist': { color: '#A855F7', bg: 'rgba(168,85,247,0.1)', icon: MdHealthAndSafety, labelKey: 'health.derm' },
};

import { useApi } from '../hooks/useApi';

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

/* ── Main Doctors Component ─────────────────────────────── */
export default function Doctors() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, specialtyFilter]);

  /* Real data — managed from Admin → Doctors */
  const { data, loading } = useApi('/doctors', { 
    params: { 
      specialty: specialtyFilter || undefined, 
      search: search || undefined,
      sort: searchParams.get('sort') || undefined,
      page: currentPage,
      limit: itemsPerPage
    } 
  });
  const doctors = data?.rows || data || [];

  const totalPages = data?.pages || 0;
  const paginated = doctors;

  const getSpecialtyLabel = (s) => {
    const meta = SPECIALTY_META[s];
    return meta?.labelKey ? t(meta.labelKey) : s;
  };

  /* Bengali-aware display helpers — fall back to English if no _bn value */
  const dName = (item) => (isBn && item.name_bn) ? item.name_bn : item.name;
  const dArea = (item) => (isBn && item.area_bn) ? item.area_bn : item.area;
  const dSpecialty = (item) => {
    const meta = SPECIALTY_META[item.specialty];
    if (meta?.labelKey) return t(meta.labelKey); // known specialty — use fixed translation
    return (isBn && item.specialty_bn) ? item.specialty_bn : item.specialty; // free-text — use bulk-imported _bn
  };

  // Stats for hero section
  const stats = [
    { label: t("health.stat_doctors") || "Doctors Listed", value: 240, suffix: '+', icon: <FiUser size={16} />, color: '#8B5CF6' },
    { label: t("health.stat_specialties") || "Specialties", value: 38, suffix: '+', icon: <FiGlobe size={16} />, color: '#EC4899' },
    { label: t("health.stat_verified") || "Verified", value: 91, suffix: '%', icon: <FiShield size={16} />, color: '#10B981' },
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
        {/* Animated blobs */}
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
            ? 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
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
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                color: '#a78bfa', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#a78bfa',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                {t("health.doctors_live_badge") || "Verified Medical Professionals"}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t("health.doctors_title") || "Find Trusted Doctors"}<br />
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t("health.doctors_highlight") || "Across Bangladesh"}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("health.doctors_sub") || "Connect with certified specialists, check their schedules, and get the care you deserve."}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {stats.map(s => (
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

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

        {/* Search + Filter Bar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.25rem', marginBottom: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-dim)', pointerEvents: 'none',
              }} size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("health.search_doctors") || "Search by name, specialty, or area..."}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 6, background: '#8b5cf6', borderColor: '#8b5cf6'
              }}
            >
              <FiSearch size={14} /> {t("common.search") || "Search"}
            </button>
          </div>

          {/* Specialty filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />{t("common.filter") || "Filter"}:
            </span>
            <button
              onClick={() => setSpecialtyFilter('')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                background: !specialtyFilter ? '#8B5CF6' : 'transparent',
                borderColor: !specialtyFilter ? '#8B5CF6' : 'var(--border-2)',
                color: !specialtyFilter ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t("health.all") || "All"}
            </button>
            {SPECIALTIES.map(sp => {
              const meta = SPECIALTY_META[sp];
              const active = specialtyFilter === sp;
              const Icon = meta.icon;
              return (
                <button
                  key={sp}
                  onClick={() => setSpecialtyFilter(sp)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                    background: active ? meta.color : 'transparent',
                    borderColor: active ? meta.color : 'var(--border-2)',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                >
                  <Icon size={12} /> {getSpecialtyLabel(sp)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{data?.total || 0}</strong> {t("health.found_doctors") || "doctors found"}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
          {(specialtyFilter || search) && (
            <button
              onClick={() => { setSearch(''); setSpecialtyFilter(''); }}
              style={{
                fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t("health.clear_filter") || "Clear all"} ×
            </button>
          )}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
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
        ) : paginated.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <FiFilter size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("health.no_results") || "No doctors found"}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("health.no_results_sub") || "Try adjusting your search or filter."}</div>
            <button onClick={() => { setSearch(''); setSpecialtyFilter(''); }} className="btn btn-outline btn-sm">
              {t("health.reset") || "Reset Filters"}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}>
            {paginated.map((item, i) => {
              const meta = SPECIALTY_META[item.specialty] || { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdHealthAndSafety };
              const Icon = meta.icon;
              return (
                <div
                  key={item.id}
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
                      {item.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(16,185,129,0.1)', color: '#10B981',
                          border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiShield size={9} /> Verified
                        </span>
                      )}
                      {item.rating && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                          border: '1px solid rgba(245,158,11,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiStar size={9} /> {item.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.3rem', fontSize: '0.97rem', lineHeight: 1.35,
                  }}>
                    {dName(item)}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px',
                    borderRadius: 10, background: meta.bg, color: meta.color,
                    display: 'inline-block', marginBottom: '0.8rem',
                  }}>
                    {dSpecialty(item)}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiMapPin size={11} style={{ flexShrink: 0, color: meta.color, opacity: 0.7 }} /> {dArea(item)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiPhone size={11} style={{ flexShrink: 0, color: meta.color, opacity: 0.7 }} /> {item.phone}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      <FiClock size={10} style={{ color: meta.color, opacity: 0.6 }} /> {item.hours}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px', borderRadius: 12, background: 'rgba(16,185,129,0.1)',
                        color: 'var(--green)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                        <FiPhone size={14} /> Call
                      </a>
                    )}
                    <button
                      onClick={() => window.open('#', '_blank')}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 12,
                        background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                        boxShadow: `0 4px 14px ${meta.color}30`,
                        transition: 'transform 0.2s', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <FiExternalLink size={14} /> Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1 bg-surface"
              style={{
                borderColor: 'var(--border)',
                color: currentPage === 1 ? 'var(--text-dim)' : 'var(--text)',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              {isBn ? 'পূর্ববর্তী' : 'Previous'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center`}
                style={{
                  background: currentPage === page ? '#3B82F6' : 'var(--surface-2)',
                  color: currentPage === page ? '#fff' : 'var(--text)',
                  border: currentPage === page ? '1px solid #3B82F6' : '1px solid var(--border)',
                }}
              >
                {isBn ? page.toLocaleString('bn-BD') : page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1 bg-surface"
              style={{
                borderColor: 'var(--border)',
                color: currentPage === totalPages ? 'var(--text-dim)' : 'var(--text)',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              {isBn ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* ════════════════ HEALTH TIPS SECTION ════════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(139,92,246,0.12)', color: '#8B5CF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAward size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                {t("health.tips_title") || "Choosing the Right Doctor"}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t("health.tips_sub") || "Simple steps to find a doctor you can trust."}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiShield, color: '#8B5CF6', title: t("health.tip_credentials") || "Check Credentials", desc: t("health.tip_credentials_desc") || "Look for board certification and educational background." },
              { Icon: FiHeart, color: '#EC4899', title: t("health.tip_reviews") || "Patient Reviews", desc: t("health.tip_reviews_desc") || "Read feedback from other patients about their experience." },
              { Icon: FiMapPin, color: '#10B981', title: t("health.tip_location") || "Convenient Location", desc: t("health.tip_location_desc") || "Choose a clinic that is accessible and close to your area." },
              { Icon: FiClock, color: '#F59E0B', title: t("health.tip_availability") || "Consultation Hours", desc: t("health.tip_availability_desc") || "Match the doctor's schedule with your own availability." },
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