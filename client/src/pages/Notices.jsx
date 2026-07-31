import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiBell, FiBookOpen, FiBriefcase, FiAward,
  FiFileText, FiArrowRight, FiClock, FiExternalLink, FiActivity,
  FiSearch, FiFilter, FiShield, FiStar, FiCheckCircle, FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import SortDropdown from '../components/ui/SortDropdown';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

/* ── Constants ──────────────────────────────────────────── */
const NOTICE_CATS = [
  { key: 'all', label: 'All Updates', color: '#8B5CF6', icon: FiBell },
  { key: 'academic', label: 'Academic Notices', color: '#8B5CF6', icon: FiBookOpen },
  { key: 'career', label: 'Career Hub', color: '#06B6D4', icon: FiBriefcase },
  { key: 'scholarship', label: 'Scholarships', color: '#F59E0B', icon: FiAward },
  { key: 'government', label: 'Gov Gazettes', color: '#10B981', icon: FiFileText },
  { key: 'donate', label: 'Donation Requests', color: '#EF4444', icon: FiActivity },
];

// Category meta for card styling
const CAT_META = Object.fromEntries(
  NOTICE_CATS.filter(c => c.key !== 'all').map(c => [c.key, { color: c.color, icon: c.icon, bg: `${c.color}15` }])
);

/* Maps a notices table row into this page's shape. isBn picks the Bengali
   column when the site is in Bengali mode and a translation exists. */
function getTimeAgo(dateString, isBn) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    if (!isBn) {
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } else {
      const diff = Date.now() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      const toBnNum = n => n.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60));
          if (minutes <= 1) return 'এইমাত্র';
          return `${toBnNum(minutes)} মিনিট আগে`;
        }
        return `${toBnNum(hours)} ঘণ্টা আগে`;
      }
      if (days === 1) return 'গতকাল';
      if (days < 30) return `${toBnNum(days)} দিন আগে`;
      
      const months = Math.floor(days / 30);
      if (months < 12) return `${toBnNum(months)} মাস আগে`;
      
      const years = Math.floor(days / 365);
      return `${toBnNum(years)} বছর আগে`;
    }
  } catch (e) {
    return '';
  }
}

function mapNotice(row, isBn) {
  return {
    id: row.id,
    cat: row.category,
    title: (isBn && row.title_bn) ? row.title_bn : row.title,
    date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    timeAgoStr: getTimeAgo(row.created_at, isBn),
    org: row.source || 'People E-Sheba',
    urgent: !!row.is_urgent,
    desc: (isBn && row.description_bn) ? row.description_bn : (row.description || ''),
    link: row.link,
  };
}

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
export default function Notices() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || 'all');
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => {
    setActiveCat(searchParams.get('cat') || 'all');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleCatChange = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'all') newParams.delete('cat');
    else newParams.set('cat', key);
    // Optionally delete search when changing category, or keep it. We'll keep it.
    setSearchParams(newParams);
  };

  /* Real data — managed from Admin → Notices */
  const { data, loading } = useApi('/notices', { 
    params: { 
      category: activeCat !== 'all' ? activeCat : undefined, 
      search: search || undefined,
      sort: searchParams.get('sort') || undefined
    } 
  });
  const allNotices = (data?.rows || []).map(row => mapNotice(row, isBn));

  const filtered = allNotices.filter(item => {
    const matchesSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.org.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'all' || item.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  // Stats for hero section
  const stats = [
    { label: 'Live Updates', value: allNotices.length, suffix: '', icon: <FiBell size={16} />, color: '#8b5cf6' },
    { label: 'Categories', value: NOTICE_CATS.filter(c => c.key !== 'all').length, suffix: '', icon: <FiFilter size={16} />, color: '#06B6D4' },
    { label: 'Urgent Alerts', value: allNotices.filter(n => n.urgent).length, suffix: '', icon: <FiActivity size={16} />, color: '#EF4444' },
  ];

  const activeCatMeta = NOTICE_CATS.find(c => c.key === activeCat) || NOTICE_CATS[0];

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
                Official Updates & Bulletins
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              Notice Center<br />
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Stay Informed & Updated
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              Discover the latest academic, career, scholarship, government, and donation updates — all in one place.
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
                placeholder="Search by title, organization, or description..."
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              <FiSearch size={14} /> Search
            </button>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />Filter:
            </span>
            {NOTICE_CATS.map(cat => {
              const active = activeCat === cat.key;
              const color = cat.color;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCatChange(cat.key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                    background: active ? color : 'transparent',
                    borderColor: active ? color : 'var(--border-2)',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                >
                  <Icon size={12} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? "Loading..." : <><strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> updates found</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {(activeCat !== 'all' || search) && (
              <button
                onClick={() => { setSearch(''); handleCatChange('all'); setSearchParams(new URLSearchParams()); }}
                style={{
                  fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Clear all ×
              </button>
            )}
            <SortDropdown />
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
            <FiBell size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>No updates found</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Try adjusting your search or filter.</div>
            <button onClick={() => { setSearch(''); handleCatChange('all'); setSearchParams(new URLSearchParams()); }} className="btn btn-outline btn-sm">
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}>
            {filtered.map((item, i) => {
              const meta = CAT_META[item.cat] || { color: '#8B5CF6', icon: FiBell, bg: 'rgba(139,92,246,0.1)' };
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
                      {item.urgent && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.2)',
                          padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                        }}>
                          <FiActivity size={9} /> Urgent
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: `${meta.color}15`, color: meta.color,
                        border: `1px solid ${meta.color}30`,
                        padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                      }}>
                        <FiTag size={9} /> {NOTICE_CATS.find(c => c.key === item.cat)?.label || item.cat}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: meta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {item.org}
                    </div>
                    <h3 style={{
                      fontWeight: 800, color: 'var(--text)',
                      fontSize: '1rem', lineHeight: 1.35, marginBottom: '0.5rem',
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    <FiClock size={11} style={{ color: meta.color, opacity: 0.7 }} />
                    <span>{item.date} • {item.timeAgoStr}</span>
                  </div>

                  {/* Call-to-action footer */}
                  <button
                    onClick={() => {
                      if (!item.link || item.link === '#') {
                        toast.error(isBn ? 'এই নোটিশের কোনো লিংক পাওয়া যায়নি' : 'No link available for this notice');
                        return;
                      }
                      let url = item.link;
                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                      }
                      window.open(url, '_blank');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                      boxShadow: `0 4px 14px ${meta.color}30`,
                      transition: 'transform 0.2s', border: 'none', cursor: 'pointer', width: '100%',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FiExternalLink size={15} /> View Details
                    </span>
                    <FiArrowRight size={15} style={{ opacity: 0.8 }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════ TIPS SECTION ════════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCheckCircle size={15} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                Tips for Following Notices
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                How to stay on top of important updates and avoid missing deadlines.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiShield, color: '#10B981', title: 'Verify Official Sources', desc: 'Always cross-check urgent notices from official websites or authorized channels.' },
              { Icon: FiClock, color: '#F59E0B', title: 'Track Deadlines', desc: 'Note application deadlines and exam dates immediately to avoid last-minute rush.' },
              { Icon: FiBell, color: '#EC4899', title: 'Enable Notifications', desc: 'Subscribe to alerts so you never miss a critical announcement.' },
              { Icon: FiStar, color: '#06B6D4', title: 'Read Complete Details', desc: 'Don\'t skip fine print — eligibility, requirements, and terms matter.' },
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