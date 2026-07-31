import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiEdit2, FiLock, FiBriefcase, FiHeart, FiBookmark, FiBell, FiCheck, FiSave, FiMapPin, FiUsers, FiX } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t, isBn } = useLang();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', division: user?.division || '', district: user?.district || '', upazila: user?.upazila || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [notifs, setNotifs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [activeJobTitle, setActiveJobTitle] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'notifications') api.get('/users/notifications').then(r => setNotifs(r.data.data)).catch(() => { });
    if (tab === 'bookmarks') api.get('/users/bookmarks').then(r => setBookmarks(r.data.data)).catch(() => { });
    if (tab === 'jobs') api.get('/jobs/my-applications').then(r => setAppliedJobs(r.data.data)).catch(() => { });
    if (tab === 'my-jobs') api.get('/jobs/mine').then(r => setMyJobs(r.data.data)).catch(() => { });
    if (tab === 'donations') api.get('/donations/mine').then(r => setMyDonations(r.data.data)).catch(() => { });
  }, [tab]);

  const openApplicants = async (jobId, title) => {
    setActiveJobTitle(title);
    setShowApplicants(true);
    setLoadingApplicants(true);
    try {
      const { data } = await api.get(`/jobs/${jobId}/applications`);
      setApplicants(data.data || []);
    } catch {
      setApplicants([]);
      toast.error('Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const switchTab = (t) => { setTab(t); setSearchParams({ tab: t }); };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.data);
      toast.success(isBn ? 'প্রোফাইল আপডেট হয়েছে!' : 'Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/password', pwForm);
      toast.success(isBn ? 'পাসওয়ার্ড পরিবর্তন হয়েছে!' : 'Password changed!');
      setPwForm({ current_password: '', new_password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const markRead = async () => {
    await api.put('/users/notifications/read');
    setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
    toast.success(isBn ? 'সব পড়া হয়েছে' : 'All marked as read');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।' : 'Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await api.delete('/users/profile');
      toast.success(isBn ? 'আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে' : 'Your account has been deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(isBn ? 'অ্যাকাউন্ট মুছে ফেলা ব্যর্থ হয়েছে' : 'Failed to delete account');
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'profile', icon: <FiUser size={14} />, label: isBn ? 'প্রোফাইল' : 'Profile' },
    { key: 'jobs', icon: <FiBriefcase size={14} />, label: isBn ? 'আবেদন করা চাকরি' : 'Applications' },
    { key: 'my-jobs', icon: <FiBriefcase size={14} />, label: isBn ? 'আমার চাকরির পোস্ট' : 'My Job Posts' },
    { key: 'donations', icon: <FiHeart size={14} />, label: isBn ? 'আমার অনুরোধ' : 'My Requests' },
    { key: 'bookmarks', icon: <FiBookmark size={14} />, label: isBn ? 'সেভ করা' : 'Saved' },
    { key: 'notifications', icon: <FiBell size={14} />, label: isBn ? 'বিজ্ঞপ্তি' : 'Notifications' },
    { key: 'security', icon: <FiLock size={14} />, label: isBn ? 'নিরাপত্তা' : 'Security' },
  ];

  const STATUS_BADGE = { pending: 'badge-amber', shortlisted: 'badge-cyan', rejected: 'badge-red', hired: 'badge-green', approved: 'badge-green' };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 920 }}>
      {/* Header */}
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 0 24px rgba(6,182,212,0.3)', margin: '0 auto' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'inherit', gap: 9, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>{user?.name}</h1>
            <div style={{ display: 'flex', gap: 6 }}>
              {user?.is_verified && <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck size={11} /> {t('common.verified')}</span>}
              {user?.role === 'admin' && <span className="badge badge-red">ADMIN</span>}
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          {user?.district && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={11} /> {user.district}{user.division && `, ${user.division}`}</div>}
        </div>
      </div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        {/* Sidebar tabs */}
        <div className="profile-sidebar" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0.75rem', height: 'fit-content' }}>
          {TABS.map(tab_item => (
            <button key={tab_item.key} onClick={() => switchTab(tab_item.key)}
              className={tab === tab_item.key ? 'active' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, border: 'none',
                background: tab === tab_item.key ? 'rgba(230,57,70,0.12)' : 'transparent',
                color: tab === tab_item.key ? 'var(--red)' : 'var(--text-muted)',
                fontWeight: tab === tab_item.key ? 700 : 500, fontSize: '0.84rem', cursor: 'pointer',
                width: '100%', textAlign: 'left', transition: 'all 0.18s',
                borderLeft: tab === tab_item.key ? '2px solid var(--red)' : '2px solid transparent',
              }}>
              {tab_item.icon}{tab_item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="profile-content" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>

          {/* Profile */}
          {tab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</h2>
                <button onClick={() => setEditing(s => !s)} className="btn btn-ghost btn-sm"><FiEdit2 size={13} />{editing ? t('common.cancel') : t('common.edit')}</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { label: isBn ? 'পূর্ণ নাম' : 'Full Name', field: 'name', type: 'text' },
                  { label: isBn ? 'ফোন নম্বর' : 'Phone', field: 'phone', type: 'tel' },
                  { label: isBn ? 'বিভাগ (এলাকা)' : 'Division', field: 'division', type: 'text' },
                  { label: isBn ? 'জেলা' : 'District', field: 'district', type: 'text' },
                  { label: isBn ? 'উপজেলা' : 'Upazila', field: 'upazila', type: 'text' },
                ].map(({ label, field, type }) => (
                  <div className="form-group" key={field}>
                    <label className="form-label">{label}</label>
                    {editing
                      ? <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="form-input" />
                      : <div style={{ padding: '0.65rem 1rem', background: 'var(--surface-2)', borderRadius: 10, fontSize: '0.9rem', color: form[field] ? '#fff' : 'var(--text-dim)', border: '1px solid var(--border)' }}>{form[field] || '—'}</div>
                    }
                  </div>
                ))}
                {editing && (
                  <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
                    {loading ? <div className="spinner spinner-sm" /> : <><FiSave size={13} />{t('common.save')}</>}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Applied Jobs */}
          {tab === 'jobs' && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>{isBn ? 'আবেদন করা চাকরি' : 'Job Applications'} ({appliedJobs.length})</h2>
              {appliedJobs.length === 0 ? (
                <div className="empty"><div className="empty-icon"><FiBriefcase size={40} style={{ opacity: 0.4 }} /></div><div>{isBn ? 'কোনো আবেদন নেই' : 'No applications yet'}</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {appliedJobs.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{a.job_title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.company} · {new Date(a.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Job Posts */}
          {tab === 'my-jobs' && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>{isBn ? 'আমার চাকরির পোস্ট' : 'My Job Posts'} ({myJobs.length})</h2>
              {myJobs.length === 0 ? (
                <div className="empty"><div className="empty-icon"><FiBriefcase size={40} style={{ opacity: 0.4 }} /></div><div>{isBn ? 'কোনো চাকরি পোস্ট করা হয়নি' : 'No jobs posted yet'}</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myJobs.map(j => (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{j.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{j.type} · {new Date(j.created_at).toLocaleDateString()}</div>
                        <button onClick={() => openApplicants(j.id, j.title)} style={{ marginTop: 8, background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiUsers size={12} /> {j.applicants || 0} {isBn ? 'আবেদনকারী' : 'Applicants'}
                        </button>
                      </div>
                      <span className={`badge ${STATUS_BADGE[j.status] || 'badge-gray'}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Donations */}
          {tab === 'donations' && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>{isBn ? 'আমার সাহায্যের অনুরোধ' : 'My Help Requests'} ({myDonations.length})</h2>
              {myDonations.length === 0 ? (
                <div className="empty"><div className="empty-icon"><FiHeart size={40} style={{ opacity: 0.4 }} /></div><div>{isBn ? 'কোনো অনুরোধ নেই' : 'No requests yet'}</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myDonations.map(d => {
                    const pct = Math.min(100, Math.round((d.amount_raised / d.amount_needed) * 100));
                    return (
                      <div key={d.id} style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{d.title}</div>
                          <span className={`badge ${STATUS_BADGE[d.status] || 'badge-gray'}`}>{d.status}</span>
                        </div>
                        <div className="progress-track" style={{ marginBottom: 5 }}>
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>৳{Number(d.amount_raised).toLocaleString()} / ৳{Number(d.amount_needed).toLocaleString()} ({pct}%)</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bookmarks */}
          {tab === 'bookmarks' && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>{isBn ? 'সেভ করা আইটেম' : 'Saved Items'} ({bookmarks.length})</h2>
              {bookmarks.length === 0 ? (
                <div className="empty"><div className="empty-icon"><FiBookmark size={40} style={{ opacity: 0.4 }} /></div><div>{isBn ? 'কোনো সেভ করা আইটেম নেই' : 'No saved items'}</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bookmarks.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}><FiBookmark size={11} /> {b.entity_type} #{b.entity_id}</span>
                      <span className="badge badge-gray">{b.entity_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{isBn ? 'বিজ্ঞপ্তি' : 'Notifications'} ({notifs.filter(n => !n.is_read).length} {isBn ? 'অপঠিত' : 'unread'})</h2>
                {notifs.some(n => !n.is_read) && <button onClick={markRead} className="btn btn-ghost btn-sm"><FiCheck size={13} />{isBn ? 'সব পড়া হয়েছে' : 'Mark all read'}</button>}
              </div>
              {notifs.length === 0 ? (
                <div className="empty"><div className="empty-icon"><FiBell size={40} style={{ opacity: 0.4 }} /></div><div>{isBn ? 'কোনো বিজ্ঞপ্তি নেই' : 'No notifications'}</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifs.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', background: n.is_read ? 'var(--surface-2)' : 'rgba(230,57,70,0.06)', borderRadius: 12, border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(230,57,70,0.15)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginBottom: 3 }}>{n.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.body}</div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                          {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', marginTop: 4, marginLeft: 'auto' }} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '1.5rem' }}>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</h2>
              <form onSubmit={handlePwd} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: 420 }}>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</label>
                  <input type="password" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</label>
                  <input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} className="form-input" placeholder="Min. 6 characters" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
                  {loading ? <div className="spinner spinner-sm" /> : <><FiLock size={13} />{isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}</>}
                </button>
              </form>

              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--red)', fontSize: '1rem', marginBottom: '0.5rem' }}>{isBn ? 'অ্যাকাউন্ট মুছুন' : 'Delete Account'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', maxWidth: 420 }}>{isBn ? 'একবার অ্যাকাউন্ট মুছে ফেললে তা আর ফিরে পাওয়া যাবে না। আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।' : 'Once you delete your account, there is no going back. All your data will be permanently removed.'}</p>
                <button onClick={handleDeleteAccount} className="btn btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)', background: 'transparent' }} disabled={loading}>
                  {isBn ? 'আমার অ্যাকাউন্ট মুছে ফেলুন' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicants Modal */}
      {showApplicants && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowApplicants(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 700, padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
                {isBn ? 'আবেদনকারী:' : 'Applicants for:'} <span style={{ color: 'var(--cyan)' }}>{activeJobTitle}</span>
              </h2>
              <button onClick={() => setShowApplicants(false)} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
            </div>
            {loadingApplicants ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : applicants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{isBn ? 'এই চাকরির জন্য এখনও কোনো আবেদনকারী নেই।' : 'No applicants yet for this job.'}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applicants.map(app => (
                  <div key={app.id} style={{ background: 'var(--surface-2)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{app.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(app.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span>✉️ {app.email}</span>
                      {app.phone && <span>📞 {app.phone}</span>}
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', border: '1px solid var(--border)' }}>
                      <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>{isBn ? 'কভার লেটার:' : 'Cover Letter:'}</strong>
                      {app.cover_letter || (isBn ? 'কোনো কভার লেটার দেওয়া হয়নি।' : 'No cover letter provided.')}
                    </div>
                    {app.resume && (
                      <div style={{ marginTop: '1rem' }}>
                        <a href={`${import.meta.env.VITE_API_URL || ''}${app.resume}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                          {isBn ? 'রেজুমে দেখুন' : 'View Resume'}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .profile-header { flex-direction: column; text-align: center; padding: 1.5rem !important; }
          .profile-layout { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .profile-sidebar { display: flex !important; overflow-x: auto; gap: 8px; padding: 0.5rem !important; margin-bottom: 0.5rem; scrollbar-width: none; }
          .profile-sidebar::-webkit-scrollbar { display: none; }
          .profile-sidebar button { white-space: nowrap; width: auto !important; border-left: none !important; border-bottom: 2px solid transparent; padding: 8px 16px !important; flex-shrink: 0; }
          .profile-sidebar button.active { border-bottom: 2px solid var(--red) !important; background: rgba(230,57,70,0.1) !important; border-radius: 8px 8px 0 0 !important; }
          .profile-content { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
