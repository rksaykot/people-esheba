import React, { useState, useRef, useEffect } from 'react';
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';

const DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Chuadanga', 
  'Comilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 
  'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 
  'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 
  'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 
  'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 
  'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

export default function DistrictDropdown() {
  const { isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDistrict = searchParams.get('district') || '';
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (d) => {
    if (d) searchParams.set('district', d);
    else searchParams.delete('district');
    searchParams.delete('page'); // reset page on filter change
    setSearchParams(searchParams);
    setOpen(false);
    setSearch('');
  };

  const filtered = DISTRICTS.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: '1px solid ' + (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          padding: '8px 14px', borderRadius: 8, color: 'var(--text)',
          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          minWidth: 140, justifyContent: 'space-between',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <FiMapPin size={13} style={{ color: currentDistrict ? '#10B981' : 'var(--text-dim)' }} />
          {currentDistrict || (isBn ? 'জেলা নির্বাচন করুন' : 'Select District')}
        </span>
        <FiChevronDown size={14} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: 220, zIndex: 100, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
            <input 
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isBn ? 'জেলা খুঁজুন...' : 'Search district...'}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 6,
                border: '1px solid var(--border-2)', background: 'var(--bg)',
                color: 'var(--text)', fontSize: '0.8rem', outline: 'none'
              }}
            />
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <button
              onClick={() => handleSelect('')}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none',
                background: !currentDistrict ? 'var(--surface-3)' : 'transparent',
                color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer',
                fontWeight: !currentDistrict ? 700 : 400
              }}
            >
              {isBn ? 'সকল জেলা' : 'All Districts'}
            </button>
            {filtered.map(d => (
              <button
                key={d}
                onClick={() => handleSelect(d)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none',
                  background: currentDistrict === d ? 'rgba(16,185,129,0.1)' : 'transparent',
                  color: currentDistrict === d ? '#10B981' : 'var(--text)',
                  fontSize: '0.85rem', cursor: 'pointer',
                  fontWeight: currentDistrict === d ? 700 : 400
                }}
                onMouseEnter={e => { if (currentDistrict !== d) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (currentDistrict !== d) e.currentTarget.style.background = 'transparent' }}
              >
                {d}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.8rem', textAlign: 'center' }}>
                {isBn ? 'কোন জেলা পাওয়া যায়নি' : 'No districts found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
