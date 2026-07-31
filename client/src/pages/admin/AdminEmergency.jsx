import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiPhone, FiAlertTriangle, FiSearch, FiActivity, FiUploadCloud } from 'react-icons/fi';
import { MdOutlineLocalHospital, MdOutlineLocalPolice, MdOutlineFireTruck, MdOutlineMedicalServices } from 'react-icons/md';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

const TYPES = ['police', 'fire', 'ambulance', 'mental', 'other'];
const ICONS = {
  police: <MdOutlineLocalPolice />,
  fire: <MdOutlineFireTruck />,
  ambulance: <MdOutlineMedicalServices />,
  mental: <FiActivity />,
  other: <FiPhone />
};
const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const BLANK = { name: '', type: 'police', address: '', division: '', district: '', phone: '', latitude: '', longitude: '', is_24h: false };

export default function AdminEmergency() {
  const { t, isBn } = useLang();
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

  const fetch = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, ...(search && { search }), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/emergency?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, districtFilter]); // eslint-disable-line

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, is_24h: !!item.is_24h }); setEditing(item.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type) return toast.error('Name and type required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/emergency/${editing}`, form);
        toast.success('Updated');
        setItems(i => i.map(x => x.id === editing ? { ...x, ...form } : x));
      } else {
        const { data } = await api.post('/admin/emergency', form);
        toast.success('Created');
        setItems(i => [data.data, ...i]);
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/emergency/${id}`);
      toast.success('Deleted');
      setItems(i => i.filter(x => x.id !== id));
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
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/emergency/${id}`)));
      toast.success(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      fetch();
    } catch { toast.error('Failed to delete some items'); fetch(); }
    finally { setDeletingBulk(false); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-strong)', marginBottom: 4 }}>
            <FiAlertTriangle style={{ color: '#EF4444' }} /> {t('admin.emergency')}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetch(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--red)' }} /></th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{t('common.noResults')}</td></tr>
                ) : items.map(item => (
                  <tr key={item.id} onClick={() => setViewItem(item)} style={{ cursor: 'pointer' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => toggleSelect(item.id, e)} style={{ accentColor: 'var(--red)' }} /></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{item.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        <span style={{ color: 'var(--cyan)' }}>{ICONS[item.type] || <FiPhone />}</span> {item.type}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.district || item.division || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{item.phone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {item.is_verified && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✓ Verified</span>}
                        {item.is_24h && <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>24h</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem 0.6rem' }}><FiEdit2 size={13} /></button>
                        <button onClick={(e) => { deleteItem(item.id, item.name, e); }} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && <div className="pagination" style={{ marginTop: '1.5rem' }}>
        <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= pages).map(p => (
          <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
      </div>}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 540, padding: '2rem', animation: 'fadeUp 0.25s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{editing ? t('common.edit') : isBn ? 'নতুন সেবা যোগ করুন' : 'Add Emergency Service'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={13} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4.75rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">{isBn ? 'নাম' : 'Name'} *</label>
                  <input value={form.name} onChange={e => F('name', e.target.value)} className="form-input" placeholder="Dhaka Medical College Hospital" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'ধরন' : 'Type'} *</label>
                  <select value={form.type} onChange={e => F('type', e.target.value)} className="form-select" required>
                    {TYPES.map(tp => <option key={tp} value={tp}>{ICONS[tp]} {tp}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'ফোন' : 'Phone'}</label>
                  <input value={form.phone} onChange={e => F('phone', e.target.value)} className="form-input" placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'বিভাগ (এলাকা)' : 'Division'}</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">{isBn ? 'বেছে নিন' : 'Select'}</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{isBn ? 'জেলা' : 'District'}</label>
                  <input value={form.district} onChange={e => F('district', e.target.value)} className="form-input" placeholder="Dhaka" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">{isBn ? 'ঠিকানা' : 'Address'}</label>
                  <input value={form.address} onChange={e => F('address', e.target.value)} className="form-input" placeholder="Full address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => F('latitude', e.target.value)} className="form-input" placeholder="23.8103" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => F('longitude', e.target.value)} className="form-input" placeholder="90.4125" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { field: 'is_24h', label: isBn ? '২৪ ঘণ্টা খোলা' : 'Open 24 Hours' },
                  { field: 'is_verified', label: isBn ? 'যাচাইকৃত' : 'Verified' },
                ].map(({ field, label }) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={!!form[field]} onChange={e => F(field, e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--green)' }} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? <div className="spinner spinner-sm" /> : <><FiSave size={13} />{t('common.save')}</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BulkImportModal isOpen={showImport} onClose={() => setShowImport(false)} table="emergency_services" onImportSuccess={() => { fetch(); }} />
      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
