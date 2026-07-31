import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiSearch, FiUploadCloud, FiStar } from 'react-icons/fi';
import { MdOutlineMedicalServices } from 'react-icons/md';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

const SPECIALTIES = ['Cardiologist', 'Pediatrician', 'Neurologist', 'Gynecologist', 'Medicine', 'Orthopedic', 'Ophthalmologist', 'ENT', 'Dermatologist', 'Psychiatrist', 'Dentist', 'Dermatology', 'General'];
const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const BLANK = { name: '', name_bn: '', specialty: 'Medicine', specialty_bn: '', area: '', area_bn: '', district: '', division: '', phone: '', hours: '', rating: '', is_verified: false, is_active: true };

export default function AdminDoctors() {
  const { isBn, t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
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
      const q = new URLSearchParams({ page, limit: 15, ...(search && { search }), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/doctors?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, districtFilter]); // eslint-disable-line

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, is_verified: !!item.is_verified, is_active: !!item.is_active }); setEditing(item.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty) return toast.error('Name and specialty required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/doctors/${editing}`, form);
        toast.success('Updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...form } : x));
      } else {
        const { data } = await api.post('/admin/doctors', form);
        toast.success('Doctor created');
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
      await api.delete(`/admin/doctors/${id}`);
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
    if (!window.confirm(`Delete ${selectedIds.size} doctors?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/doctors/${id}`)));
      toast.success(`Deleted ${selectedIds.size} doctors`);
      setSelectedIds(new Set());
      fetchData();
    } catch { toast.error('Failed to delete some doctors'); fetchData(); }
    finally { setDeletingBulk(false); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '4.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdOutlineMedicalServices style={{ color: 'var(--primary)' }} /> {isBn ? 'ডাক্তার ব্যবস্থাপনা' : 'Doctors Management'}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
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
            <button onClick={openAdd} className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}><FiPlus size={13} />{isBn ? 'যোগ করুন' : 'Add Doctor'}</button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--red)' }} /></th>
                <th>{isBn ? 'নাম' : 'Name'}</th>
                <th>{isBn ? 'বিশেষজ্ঞতা' : 'Specialty'}</th>
                <th>{isBn ? 'এলাকা' : 'Area'}</th>
                <th>{isBn ? 'ফোন' : 'Phone'}</th>
                <th>{isBn ? 'সময়' : 'Hours'}</th>
                <th>{isBn ? 'রেটিং' : 'Rating'}</th>
                <th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th style={{ textAlign: 'right' }}>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
              </tr></thead>
              <tbody>
                {items.map(d => (
                  <tr key={d.id} onClick={() => setViewItem(d)} style={{ cursor: 'pointer' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(d.id)} onChange={(e) => toggleSelect(d.id, e)} style={{ accentColor: 'var(--red)' }} /></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>{d.name}</div>
                      {d.is_verified ? <span style={{ fontSize: '0.68rem', color: 'var(--green)' }}>✓ verified</span> : null}
                    </td>
                    <td><span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{d.specialty}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.area || '—'}{d.district && `, ${d.district}`}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.phone || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{d.hours || '—'}</td>
                    <td style={{ fontSize: '0.83rem', color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{d.rating ? <><FiStar fill="currentColor" /> {d.rating}</> : '—'}</td>
                    <td><span className={`badge ${d.is_active ? 'badge-green' : 'badge-gray'}`}>{d.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 5 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(d); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={12} /></button>
                        <button onClick={(e) => { deleteItem(d.id, d.name, e); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(230,57,70,0.2)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}><MdOutlineMedicalServices size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />{isBn ? 'কোনো ডাক্তার নেই' : 'No doctors found'}</td></tr>}
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

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 560, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                {editing ? (isBn ? 'ডাক্তার সম্পাদনা' : 'Edit Doctor') : (isBn ? 'নতুন ডাক্তার যোগ করুন' : 'Add New Doctor')}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={13} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'নাম (ইংরেজি)' : 'Full Name (English)'} *</label>
                  <input value={form.name} onChange={e => F('name', e.target.value)} className="form-input" placeholder="Dr. ..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'নাম (বাংলা)' : 'Full Name (Bangla)'}</label>
                  <input value={form.name_bn || ''} onChange={e => F('name_bn', e.target.value)} className="form-input" placeholder="ডা. ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিশেষজ্ঞতা (ইংরেজি)' : 'Specialty (English)'} *</label>
                  <select value={form.specialty} onChange={e => F('specialty', e.target.value)} className="form-select" required>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিশেষজ্ঞতা (বাংলা)' : 'Specialty (Bangla)'}</label>
                  <input value={form.specialty_bn || ''} onChange={e => F('specialty_bn', e.target.value)} className="form-input" placeholder="যেমন: হৃদরোগ বিশেষজ্ঞ" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'ফোন' : 'Phone'}</label>
                  <input value={form.phone} onChange={e => F('phone', e.target.value)} className="form-input" placeholder="017XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'এলাকা (ইংরেজি)' : 'Area (English)'}</label>
                  <input value={form.area} onChange={e => F('area', e.target.value)} className="form-input" placeholder="Mirpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'এলাকা (বাংলা)' : 'Area (Bangla)'}</label>
                  <input value={form.area_bn || ''} onChange={e => F('area_bn', e.target.value)} className="form-input" placeholder="মিরপুর" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                  <input value={form.district} onChange={e => F('district', e.target.value)} className="form-input" placeholder="Dhaka" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিভাগ' : 'Division'}</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">{isBn ? 'বেছে নিন' : 'Select'}</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'সময়সূচি' : 'Hours'}</label>
                  <input value={form.hours} onChange={e => F('hours', e.target.value)} className="form-input" placeholder="Sat–Thu 9-5" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'রেটিং' : 'Rating'} (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => F('rating', e.target.value)} className="form-input" placeholder="4.5" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { field: 'is_verified', label: isBn ? 'যাচাইকৃত' : 'Verified' },
                  { field: 'is_active', label: isBn ? 'সক্রিয়' : 'Active' },
                ].map(({ field, label }) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={!!form[field]} onChange={e => F(field, e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--green)' }} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? <div className="spinner spinner-sm" /> : <><FiSave size={13} />{isBn ? 'সংরক্ষণ করুন' : 'Save'}</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{isBn ? 'বাতিল' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        table="doctors"
        onImportSuccess={() => { setPage(1); fetchData(); }}
      />
      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
