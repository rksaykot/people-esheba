import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiSearch, FiMapPin, FiFilter, FiExternalLink,
  FiPhone, FiClock, FiHeart, FiStar, FiActivity,
  FiAward, FiCheckCircle
} from 'react-icons/fi';
import { MdLocalPharmacy } from 'react-icons/md';
import SortDropdown from '../components/ui/SortDropdown';
import { useApi } from '../hooks/useApi';

/* ── Constants ──────────────────────────────────────────── */
const PHARMACY_TYPES = ['retail', 'hospital-pharmacy', '24-7'];

const TYPE_META = {
  'retail': { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: MdLocalPharmacy, label: 'Retail' },
  'hospital-pharmacy': { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: MdLocalPharmacy, label: 'Hospital Pharmacy' },
  '24-7': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdLocalPharmacy, label: '24/7 Open' },
};

/* ── Animated Counter (reused from Health) ────────────── */
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
export default function Pharmacy() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => {
    setTypeFilter(searchParams.get('type') || '');
  }, [searchParams]);

  const handleTypeChange = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (!key) newParams.delete('type');
    else newParams.set('type', key);
    setSearchParams(newParams);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  /* Real data — managed from Admin → Directory → Pharmacies */
  const { data, loading } = useApi('/pharmacies', { 
    params: { 
      type: typeFilter || undefined, 
      search: search || undefined,
      sort: searchParams.get('sort') || undefined
    } 
  });
  const pharmacies = data?.rows || [];

  const filtered = pharmacies.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.area || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* Bengali-aware display helpers — fall back to English if no _bn value */
  const dName = (item) => (isBn && item.name_bn) ? item.name_bn : item.name;
  const dArea = (item) => (isBn && item.area_bn) ? item.area_bn : item.area;

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
                {t("pharmacy.hero_badge") || "Trusted Pharmacy Directory"}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t("pharmacy.hero_title") || "Find Medicines Near You"}<br />
              <span style={{
                background: 'linear-gradient(135deg, #E63946, #ff6b6b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t("pharmacy.hero_highlight") || "Quick & Reliable"}
              </span>{' '}Bangladesh
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("pharmacy.hero_sub") || "Browse verified pharmacies with contact details, opening hours, and customer ratings."}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: t("pharmacy.stat_listed") || "Pharmacies Listed", value: 800, suffix: '+', icon: <MdLocalPharmacy size={16} />, color: 'var(--red)' },
                { label: t("pharmacy.stat_areas") || "Areas Covered", value: 45, suffix: '', icon: <FiMapPin size={16} />, color: 'var(--cyan)' },
                { label: t("pharmacy.stat_verified") || "Verified", value: 92, suffix: '%', icon: <FiCheckCircle size={16} />, color: 'var(--green)' },
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

      {/* ════════════ MAIN CONTENT ════════════ */}
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
                placeholder={t("pharmacy.search_placeholder") || "Search pharmacies..."}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, background: '#10B981', borderColor: '#10B981' }}
            >
              <FiSearch size={14} /> {t("common.search") || "Search"}
            </button>
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />{t("common.filter") || "Filter"}:
            </span>
            <button
              onClick={() => handleTypeChange('')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                background: !typeFilter ? '#10B981' : 'transparent',
                borderColor: !typeFilter ? '#10B981' : 'var(--border-2)',
                color: !typeFilter ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t("All") || "All"}
            </button>
            {PHARMACY_TYPES.map(tp => {
              const m = TYPE_META[tp];
              const active = typeFilter === tp;
              const Icon = m.icon;
              return (
                <button
                  key={tp}
                  onClick={() => handleTypeChange(tp)}
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

        {/* Result meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> {t("pharmacy.found") || "pharmacies found"}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
          {(typeFilter || search) && (
            <button
              onClick={() => { setSearch(''); handleTypeChange(''); }}
              style={{
                fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t("pharmacy.clear_filter") || "Clear all"} ×
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
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <FiFilter size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("pharmacy.no_results") || "No pharmacies found"}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("pharmacy.no_results_sub") || "Try adjusting your search or filter."}</div>
            <button onClick={() => { setSearch(''); handleTypeChange(''); }} className="btn btn-outline btn-sm">
              {t("pharmacy.reset") || "Reset Filters"}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {paginated.map((item, i) => {
              const meta = TYPE_META[item.type] || TYPE_META['retail'];
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
                      width: 26, height: 26, borderRadius: 10,
                      background: meta.bg, border: `1px solid ${meta.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: meta.color,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {item.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(16,185,129,0.1)', color: '#10B981',
                          border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiCheckCircle size={9} /> Verified
                        </span>
                      )}
                      {item.type === '24-7' && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: `${meta.color}15`, color: meta.color,
                          border: `1px solid ${meta.color}30`,
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiClock size={9} /> 24/7
                        </span>
                      )}
                      {item.type === 'hospital-pharmacy' && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: `${meta.color}15`, color: meta.color,
                          border: `1px solid ${meta.color}30`,
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiActivity size={9} /> Hospital
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.4rem', fontSize: '0.97rem', lineHeight: 1.35,
                  }}>
                    {dName(item)}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiMapPin size={11} style={{ flexShrink: 0, color: meta.color, opacity: 0.7 }} />
                      {dArea(item)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiClock size={11} style={{ flexShrink: 0, color: meta.color, opacity: 0.7 }} />
                      {item.hours}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600 }}>
                      <FiStar size={12} style={{ fill: 'var(--amber)', color: 'var(--amber)' }} />
                      {item.rating} <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/ 5</span>
                    </span>
                  </div>

                  {/* Call-to-action footer */}
                  <a
                    href={`tel:${item.phone}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                      boxShadow: `0 4px 14px ${meta.color}30`,
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FiPhone size={15} /> {item.phone}
                    </span>
                    <FiExternalLink size={15} style={{ opacity: 0.8 }} />
                  </a>
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

      {/* ════════════ TIPS SECTION ════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(16,185,129,0.12)', color: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiHeart size={15} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                {t("pharmacy.tips_title") || "Choosing the Right Pharmacy"}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t("pharmacy.tips_sub") || "What to look for when buying medicines."}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiCheckCircle, color: '#10B981', title: t("pharmacy.tip_verified") || "Verified Sources", desc: t("pharmacy.tip_verified_desc") || "Always buy from licensed and verified pharmacies." },
              { Icon: FiClock, color: '#F59E0B', title: t("pharmacy.tip_hours") || "Check Opening Hours", desc: t("pharmacy.tip_hours_desc") || "Know if the pharmacy is open late or offers 24/7 service." },
              { Icon: FiPhone, color: '#06B6D4', title: t("pharmacy.tip_contact") || "Save Contact", desc: t("pharmacy.tip_contact_desc") || "Keep pharmacy numbers handy for emergencies." },
              { Icon: FiStar, color: '#8B5CF6', title: t("pharmacy.tip_reviews") || "Read Reviews", desc: t("pharmacy.tip_reviews_desc") || "Customer feedback helps you find reliable service." },
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
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${tip.color}15`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: tip.color,
                  }}>
                    <Icon size={16} />
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