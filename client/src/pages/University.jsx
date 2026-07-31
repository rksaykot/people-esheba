import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiSearch, FiMapPin, FiFilter, FiShield, FiAward,
  FiExternalLink, FiBook, FiNavigation, FiGlobe, FiHeart, FiClock
} from 'react-icons/fi';
import { MdAccountBalance, MdBusiness, MdScience, MdEngineering, MdLocalHospital } from 'react-icons/md';
import SortDropdown from '../components/ui/SortDropdown';
import DetailsModal from '../components/ui/DetailsModal';
import { useApi } from '../hooks/useApi';

const UNI_TYPES = ['public', 'private', 'engineering', 'medical', 'other'];

const TYPE_META = {
  'public':      { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  icon: MdAccountBalance, label: 'Public University' },
  'private':     { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: MdBusiness,        label: 'Private University' },
  'engineering': { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',  icon: MdEngineering,     label: 'Engineering' },
  'medical':     { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: MdLocalHospital,   label: 'Medical' },
  'other':       { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MdScience,         label: 'Other' },
};

/* Maps an education_institutions row (type=university) into this page's shape */
function mapUniversity(row, isBn) {
  const address = (isBn && row.address_bn) ? row.address_bn : row.address;
  return {
    id: row.id,
    type: UNI_TYPES.includes(row.subtype) ? row.subtype : 'other',
    name: (isBn && row.name_bn) ? row.name_bn : row.name,
    area: address || row.district || '',
    district: row.district,
    description: (isBn && row.description_bn) ? row.description_bn : row.description,
    badge: TYPE_META[row.subtype]?.label || 'University',
    phone: row.phone,
    website: row.website,
    is_verified: !!row.is_verified,
  };
}

function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let s = 0;
        const step = Math.ceil(end / 50);
        const timer = setInterval(() => {
          s += step;
          if (s >= end) { setCount(end); clearInterval(timer); }
          else setCount(s);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function University() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const typeFilter = searchParams.get('type') || '';
  const isDark = theme === 'dark';

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  /* Real data — managed from Admin → Education (type=university) */
  const { data, loading } = useApi('/education', { 
    params: { 
      type: 'university', 
      subtype: typeFilter || undefined, 
      search: search || undefined,
      sort: searchParams.get('sort') || undefined
    } 
  });
  const universities = (data?.rows || []).map(row => mapUniversity(row, isBn));

  const filtered = universities.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.area.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || u.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #050510 0%, #0c0c20 40%, #130a1a 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 40%, #f5f0ff 100%)',
        padding: '4rem 0 3rem',
      }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                color: '#3B82F6', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
                {isBn ? 'বিশ্ববিদ্যালয় ডিরেক্টরি' : 'University Directory'}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)',
              marginBottom: '1rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto',
            }}>
              {t('education.university_title') || 'Explore Universities'}<br />
              <span style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {isBn ? 'বাংলাদেশে' : 'Across Bangladesh'}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7, margin: '0 auto 2rem' }}>
              {t('education.university_sub') || 'Explore Public and Private Universities in Bangladesh'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: isBn ? 'বিশ্ববিদ্যালয়' : 'Universities', value: 160, suffix: '+', icon: <FiBook size={16} />, color: '#3B82F6' },
                { label: isBn ? 'জেলা' : 'Districts', value: 64, suffix: '', icon: <FiMapPin size={16} />, color: '#8B5CF6' },
                { label: isBn ? 'যাচাইকৃত' : 'Verified', value: 92, suffix: '%', icon: <FiShield size={16} />, color: '#10B981' },
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

        {/* Search + Filter */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.25rem', marginBottom: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isBn ? 'বিশ্ববিদ্যালয় খুঁজুন...' : 'Search universities by name or area...'}
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: '0.9rem' }}
              />
            </div>
            <button type="button" className="btn btn-primary" style={{ height: 46, padding: '0 1.5rem', borderRadius: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', borderColor: '#3B82F6' }}>
              <FiSearch size={14} /> {t('common.search') || 'Search'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 4 }}>
              <FiFilter size={11} style={{ marginRight: 4 }} />{t('common.filter') || 'Filter'}:
            </span>
            <button onClick={() => setTypeFilter('')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', border: '1px solid', transition: 'all 0.18s',
              background: !typeFilter ? '#3B82F6' : 'transparent',
              borderColor: !typeFilter ? '#3B82F6' : 'var(--border-2)',
              color: !typeFilter ? '#fff' : 'var(--text-muted)',
            }}>
              {isBn ? 'সকল' : 'All'}
            </button>
            {UNI_TYPES.map(tp => {
              const m = TYPE_META[tp];
              const active = typeFilter === tp;
              const Icon = m.icon;
              return (
                <button key={tp} onClick={() => setTypeFilter(tp)} style={{
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

        {/* Results meta */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {loading ? (t('common.loading') || 'Loading...') : <><strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> {isBn ? 'টি বিশ্ববিদ্যালয় পাওয়া গেছে' : 'universities found'}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortDropdown />
          {(typeFilter || search) && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); }} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              {isBn ? 'ফিল্টার মুছুন' : 'Clear all'} ×
            </button>
          )}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', minHeight: 180 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[60, 100, 80, 40].map((w, j) => (
                    <div key={j} style={{ height: j === 0 ? 40 : 12, width: `${w}%`, borderRadius: 8, background: 'var(--surface-3)', animation: 'shimmer 1.6s infinite' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center' }}>
            <FiFilter size={48} style={{ opacity: 0.4, color: 'var(--text-dim)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{isBn ? 'কোনো বিশ্ববিদ্যালয় পাওয়া যায়নি' : 'No universities found'}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{isBn ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করুন।' : 'Try adjusting your search or filter.'}</div>
            <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="btn btn-outline btn-sm">{isBn ? 'রিসেট করুন' : 'Reset Filters'}</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {paginated.map((item, i) => {
              const meta = TYPE_META[item.type] || TYPE_META.other;
              const Icon = meta.icon;
              return (
                <div key={item.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 18, padding: '1.5rem', position: 'relative',
                  overflow: 'hidden', transition: 'all 0.24s cubic-bezier(0.4,0,0.2,1)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(20px)',
                  transitionDelay: `${Math.min(i * 50, 300)}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = meta.color + '40'; e.currentTarget.style.boxShadow = `0 12px 40px ${meta.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${meta.color}, transparent)`, borderRadius: '18px 18px 0 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: meta.bg, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {item.is_verified && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800 }}>
                          <FiShield size={9} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.6rem', fontSize: '0.97rem', lineHeight: 1.35 }}>{item.name}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FiMapPin size={11} style={{ color: meta.color, opacity: 0.7 }} /> {item.area}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      <FiNavigation size={10} style={{ color: meta.color, opacity: 0.6 }} /> {item.district}
                    </span>
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

      {/* TIPS */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAward size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{isBn ? 'সঠিক বিশ্ববিদ্যালয় বেছে নিন' : 'Choosing the Right University'}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{isBn ? 'সিদ্ধান্ত নেওয়ার আগে এই বিষয়গুলো বিবেচনা করুন।' : 'Key factors to consider before making a decision.'}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { Icon: FiGlobe,        color: '#3B82F6', title: isBn ? 'স্বীকৃতি যাচাই করুন' : 'Check Accreditation',   desc: isBn ? 'UGC অনুমোদিত বিশ্ববিদ্যালয় নির্বাচন করুন।' : 'Choose a UGC approved university.' },
              { Icon: FiAward,        color: '#8B5CF6', title: isBn ? 'একাডেমিক সুনাম' : 'Academic Reputation',         desc: isBn ? 'বিভাগের র‍্যাংকিং ও শিক্ষক মান দেখুন।' : 'Research department rankings and faculty quality.' },
              { Icon: FiHeart,        color: '#10B981', title: isBn ? 'ক্যাম্পাস সুবিধা' : 'Campus Facilities',           desc: isBn ? 'লাইব্রেরি, ল্যাব ও আবাসন সুবিধা বিবেচনা করুন।' : 'Consider library, labs, and accommodation.' },
              { Icon: FiExternalLink, color: '#F59E0B', title: isBn ? 'ক্যাম্পাস পরিদর্শন' : 'Visit the Campus',           desc: isBn ? 'সরাসরি পরিবেশ দেখতে ক্যাম্পাস পরিদর্শন করুন।' : 'Schedule a visit to experience the environment.' },
            ].map((tip, i) => {
              const Icon = tip.Icon;
              return (
                <div key={i} style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '1.25rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'all 0.22s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = tip.color + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${tip.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tip.color }}>
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
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes shimmer   { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      <DetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
        type="education" 
      />
    </div>
  );
}
