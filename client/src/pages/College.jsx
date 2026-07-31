import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiBook, FiSearch, FiMapPin, FiFilter, FiExternalLink,
  FiShield, FiAward, FiClock, FiNavigation, FiChevronRight,
  FiZap, FiCopy, FiCheckCircle, FiHeart, FiSmile, FiGlobe
} from 'react-icons/fi';
import { MdAccountBalance, MdBusiness, MdSchool, MdEngineering, MdScience } from 'react-icons/md';
import SortDropdown from '../components/ui/SortDropdown';
import DistrictDropdown from '../components/ui/DistrictDropdown';
import DetailsModal from '../components/ui/DetailsModal';
import { useApi } from '../hooks/useApi';

/* ── Constants ──────────────────────────────────────────── */
const COLLEGE_TYPES = ['govt-college', 'private-college', 'madrasah', 'technical', 'other'];

const TYPE_META = {
  'govt-college': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdAccountBalance, labelKey: 'education.govt_college' },
  'private-college': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdBusiness, labelKey: 'education.private_college' },
  'madrasah': { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: MdSchool, labelKey: 'education.madrasah' },
  'technical': { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: MdEngineering, labelKey: 'education.technical' },
  'other': { color: '#E63946', bg: 'rgba(230,57,70,0.1)', icon: MdScience, labelKey: 'education.other_college' },
};

/* Maps an education_institutions row (type=college) into this page's shape */
function mapCollege(row, isBn) {
  const address = (isBn && row.address_bn) ? row.address_bn : row.address;
  return {
    id: row.id,
    type: COLLEGE_TYPES.includes(row.subtype) ? row.subtype : 'other',
    name: (isBn && row.name_bn) ? row.name_bn : row.name,
    area: address || row.district || '',
    district: row.district,
    description: (isBn && row.description_bn) ? row.description_bn : row.description,
    badge: TYPE_META[row.subtype]?.label || 'College',
    phone: row.phone,
    website: row.website,
    is_verified: !!row.is_verified,
  };
}

/* ── Animated Counter (replicated) ─────────────────────── */
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

