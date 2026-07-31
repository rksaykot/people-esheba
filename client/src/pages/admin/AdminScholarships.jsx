import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiSearch, FiExternalLink, FiUploadCloud, FiAward } from 'react-icons/fi';
import BulkImportModal from '../../components/admin/BulkImportModal';

const SCHOLARSHIP_TYPES = ['govt', 'ngo', 'international', 'corporate', 'other'];
const BLANK = { title: '', provider: '', category: 'govt', amount: '', deadline: '', link: '', description: '', is_active: true };

export default function AdminScholarships() {
  const { isBn } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15, ...(search && { search }) });
      const { data } = await api.get(`/admin/scholarships?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (it) => { setForm({ ...it, is_active: !!it.is_active, deadline: it.deadline ? it.deadline.split('T')[0] : '' }); setEditing(it.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    try {
      const payload = { ...form, deadline: form.deadline || null };
      if (editing) {
        await api.put(`/admin/scholarships/${editing}`, payload);
        toast.success('Updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...payload } : x));
      } else {
        const { data } = await api.post('/admin/scholarships', payload);
        toast.success('Created');
        setItems(i => [data.data, ...i]);
        setTotal(t => t + 1);
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/scholarships/${id}`);
      toast.success('Deleted');
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
    if (!window.confirm(`Delete ${selectedIds.size} scholarships?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/scholarships/${id}`)));
      toast.success(`Deleted ${selectedIds.size} scholarships`);
      setSelectedIds(new Set());
      fetchData();
    } catch { toast.error('Failed to delete some scholarships'); fetchData(); }
    finally { setDeletingBulk(false); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '4.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}><FiAward style={{ color: 'var(--primary)' }} /> {isBn ? 'বৃত্তি ব্যবস্থাপনা' : 'Scholarships'}</h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchData(); }} style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn ? 'খুঁজুন...' : 'Search...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', minWidth: 220 }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>Go</button>
          </form>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="btn btn-outline" style={{ height: 40, borderRadius: 10, borderColor: 'var(--red)', color: 'var(--red)' }} disabled={deletingBulk}>
                {deletingBulk ? <div className="spinner spinner-sm" style={{ borderTopColor: 'var(--red)' }} /> : <FiTrash2 size={13} />}
                {isBn ? `নির্বাচিত মুছুন (${selectedIds.size})` : `Delete (${selectedIds.size})`}
              </button>
            )}
            <button onClick={() => setShowImport(true)} className="btn btn-ghost" style={{ height: 40, borderRadius: 10, border: '1px solid var(--border)' }}><FiUploadCloud size={13} />{isBn ? 'ইমপোর্ট' : 'Import'}</button>
            <button onClick={openAdd} className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}><FiPlus size={13} />{isBn ? 'যোগ করুন' : 'Add'}</button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div> : (
          <div className="table-wrap"><table>
            <thead><tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--red)' }} /></th>
              <th>{isBn ? 'নাম' : 'Title'}</th><th>{isBn ? 'প্রদানকারী' : 'Provider'}</th>
              <th>{isBn ? 'পরিমাণ' : 'Amount'}</th><th>{isBn ? 'শেষ সময়' : 'Deadline'}</th>
              <th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th><th>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
            </tr></thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id} style={{ cursor: 'pointer' }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(s.id)} onChange={(e) => toggleSelect(s.id, e)} style={{ accentColor: 'var(--red)' }} /></td>
                  <td style={{ maxWidth: 220 }} onClick={() => openEdit(s)}>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    {s.link && <a href={s.link} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 3 }}><FiExternalLink size={9} />Link</a>}
                  </td>
                  <td onClick={() => openEdit(s)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.provider || '—'}</td>
                  <td onClick={() => openEdit(s)} style={{ fontSize: '0.8rem', color: 'var(--green)' }}>{s.amount || '—'}</td>
                  <td onClick={() => openEdit(s)}>
                    {s.deadline ? (
                      new Date(s.deadline) < new Date() ? <span className="badge badge-red">{isBn ? 'মেয়াদোত্তীর্ণ' : 'Expired'}</span> : <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(s.deadline).toLocaleDateString()}</span>
                    ) : '—'}
                  </td>
                  <td onClick={() => openEdit(s)}><span className={`badge ${s.is_active ? 'badge-green' : 'badge-gray'}`}>{s.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'লুকানো' : 'Hidden')}</span></td>
                  <td><div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={12} /></button>
                    <button onClick={(e) => deleteItem(s.id, s.title, e)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(230,57,70,0.2)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={12} /></button>
                  </div></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}><FiAward style={{ verticalAlign: 'middle', marginRight: 6 }} /> {isBn ? 'কোনো বৃত্তি নেই' : 'No scholarships found'}</td></tr>}
            </tbody>
          </table></div>
        )}
      </div>

      {pages > 1 && <div className="pagination">
        <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= pages).map(p => (
          <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
      </div>}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 560, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{editing ? (isBn ? 'সম্পাদনা' : 'Edit') : (isBn ? 'নতুন বৃত্তি' : 'New Scholarship')}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={13} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group"><label className="form-label">{isBn ? 'শিরোনাম' : 'Title'} *</label>
                <input value={form.title} onChange={e => F('title', e.target.value)} className="form-input" placeholder="Scholarship title" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
                <div className="form-group"><label className="form-label">{isBn ? 'প্রদানকারী' : 'Provider'}</label>
                  <input value={form.provider} onChange={e => F('provider', e.target.value)} className="form-input" placeholder="Organization/Govt" />
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'বিভাগ' : 'Category'}</label>
                  <select value={form.category} onChange={e => F('category', e.target.value)} className="form-select">
                    {SCHOLARSHIP_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'পরিমাণ' : 'Amount'}</label>
                  <input value={form.amount} onChange={e => F('amount', e.target.value)} className="form-input" placeholder="10,000 BDT/yr" />
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'শেষ সময়' : 'Deadline'}</label>
                  <input type="date" value={form.deadline} onChange={e => F('deadline', e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">{isBn ? 'লিঙ্ক' : 'Link (URL)'}</label>
                  <input value={form.link} onChange={e => F('link', e.target.value)} className="form-input" placeholder="https://..." />
                </div>
              </div>
              <div className="form-group"><label className="form-label">{isBn ? 'বিবরণ' : 'Description'}</label>
                <textarea value={form.description} onChange={e => F('description', e.target.value)} className="form-textarea" rows={3} placeholder="Eligibility, details..." />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={!!form.is_active} onChange={e => F('is_active', e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--green)' }} />
                {isBn ? 'সক্রিয় (প্রকাশিত)' : 'Active (Published)'}
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>{saving ? <div className="spinner spinner-sm" /> : <><FiSave size={13} />{isBn ? 'সংরক্ষণ' : 'Save'}</>}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{isBn ? 'বাতিল' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        table="scholarships"
        onImportSuccess={() => { setPage(1); fetchData(); }}
      />
    </div>
  );
}
