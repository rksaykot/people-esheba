import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiMapPin, FiDroplet } from 'react-icons/fi';

const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const { register } = useAuth();
  const { isBn } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', blood_group: '', division: '', district: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.blood_group) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully! Welcome');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const F = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--grad-hero)' }}>
      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, background: 'var(--grad-red)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.25rem', boxShadow: 'var(--shadow-red)' }}>ই</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>People <span style={{ color: 'var(--red)' }}>E-Sheba</span></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>জনসেবা প্ল্যাটফর্ম</div>
            </div>
          </Link>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{isBn ? 'নিবন্ধন করুন' : 'Create Account'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isBn ? 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন' : 'Join thousands of Bangladeshis'}</p>
        </div>

        <form onSubmit={handle} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.75rem' }}>
            {[
              { icon: <FiUser size={15} />, field: 'name', type: 'text', label: isBn ? 'পূর্ণ নাম' : 'Full Name', placeholder: 'Your full name', required: true },
              { icon: <FiMail size={15} />, field: 'email', type: 'email', label: isBn ? 'ইমেইল' : 'Email', placeholder: 'you@example.com', required: true },
              { icon: <FiPhone size={15} />, field: 'phone', type: 'tel', label: isBn ? 'ফোন' : 'Phone', placeholder: '01XXXXXXXXX' },
            ].map(({ icon, field, type, label, placeholder, required }) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}{required && <span style={{ color: 'var(--red)' }}>*</span>}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>{icon}</span>
                  <input type={type} name={field} id={field} value={form[field]} onChange={e => F(field, e.target.value)}
                    placeholder={placeholder} className="form-input" style={{ paddingLeft: 38 }} required={required}
                    autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : 'tel'} />
                </div>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">{isBn ? 'পাসওয়ার্ড' : 'Password'}<span style={{ color: 'var(--red)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} size={15} />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => F('password', e.target.value)}
                  placeholder="Min. 6 characters" className="form-input" style={{ paddingLeft: 38, paddingRight: 42 }} required />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDroplet style={{ color: 'var(--red)' }} /> {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}<span style={{ color: 'var(--red)' }}>*</span></label>
              <select value={form.blood_group} onChange={e => F('blood_group', e.target.value)} className="form-select" required>
                <option value="">{isBn ? 'রক্তের গ্রুপ বেছে নিন' : 'Select Blood Group'}</option>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
              <div className="form-group">
                <label className="form-label"><FiMapPin size={11} /> {isBn ? 'বিভাগ' : 'Division'}</label>
                <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                  <option value="">{isBn ? 'বেছে নিন' : 'Select'}</option>
                  {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                <input value={form.district} onChange={e => F('district', e.target.value)} placeholder={isBn ? 'জেলার নাম' : 'District'} className="form-input" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: '0.95rem' }} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" />{isBn ? 'তৈরি হচ্ছে...' : 'Creating...'}</> : (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {isBn ? 'অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'none' }}>{isBn ? 'লগইন করুন' : 'Sign In'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
