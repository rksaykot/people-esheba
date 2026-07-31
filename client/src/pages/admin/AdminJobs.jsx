import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiEye, FiUsers, FiBriefcase, FiPlus, FiEdit2, FiX, FiSave, FiSearch, FiUploadCloud, FiCheck, FiClock, FiPhone, FiExternalLink, FiMail } from 'react-icons/fi';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

const JOB_TYPES = ['full-time', 'part-time', 'freelance', 'internship', 'remote', 'govt', 'other'];
const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const BLANK = { title: '', company: '', type: 'full-time', location: '', district: '', division: '', description: '', salary: '', deadline: '', is_active: true };

const STATUS_TABS = [
  { key: '', label: 'All', labelBn: 'সব' },
  { key: 'pending', label: 'Pending', labelBn: 'অপেক্ষমান' },
  { key: 'active', label: 'Active', labelBn: 'সক্রিয়' },
  { key: 'closed', label: 'Closed', labelBn: 'বন্ধ' },
  { key: 'draft', label: 'Draft', labelBn: 'ড্রাফট' },
];

export default function AdminJobs() {
  const { t, isBn } = useLang();
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Applicants modal state
  const [showApplicants, setShowApplicants] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [activeJobTitle, setActiveJobTitle] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const openApplicants = async (jobId, title) => {
    setActiveJobId(jobId);
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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15, ...(search && { search }), ...(statusFilter && { status: statusFilter }), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/jobs?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  // Fetch pending count for badge
  const fetchPendingCount = async () => {
    try {
      const { data } = await api.get('/admin/jobs?status=pending&limit=1');
      setPendingCount(data.data.total || 0);
    } catch {}
  };

  useEffect(() => { fetchJobs(); }, [page, statusFilter, districtFilter]); // eslint-disable-line
  useEffect(() => { fetchPendingCount(); }, []); // eslint-disable-line

  const openAdd  = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, is_active: !!item.is_active }); setEditing(item.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) return toast.error('Title and company required');
    setSaving(true);
    const payload = {
      title: form.title, company: form.company, type: form.type, description: form.description,
      district: form.location || form.district || '', division: form.division,
      salary: form.salary, deadline: form.deadline || null, is_active: form.is_active,
    };
    try {
      if (editing) {
        await api.put(`/admin/jobs/${editing}`, payload);
        toast.success('Job updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...form, district: payload.district } : x));
      } else {
        const { data } = await api.post('/admin/jobs', payload);
        toast.success('Job posted');
        setItems(i => [data.data, ...i]);
        setTotal(t => t + 1);
      }
      setShowForm(false);
    } catch (e2) { toast.error(e2.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteJob = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      toast.success('Job deleted');
      setItems(i => i.filter(x => x.id !== id));
      setTotal(t => t - 1);
      setSelectedIds(s => { const next = new Set(s); next.delete(id); return next; });
    } catch { toast.error('Failed'); }
  };

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} jobs?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/jobs/${id}`)));
      toast.success(`Deleted ${selectedIds.size} jobs`);
      setSelectedIds(new Set());
      fetchJobs();
    } catch { toast.error('Failed to delete some jobs'); fetchJobs(); }
    finally { setDeletingBulk(false); }
  };

  const updateJobStatus = async (id, status) => {
    try {
      await api.put(`/admin/jobs/${id}/status`, { status });
      toast.success(isBn ? `চাকরি ${status === 'active' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে` : `Job ${status}`);
      setItems(i => i.map(x => x.id === id ? { ...x, status } : x));
      if (statusFilter === 'pending') setItems(i => i.filter(x => x.id !== id));
      fetchPendingCount();
    } catch { toast.error('Failed'); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const TYPE_COLOR = { 'full-time': 'var(--green)', 'part-time': 'var(--cyan)', 'freelance': 'var(--purple)', 'internship': 'var(--amber)', 'govt': 'var(--red)' };
  const STATUS_COLOR = { active: 'badge-green', pending: 'badge-amber', closed: 'badge-red', draft: 'badge-gray' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-strong)', marginBottom: 4 }}>
            <FiBriefcase style={{ color: 'var(--green)' }} /> {t('admin.jobs')}
            {pendingCount > 0 && (
              <span style={{ background: '#F59E0B', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                {pendingCount} {isBn ? 'অপেক্ষমান' : 'pending'}
              </span>
            )}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchJobs(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn ? 'পদ বা কোম্পানি...' : 'Search jobs...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }} />
            </div>
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 150 }}>
              <option value="">{isBn ? 'সব জেলা' : 'All Districts'}</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>{t('common.search')}</button>
          </form>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="btn btn-outline" style={{ height: 40, borderRadius: 10, borderColor:'var(--red)', color:'var(--red)' }} disabled={deletingBulk}>
                {deletingBulk ? <div className="spinner spinner-sm" style={{ borderTopColor:'var(--red)' }}/> : <FiTrash2 size={13}/>} 
                {isBn ? `নির্বাচিত মুছুন (${selectedIds.size})` : `Delete (${selectedIds.size})`}
              </button>
            )}
            <button onClick={() => setShowImport(true)} className="btn btn-ghost" style={{ height: 40, border: '1px solid var(--border)', borderRadius: 10 }}><FiUploadCloud size={14} /> {isBn ? 'ইমপোর্ট' : 'Import'}</button>
            <button onClick={openAdd} className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}><FiPlus size={14} /> {isBn ? 'নতুন চাকরি' : 'Post Job'}</button>
          </div>
        </div>
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
                background: statusFilter === tab.key ? (tab.key === 'pending' ? '#F59E0B' : 'var(--primary)') : 'transparent',
                color: statusFilter === tab.key ? '#fff' : 'var(--text-muted)'
              }}>
              {tab.key === 'pending' && <FiClock size={11} />}
              {isBn ? tab.labelBn : tab.label}
              {tab.key === 'pending' && pendingCount > 0 && <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem' }}>{pendingCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor:'var(--red)' }} /></th>
                <th>{isBn ? 'পদ' : 'Position'}</th>
                <th>{isBn ? 'প্রতিষ্ঠান' : 'Company'}</th>
                <th>{isBn ? 'ধরন' : 'Type'}</th>
                <th>{isBn ? 'এলাকা' : 'Location'}</th>
                <th>{isBn ? 'আবেদনকারী' : 'Applicants'}</th>
                <th>{isBn ? 'দেখেছেন' : 'Views'}</th>
                <th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th>{isBn ? 'তারিখ' : 'Date'}</th>
                <th style={{ textAlign:'right' }}>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
              </tr></thead>
              <tbody>
                {items.map(j => (
                  <tr key={j.id} onClick={() => setViewItem(j)} style={{ cursor:'pointer', background: j.status === 'pending' ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(j.id)} onChange={(e) => toggleSelect(j.id, e)} style={{ accentColor:'var(--red)' }} /></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>{j.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 1 }}>by {j.poster_name}</div>
                    </td>
                    <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{j.company}</td>
                    <td><span className="badge" style={{ background: `${TYPE_COLOR[j.type] || 'var(--green)'}18`, color: TYPE_COLOR[j.type] || 'var(--green)' }}>{j.type}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{j.district || '—'}</td>
                    <td onClick={(e) => { e.stopPropagation(); openApplicants(j.id, j.title); }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.83rem', color: 'var(--cyan)' }}>
                        <FiUsers size={12} />{j.applicants || 0}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{j.views}</td>
                    <td><span className={`badge ${STATUS_COLOR[j.status] || 'badge-gray'}`}>{j.status}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(j.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {/* Approve / Reject for pending jobs */}
                        {j.status === 'pending' && (<>
                          <button onClick={(e) => { e.stopPropagation(); updateJobStatus(j.id, 'active'); }} title={isBn ? 'অনুমোদন করুন' : 'Approve'}
                            style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#10B981'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                            <FiCheck size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); updateJobStatus(j.id, 'closed'); }} title={isBn ? 'বাতিল করুন' : 'Reject'}
                            style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                            <FiX size={14} />
                          </button>
                        </>)}
                        <Link to={`/jobs/${j.id}`} target="_blank" onClick={(e) => e.stopPropagation()}
                          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <FiEye size={14} />
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(j); }}
                          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={(e) => { deleteJob(j.id, j.title, e); }}
                          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#EF4444'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>{t('common.noResults')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= pages).map(p => (
            <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 640, padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
                {editing ? (isBn ? 'চাকরি সম্পাদনা' : 'Edit Job listing') : (isBn ? 'নতুন চাকরি পোস্ট করুন' : 'Post New Job')}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">{isBn ? 'পদের নাম' : 'Job Title'} *</label>
                  <input value={form.title} onChange={e => F('title', e.target.value)} className="form-input" placeholder="Software Engineer..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'কোম্পানি' : 'Company Name'} *</label>
                  <input value={form.company} onChange={e => F('company', e.target.value)} className="form-input" placeholder="Tech Solution Ltd..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'চাকরির ধরন' : 'Job Type'}</label>
                  <select value={form.type} onChange={e => F('type', e.target.value)} className="form-select">
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'এলাকা' : 'Location'}</label>
                  <input value={form.location} onChange={e => F('location', e.target.value)} className="form-input" placeholder="Banani, Dhaka" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিভাগ' : 'Division'}</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">{isBn ? 'নির্বাচন করুন' : 'Select Division'}</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বেতন' : 'Salary'}</label>
                  <input value={form.salary} onChange={e => F('salary', e.target.value)} className="form-input" placeholder="25,000 - 35,000 BDT" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'আবেদনের শেষ তারিখ' : 'Deadline'}</label>
                  <input type="date" value={form.deadline} onChange={e => F('deadline', e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">{isBn ? 'বিবরণ' : 'Description'}</label>
                  <textarea value={form.description} onChange={e => F('description', e.target.value)} className="form-input" style={{ minHeight: 100, padding: '12px' }} placeholder="Job responsibilities and requirements..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, height: 48, borderRadius: 12, fontSize: '0.95rem', fontWeight: 700 }} disabled={saving}>
                  {saving ? <div className="spinner spinner-sm" /> : <><FiSave size={16} /> {isBn ? 'সংরক্ষণ করুন' : 'Save Job listing'}</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, height: 48, borderRadius: 12, border: '1px solid var(--border)' }}>{isBn ? 'বাতিল' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <span style={{display:'flex', alignItems:'center', gap:4}}><FiMail size={12}/> {app.email}</span>
                      {app.phone && <span style={{display:'flex', alignItems:'center', gap:4}}><FiPhone size={12}/> {app.phone}</span>}
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

      <BulkImportModal isOpen={showImport} onClose={() => setShowImport(false)} table="jobs" onImportSuccess={() => { setPage(1); fetchJobs(); }} />
    </div>
  );
}
