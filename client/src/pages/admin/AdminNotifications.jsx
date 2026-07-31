import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiBell, FiAlertTriangle, FiCheckCircle, FiCalendar } from 'react-icons/fi';

export default function AdminNotifications() {
  const { t, isBn } = useLang();
  const [form, setForm] = useState({ title:'', body:'' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Title and body required');
    if (!window.confirm(`Send "${form.title}" to ALL users?`)) return;
    setLoading(true);
    try {
      const { data } = await api.post('/admin/announcements', form);
      toast.success(data.message);
      setSent({ ...form, sentAt: new Date().toLocaleString() });
      setForm({ title:'', body:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--text-strong)', marginBottom:3 }}>{t('admin.notifications')}</h1>

      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, padding:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.75rem' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'var(--amber-light)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FiBell size={18} style={{ color:'var(--amber)' }}/>
            </div>
            <div>
              <div style={{ fontWeight:700, color:'#fff' }}>{isBn?'নতুন ঘোষণা':'New Announcement'}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{isBn?'সব সক্রিয় ব্যবহারকারী পাবেন':'All active users will receive this'}</div>
            </div>
          </div>
          <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div className="form-group">
              <label className="form-label">{isBn?'শিরোনাম':'Title'} *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder={isBn?'ঘোষণার শিরোনাম...':'Announcement title...'} className="form-input" required/>
            </div>
            <div className="form-group">
              <label className="form-label">{isBn?'বার্তা':'Message'} *</label>
              <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
                placeholder={isBn?'ঘোষণার বিস্তারিত বিবরণ...':'Full announcement message...'} className="form-textarea" style={{ minHeight:140 }} required/>
            </div>
            <div style={{ padding:'12px 16px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, fontSize:'0.82rem', color:'var(--amber)' }}>
              <FiAlertTriangle size={14}/> {isBn?'এই ঘোষণাটি সব নিবন্ধিত ব্যবহারকারীর নোটিফিকেশনে যাবে।':'This will create notifications for all registered users.'}
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent:'center', height:46 }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm"/>{isBn?'পাঠানো হচ্ছে...':'Sending...'}</> : <><FiSend size={14}/>{isBn?'সবাইকে পাঠান':'Send to All Users'}</>}
            </button>
          </form>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sent && (
            <div style={{ background:'var(--surface)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:16, padding:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
                <span style={{ fontSize:'1.1rem', color:'var(--green)', display: 'flex' }}><FiCheckCircle /></span>
                <span style={{ fontWeight:700, color:'var(--green)', fontSize:'0.9rem' }}>{isBn?'সফলভাবে পাঠানো হয়েছে':'Successfully Sent'}</span>
              </div>
              <div style={{ fontWeight:700, color:'var(--text-strong)', fontSize:'0.88rem', marginBottom:5 }}>{sent.title}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.5, marginBottom:8 }}>{sent.body}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={11} /> {sent.sentAt}</div>
            </div>
          )}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
            <h3 style={{ fontWeight:700, color:'var(--text-strong)', marginBottom:'1rem', fontSize:'0.9rem' }}>{isBn?'টিপস':'Tips'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                isBn?'সংক্ষিপ্ত ও স্পষ্ট শিরোনাম দিন':'Use short, clear titles',
                isBn?'জরুরি ঘোষণায় ⚠️ ব্যবহার করুন':'Use ⚠️ for urgent announcements',
                isBn?'বাংলা ও ইংরেজি উভয়ে লিখুন':'Write in both Bengali and English',
                isBn?'প্রয়োজনীয় লিংক যোগ করুন':'Include relevant links if needed',
              ].map((tip, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:'0.8rem', color:'var(--text-muted)' }}>
                  <span style={{ color:'var(--cyan)', flexShrink:0, marginTop:1 }}>→</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
