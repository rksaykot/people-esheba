import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiHeart, FiPlus, FiPlusCircle, FiActivity, FiBook, FiCloudLightning,
  FiCoffee, FiBox, FiArrowRight, FiFilter, FiMapPin, FiClock,
  FiShield, FiAward, FiUsers, FiTrendingUp, FiDollarSign
} from 'react-icons/fi';
import { MdHealthAndSafety, MdSchool, MdSevereCold, MdLocalFireDepartment, MdAgriculture, MdWheelchairPickup } from 'react-icons/md';
import HelpRequestModal from '../components/donation/HelpRequestModal';
import { useApi } from '../hooks/useApi';
import SortDropdown from '../components/ui/SortDropdown';

/* ── Constants ──────────────────────────────────────────── */
const DONATE_CATS = [
  { key: 'all', label: 'All', color: '#8B5CF6', icon: FiHeart },
  { key: 'medical', label: 'Medical Aid', color: '#EF4444', icon: MdHealthAndSafety },
  { key: 'education', label: 'Education Fund', color: '#06B6D4', icon: MdSchool },
  { key: 'disaster', label: 'Disaster', color: '#F59E0B', icon: MdSevereCold },
  { key: 'food', label: 'Food', color: '#10B981', icon: FiCoffee },
  { key: 'agriculture', label: 'Agriculture Fund', color: '#10B981', icon: MdAgriculture },
  { key: 'other', label: 'Other', color: '#EC4899', icon: FiBox },
];

/* Maps a donations table row (joined with poster) into this page's shape.
 * Real requests come in via HelpRequestModal → POST /donations, get
 * moderated in Admin → Donations, and only 'approved' ones show here. */
