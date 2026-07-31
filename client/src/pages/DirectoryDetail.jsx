import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FiArrowLeft, FiMapPin, FiGlobe, FiPhone, FiStar, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

export default function DirectoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  useEffect(() => {
    api.get(`/directory/${id}`).then(r => setItem(r.data.data)).catch(() => { }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" /></div>;
  if (!item) return <div className="empty"><div className="empty-icon"><FiXCircle size={48} style={{ opacity: 0.4 }} /></div><div>Details not found</div></div>;

  return (
    <div>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0d0005 0%, #130008 40%, #080E1A 100%)'
          : 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 40%, #f1f5f9 100%)',
        padding: '4rem 0 3rem',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px', width: 400, height: 400, borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(230,57,70,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
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
                {isBn ? 'বিস্তারিত তথ্য' : 'Listing Details'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.25rem' }}>
              <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ minWidth: 120 }}><FiArrowLeft size={13} />Back</button>
            </div>
            <h1 style={{
              fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
              marginBottom: '1rem', color: 'var(--text)', maxWidth: 800,
            }}>
              {isBn && item.name_bn ? item.name_bn : item.name}
            </h1>
            
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)' }}>
                <FiStar /> Rating: {item.rating || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container" style={{ padding: '3rem 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: 24, border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiInfo style={{ color: 'var(--red)' }} /> Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', textTransform: 'capitalize' }}>{item.category}</div>
              </div>
              {item.price_info && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Price Range</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.price_info}</div>
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
                <a href={`tel:${item.phone}`} className="btn btn-primary" style={{ flex: 1 }}>
                  <FiPhone /> Call Now
                </a>
              )}
              {item.website && (
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1 }}>
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