/* ── Main College Component ────────────────────────────── */
export default function College() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const isDark = theme === 'dark';

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  /* Real data — managed from Admin → Education (type=college) */
  const { data, loading } = useApi('/education', { 
    params: { 
      type: 'college', 
      subtype: typeFilter || undefined, 
      search: search || undefined,
      district: searchParams.get('district') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: currentPage,
      limit: itemsPerPage
    } 
  });
  const colleges = (data?.rows || []).map(row => mapCollege(row, isBn));

  const totalPages = data?.pages || 0;
  const paginated = colleges;

  // Helper to get translated label, falling back to English names
  const getTypeLabel = (type) => {
    const meta = TYPE_META[type];
    if (meta?.labelKey) return t(meta.labelKey);
    return type.replace(/-/g, ' ');
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ════════════════ HERO SECTION ════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0b0500 0%, #1a1206 40%, #1a1016 100%)'
          : 'linear-gradient(135deg, #fffbf0 0%, #fff7e6 40%, #fdf2f8 100%)',
        padding: '4rem 0 3rem',
      }}>
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.06,
          backgroundImage: `linear-gradient(var(--cyan) 1px, transparent 1px),
                            linear-gradient(90deg, var(--cyan) 1px, transparent 1px)`,
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
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                color: '#F59E0B', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#F59E0B',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                {t("education.college_live_badge") || "Comprehensive College Directory"}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t("education.college_title") || "Discover Top Colleges"}<br />
              <span style={{
                background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t("education.college_highlight") || "For Your Future"}
              </span>{' '}Bangladesh
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("education.college_sub") || "Explore verified information on government colleges, private institutions, and specialized academies across the country."}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: t("education.stat_colleges") || "Colleges Listed", value: 320, suffix: '+', icon: <FiBook size={16} />, color: '#F59E0B' },
                { label: t("education.stat_districts") || "Districts", value: 64, suffix: '', icon: <FiMapPin size={16} />, color: 'var(--purple)' },
                { label: t("education.stat_verified") || "Verified", value: 88, suffix: '%', icon: <FiShield size={16} />, color: 'var(--green)' },
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
                placeholder={t("common.search_placeholder") || "Search colleges..."}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#F59E0B', borderColor: '#F59E0B',
              }}
            >
              <FiSearch size={14} /> {t("common.search") || "Search"}
            </button>
          </div>

          {/* Type filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />{t("common.filter") || "Filter"}:
            </span>
            <button
              onClick={() => setTypeFilter('')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                background: !typeFilter ? '#F59E0B' : 'transparent',
                borderColor: !typeFilter ? '#F59E0B' : 'var(--border-2)',
                color: !typeFilter ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t("education.all") || "All"}
            </button>
            {COLLEGE_TYPES.map(tp => {
              const m = TYPE_META[tp];
              const active = typeFilter === tp;
              const Icon = m.icon;
              return (
                <button
                  key={tp}
                  onClick={() => setTypeFilter(tp)}
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
                  <Icon size={12} /> {getTypeLabel(tp)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{data?.total || 0}</strong> {t("education.found_colleges") || "colleges found"}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DistrictDropdown />
            <SortDropdown />
          {(typeFilter || search || searchParams.get('district')) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setSearchParams({}); }}
              style={{
                fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t("education.clear_filter") || "Clear all"} ×
            </button>
          )}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
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
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("education.no_results") || "No colleges found"}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("education.no_results_sub") || "Try adjusting your search or filter."}</div>
            <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="btn btn-outline btn-sm">
              {t("education.reset") || "Reset Filters"}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {paginated.map((item, i) => {
              const meta = TYPE_META[item.type] || TYPE_META.other;
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
                          background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiShield size={9} /> Verified
                        </span>
                      )}
                      {item.is_old && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                          border: '1px solid rgba(245,158,11,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiClock size={9} /> Historic
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.6rem', fontSize: '0.97rem', lineHeight: 1.35,
                  }}>
                    {item.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.1rem' }}>
                    {item.area && (
                      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <FiMapPin size={11} style={{ marginTop: 2, flexShrink: 0, color: meta.color, opacity: 0.7 }} />
                        {item.area}
                      </span>
                    )}
                    {item.district && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        <FiNavigation size={10} style={{ color: meta.color, opacity: 0.6 }} />
                        {item.district}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => setSelectedItem(item)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px', borderRadius: 12, background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                      boxShadow: `0 4px 14px ${meta.color}30`, transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                    }}>
                      <FiExternalLink size={14} /> {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
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

      {/* ════════════════ EDUCATIONAL TIPS ════════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAward size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                {t("education.college_tips_title") || "Choosing the Right College"}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t("education.college_tips_sub") || "Key factors to consider before making a decision."}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiGlobe, color: '#F59E0B', title: t("education.tip_accreditation_college") || "Board Affiliation", desc: t("education.tip_accreditation_college_desc") || "Check whether the college is affiliated with a recognized education board." },
              { Icon: FiAward, color: '#8B5CF6', title: t("education.tip_reputation") || "Academic Reputation", desc: t("education.tip_reputation_desc") || "Look into past results, teacher quality, and college ranking." },
              { Icon: FiHeart, color: '#10B981', title: t("education.tip_facilities") || "Campus & Labs", desc: t("education.tip_facilities_desc") || "Libraries, science labs, and extracurricular facilities are important for growth." },
              { Icon: FiExternalLink, color: '#06B6D4', title: t("education.tip_visit_college") || "Visit the Campus", desc: t("education.tip_visit_college_desc") || "Schedule a visit to get a feel for the environment and culture." },
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

      <DetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
        type="education" 
      />

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