function mapHelpRequest(row) {
  return {
    id: row.id,
    cat: row.category,
    title: row.title,
    name: row.poster_name || 'Anonymous',
    location: row.district || row.division || 'Bangladesh',
    amount: Number(row.amount_needed) > 0
      ? `${Number(row.amount_needed).toLocaleString()} BDT Needed`
      : 'Any Amount',
    amountRaised: Number(row.amount_raised) || 0,
    desc: row.description,
    urgency: row.is_urgent ? 'High' : 'Normal',
    date: row.created_at,
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

/* ── Main Donate Component ─────────────────────────────── */
export default function Donate() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('category') || 'all';
  const [visible, setVisible] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const handleCatChange = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'all') newParams.delete('category');
    else newParams.set('category', key);
    setSearchParams(newParams);
  };

  /* Real data — approved requests submitted via "Request Help", moderated in Admin → Donations */
  const { data, loading, refetch } = useApi('/donations', { 
    params: { 
      category: activeCat !== 'all' ? activeCat : undefined, 
      status: 'approved',
      sort: searchParams.get('sort') || undefined
    } 
  });
  const filteredRequests = (data?.rows || []).map(mapHelpRequest);

  // Stats for hero section
  const stats = [
    { label: t("donate.stat_requests") || "Total Requests", value: 128, suffix: '+', icon: <FiHeart size={16} />, color: '#EF4444' },
    { label: t("donate.stat_helped") || "People Helped", value: 2450, suffix: '+', icon: <FiUsers size={16} />, color: '#10B981' },
    { label: t("donate.stat_raised") || "Funds Raised", value: 42.5, suffix: 'Lac', icon: <FiTrendingUp size={16} />, color: '#8B5CF6' },
  ];

  const getCategoryMeta = (catKey) => {
    return DONATE_CATS.find(c => c.key === catKey) || DONATE_CATS[0];
  };

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
            ? 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
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
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                {t("donate.live_badge") || "Urgent Help Requests"}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t("donate.title") || "Support Those in Need"}<br />
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t("donate.highlight") || "Make a Difference Today"}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t("donate.sub") || "Browse verified requests from across Bangladesh and contribute to causes that matter."}
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

        {/* Post Request & Filter Bar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.25rem', marginBottom: '2rem',
          display: 'flex', flexDirection: 'row', flexWrap: 'wrap', 
          justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        }}>
          
          {/* Category filter pills (Left Side) */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />{t("common.filter") || "Filter"}:
            </span>
            {DONATE_CATS.map(cat => {
              const active = activeCat === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCatChange(cat.key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
                    background: active ? cat.color : 'transparent',
                    borderColor: active ? cat.color : 'var(--border-2)',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                >
                  <Icon size={12} /> {t(`donate.${cat.key}`) || cat.label}
                </button>
              );
            })}
          </div>

          {/* Action Button (Right Side) */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => setShowRequestModal(true)}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none',
                padding: '0 1.5rem', height: 46, borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              }}>
              <FiPlusCircle size={16} /> {t("donate.post_request") || "Post Help Request"}
            </button>
          </div>
        </div>

        {/* Result meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? t("common.loading") : <><strong style={{ color: 'var(--text)' }}>{filteredRequests.length}</strong> {t("donate.found_requests") || "help requests found"}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
          {activeCat !== 'all' && (
            <button
              onClick={() => handleCatChange('all')}
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
        ) : filteredRequests.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
          }}>
            <FiHeart size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{t("donate.no_results") || "No requests found"}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t("donate.no_results_sub") || "Try switching categories or check back later."}</div>
            <button onClick={() => handleCatChange('all')} className="btn btn-outline btn-sm">
              {t("donate.view_all") || "View All Requests"}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}>
            {filteredRequests.map((item, i) => {
              const catMeta = getCategoryMeta(item.cat);
              const urgencyColor = item.urgency === 'High' ? '#EF4444' : (item.urgency === 'Medium' ? '#F59E0B' : '#10B981');
              const urgencyBg = item.urgency === 'High' ? 'rgba(239,68,68,0.1)' : (item.urgency === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)');
              const Icon = catMeta.icon;
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
                    e.currentTarget.style.borderColor = catMeta.color + '40';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${catMeta.color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${catMeta.color}, transparent)`,
                    borderRadius: '18px 18px 0 0',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${catMeta.color}15`, border: `1px solid ${catMeta.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: catMeta.color,
                    }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: urgencyBg, color: urgencyColor,
                        border: `1px solid ${urgencyColor}30`,
                        padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                      }}>
                        <FiClock size={9} /> {item.urgency} Priority
                      </span>
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 800, color: 'var(--text)',
                    marginBottom: '0.5rem', fontSize: '1rem', lineHeight: 1.35,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiUsers size={11} style={{ flexShrink: 0, color: catMeta.color, opacity: 0.7 }} /> {item.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiMapPin size={11} style={{ flexShrink: 0, color: catMeta.color, opacity: 0.7 }} /> {item.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiDollarSign size={11} style={{ flexShrink: 0, color: catMeta.color, opacity: 0.7 }} /> {item.amount}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); import('react-hot-toast').then(m => m.default.success(isBn ? 'পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting to secure payment gateway...')); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${catMeta.color}, ${catMeta.color}cc)`,
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      boxShadow: `0 4px 14px ${catMeta.color}30`,
                      transition: 'transform 0.2s',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FiHeart size={14} /> {t("donate.donate_now") || "Donate Now"}
                    </span>
                    <FiArrowRight size={15} style={{ opacity: 0.7 }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════ IMPACT SECTION ════════════════ */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(16,185,129,0.12)', color: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAward size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                {t("donate.impact_title") || "Your Contribution Creates Impact"}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t("donate.impact_sub") || "See how your donations change lives across Bangladesh."}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: MdHealthAndSafety, color: '#EF4444', title: t("donate.impact_medical") || "Medical Support", desc: t("donate.impact_medical_desc") || "Fund life-saving surgeries, treatments, and medicines for those who cannot afford them." },
              { Icon: MdSchool, color: '#06B6D4', title: t("donate.impact_education") || "Education for All", desc: t("donate.impact_education_desc") || "Empower students with scholarships, books, and educational resources to break the cycle of poverty." },
              { Icon: FiCoffee, color: '#10B981', title: t("donate.impact_food") || "Food Security", desc: t("donate.impact_food_desc") || "Provide nutritious meals to families and communities facing hunger and food scarcity." },
              { Icon: FiBox, color: '#EC4899', title: t("donate.impact_relief") || "Disaster Relief", desc: t("donate.impact_relief_desc") || "Respond to emergencies with shelter, clean water, and essential supplies." },
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
      <HelpRequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
        onSuccess={() => { setShowRequestModal(false); refetch(); }} 
      />
    </div>
  );
}