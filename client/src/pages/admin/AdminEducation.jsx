import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiSearch, FiUploadCloud, FiBook } from 'react-icons/fi';
import { MdOutlineSchool, MdAccountBalance } from 'react-icons/md';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

const TYPES = ['school', 'college', 'university'];
const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const SUBTYPES = {
  school: ['govt-school', 'private-school', 'madrasa', 'other'],
  college: ['govt-college', 'private-college', 'madrasah', 'technical', 'other'],
  university: ['public', 'private', 'engineering', 'medical', 'other'],
};
const BLANK = { name: '', type: 'school', subtype: 'govt-school', district: '', division: '', address: '', phone: '', website: '', description: '', is_verified: false, is_active: true };

export default function AdminEducation() {
  const { isBn, t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15, ...(search && { search }), ...(typeFilter && { type: typeFilter }), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/education?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, typeFilter, districtFilter]); // eslint-disable-line

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (it) => { setForm({ ...it, is_verified: !!it.is_verified, is_active: !!it.is_active }); setEditing(it.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/education/${editing}`, form);
        toast.success('Updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...form } : x));
      } else {
        const { data } = await api.post('/admin/education', form);
        toast.success('Created');
        setItems(i => [data.data, ...i]);
        setTotal(t => t + 1);
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/education/${id}`);
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
    if (!window.confirm(`Delete ${selectedIds.size} items?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/education/${id}`)));
      toast.success(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      fetchData();
    } catch { toast.error('Failed to delete some items'); fetchData(); }
    finally { setDeletingBulk(false); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const TYPE_ICON = { school: <MdOutlineSchool size={14} />, college: <MdAccountBalance size={14} />, university: <FiBook size={14} /> };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '4.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}><FiBook style={{ color: 'var(--primary)' }} /> {isBn ? 'শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনা' : 'Education Management'}</h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['', 'school', 'college', 'university'].map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-ghost'}`}>
                {t ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{TYPE_ICON[t]} {t}</span> : 'All'}
              </button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchData(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn ? 'খুঁজুন...' : 'Search name...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }} />
            </div>
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 150 }}>
              <option value="">{isBn ? 'সব জেলা' : 'All Districts'}</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>{t('common.search')}</button>
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
              <th>{isBn ? 'নাম' : 'Name'}</th><th>{isBn ? 'ধরন' : 'Type'}</th>
              <th>{isBn ? 'জেলা' : 'District'}</th><th>{isBn ? 'ফোন' : 'Phone'}</th>
              <th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th><th style={{ textAlign: 'right' }}>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
            </tr></thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} onClick={() => setViewItem(it)} style={{ cursor: 'pointer' }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(it.id)} onChange={(e) => toggleSelect(it.id, e)} style={{ accentColor: 'var(--red)' }} /></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>{it.name}</div>
                    {it.is_verified && <span style={{ fontSize: '0.68rem', color: 'var(--green)' }}>✓ verified</span>}
                    {it.website && <div style={{ fontSize: '0.68rem', color: 'var(--cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{it.website}</div>}
                  </td>
                  <td><span className="badge badge-cyan">{TYPE_ICON[it.type]} {it.type}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{it.district || '—'}{it.division && `, ${it.division}`}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{it.phone || '—'}</td>
                  <td><span className={`badge ${it.is_active ? 'badge-green' : 'badge-gray'}`}>{it.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}</span></td>
                  <td style={{ textAlign: 'right' }}><div style={{ display: 'inline-flex', gap: 5 }}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(it); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={12} /></button>
                    <button onClick={(e) => { deleteItem(it.id, it.name, e); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(230,57,70,0.2)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={12} /></button>
                  </div></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}><FiBook style={{ verticalAlign: 'middle', marginRight: 6 }} /> {isBn ? 'কোনো প্রতিষ্ঠান নেই' : 'No institutions found'}</td></tr>}
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
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{editing ? (isBn ? 'সম্পাদনা' : 'Edit') : (isBn ? 'নতুন প্রতিষ্ঠান' : 'New Institution')}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={13} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">{isBn ? 'নাম' : 'Name'} *</label>
                  <input value={form.name} onChange={e => F('name', e.target.value)} className="form-input" placeholder="Institution name" required />
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'ধরন' : 'Type'}</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, subtype: (SUBTYPES[e.target.value] || ['other'])[0] }))} className="form-select">
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'উপধরন' : 'Subtype'}</label>
                  <select value={form.subtype} onChange={e => F('subtype', e.target.value)} className="form-select">
                    {(SUBTYPES[form.type] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'ফোন' : 'Phone'}</label>
                  <input value={form.phone} onChange={e => F('phone', e.target.value)} className="form-input" placeholder="02-XXXXXXX" />
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                  <input value={form.district} onChange={e => F('district', e.target.value)} className="form-input" placeholder="Dhaka" />
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'বিভাগ' : 'Division'}</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">{isBn ? 'বেছে নিন' : 'Select'}</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">{isBn ? 'ঠিকানা' : 'Address'}</label>
                  <input value={form.address} onChange={e => F('address', e.target.value)} className="form-input" placeholder="Full address" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Website</label>
                  <input value={form.website} onChange={e => F('website', e.target.value)} className="form-input" placeholder="https://..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[{ field: 'is_verified', label: isBn ? 'যাচাইকৃত' : 'Verified' }, { field: 'is_active', label: isBn ? 'সক্রিয়' : 'Active' }].map(({ field, label }) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={!!form[field]} onChange={e => F(field, e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--green)' }} />{label}
                  </label>
                ))}
              </div>
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
        table="education_institutions"
        onImportSuccess={() => { setPage(1); fetchData(); }}
      />
      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
