import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiSearch, FiUploadCloud, FiActivity, FiCheckCircle } from 'react-icons/fi';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const PHARMACY_TYPES = ['retail', 'hospital-pharmacy', '24-7'];
const BLANK = { name: '', name_bn: '', area: '', area_bn: '', district: '', division: '', phone: '', hours: '', type: 'retail', is_24h: false, is_verified: false, is_active: true };

export default function AdminPharmacy() {
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
      const { data } = await api.get(`/admin/pharmacies?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, districtFilter]); // eslint-disable-line

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (it) => { setForm({ ...it, is_24h: !!it.is_24h, is_verified: !!it.is_verified, is_active: !!it.is_active }); setEditing(it.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/pharmacies/${editing}`, form);
        toast.success('Updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...form } : x));
      } else {
        const { data } = await api.post('/admin/pharmacies', form);
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
      await api.delete(`/admin/pharmacies/${id}`);
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
    if (!window.confirm(`Delete ${selectedIds.size} pharmacies?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/pharmacies/${id}`)));
      toast.success(`Deleted ${selectedIds.size} pharmacies`);
      setSelectedIds(new Set());
      fetchData();
    } catch { toast.error('Failed to delete some pharmacies'); fetchData(); }
    finally { setDeletingBulk(false); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '4.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}><FiActivity size={20} /> {isBn ? 'ফার্মেসি ব্যবস্থাপনা' : 'Pharmacy Management'}</h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
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
            <button onClick={openAdd} className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}><FiPlus size={13} />{isBn ? 'যোগ করুন' : 'Add Pharmacy'}</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div> : (
          <div className="table-wrap"><table>
            <thead><tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--red)' }} /></th>
              <th>{isBn ? 'নাম' : 'Name'}</th><th>{isBn ? 'এলাকা' : 'Area'}</th><th>{isBn ? 'জেলা' : 'District'}</th>
              <th>{isBn ? 'ফোন' : 'Phone'}</th><th>24/7</th><th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th><th style={{ textAlign: 'right' }}>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
            </tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} onClick={() => setViewItem(p)} style={{ cursor: 'pointer' }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(p.id)} onChange={(e) => toggleSelect(p.id, e)} style={{ accentColor: 'var(--red)' }} /></td>
                  <td><div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>{p.name}</div>{p.is_verified && <span style={{ fontSize: '0.68rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 2 }}><FiCheckCircle size={10} /> verified</span>}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.area || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.district || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.phone || '—'}</td>
                  <td><span className={`badge ${p.is_24h ? 'badge-cyan' : 'badge-gray'}`}>{p.is_24h ? '24h' : (isBn ? 'না' : 'No')}</span></td>
                  <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>{p.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}</span></td>
                  <td style={{ textAlign: 'right' }}><div style={{ display: 'inline-flex', gap: 5 }}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={12} /></button>
                    <button onClick={(e) => { deleteItem(p.id, p.name, e); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(230,57,70,0.2)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={12} /></button>
                  </div></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FiActivity size={18} /> {isBn ? 'কোনো ফার্মেসি নেই' : 'No pharmacies found'}</div></td></tr>}
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
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 520, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{editing ? (isBn ? 'সম্পাদনা' : 'Edit Pharmacy') : (isBn ? 'নতুন ফার্মেসি' : 'Add Pharmacy')}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={13} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
                <div className="form-group"><label className="form-label">{isBn ? 'নাম (ইংরেজি)' : 'Name (English)'} *</label><input value={form.name} onChange={e => F('name', e.target.value)} className="form-input" placeholder="Pharmacy name" required /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}</label><input value={form.name_bn || ''} onChange={e => F('name_bn', e.target.value)} className="form-input" placeholder="ফার্মেসির নাম" /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'এলাকা (ইংরেজি)' : 'Area (English)'}</label><input value={form.area} onChange={e => F('area', e.target.value)} className="form-input" placeholder="Mirpur" /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'এলাকা (বাংলা)' : 'Area (Bangla)'}</label><input value={form.area_bn || ''} onChange={e => F('area_bn', e.target.value)} className="form-input" placeholder="মিরপুর" /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'ফোন' : 'Phone'}</label><input value={form.phone} onChange={e => F('phone', e.target.value)} className="form-input" placeholder="017XXXXXXXX" /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'জেলা' : 'District'}</label><input value={form.district} onChange={e => F('district', e.target.value)} className="form-input" placeholder="Dhaka" /></div>
                <div className="form-group"><label className="form-label">{isBn ? 'বিভাগ' : 'Division'}</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">{isBn ? 'বেছে নিন' : 'Select'}</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{isBn ? 'ধরন' : 'Type'}</label>
                  <select value={form.type} onChange={e => F('type', e.target.value)} className="form-select">
                    {PHARMACY_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">{isBn ? 'সময়সূচি' : 'Opening Hours'}</label><input value={form.hours} onChange={e => F('hours', e.target.value)} className="form-input" placeholder="Sat–Thu 8am–10pm" /></div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[{ field: 'is_24h', label: isBn ? '২৪ ঘণ্টা খোলা' : 'Open 24h' }, { field: 'is_verified', label: isBn ? 'যাচাইকৃত' : 'Verified' }, { field: 'is_active', label: isBn ? 'সক্রিয়' : 'Active' }].map(({ field, label }) => (
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

      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}

      <BulkImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        table="pharmacies"
        onImportSuccess={() => { setPage(1); fetchData(); }}
      />
    </div>
  );
}
