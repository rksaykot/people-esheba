import React, { useEffect, useState } from 'react';
import { FiX, FiMapPin, FiPhone, FiGlobe, FiCheckCircle, FiStar, FiBookOpen, FiInfo } from 'react-icons/fi';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function DetailsModal({ isOpen, onClose, item, type = 'education' }) {
  const { isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', opacity: visible ? 1 : 0, transition: 'opacity 0.3s'
        }}
      />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--bg)', borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: visible ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.1)', color: 'var(--text)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
        }}>
          <FiX size={20} />
        </button>

        <div style={{
          position: 'relative', padding: '3rem 2rem 2rem',
          background: isDark
            ? 'linear-gradient(135deg, #0d0005 0%, #130008 40%, #080E1A 100%)'
            : 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 40%, #f1f5f9 100%)',
          textAlign: 'center', borderRadius: '24px 24px 0 0'
        }}>
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)',
                color: 'var(--red)', padding: '5px 14px', borderRadius: 999,
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                {isBn ? 'বিস্তারিত' : 'Details'}
              </span>
            </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>
            {isBn && item.name_bn ? item.name_bn : item.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {item.district && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <FiMapPin style={{ color: 'var(--red)' }} />
                {item.address || item.district}
              </span>
            )}
            {item.is_verified === 1 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}>
                <FiCheckCircle /> Verified
              </span>
            )}
            {item.rating && (
               <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)' }}>
                 <FiStar /> Rating: {item.rating}
               </span>
            )}
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
           <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            {type === 'education' ? <FiBookOpen style={{ color: 'var(--red)' }} /> : <FiInfo style={{ color: 'var(--red)' }} />} 
            Overview
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>
                  {type === 'education' ? 'Type' : 'Category'}
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                  {type === 'education' ? item.type : item.category}
                </div>
              </div>
              {(item.established_year || item.price_info) && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>
                    {type === 'education' ? 'Established' : 'Price Range'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                     {type === 'education' ? item.established_year : item.price_info}
                  </div>
                </div>
              )}
            </div>
            
            {(item.description || item.description_bn) && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 700 }}>Description</div>
                <p style={{ lineHeight: 1.7, color: 'var(--text)' }}>
                  {isBn && item.description_bn ? item.description_bn : item.description}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {item.phone && (
                <a href={`tel:${item.phone}`} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <FiPhone /> Call Now
                </a>
              )}
              {item.website && (
                <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <FiGlobe /> Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
