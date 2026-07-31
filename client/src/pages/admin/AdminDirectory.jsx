import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiTrash2, FiEdit2, FiX, FiSearch, FiStar, FiUploadCloud, FiSave
} from 'react-icons/fi';
import { MdLocalHospital, MdMiscellaneousServices, MdAccountBalance } from 'react-icons/md';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

/* Every public "static" page that used to hardcode sample data now
 * reads from directory_listings via /directory?category=X. This one
 * admin screen manages all four categories with a tab switcher,
 * instead of four near-identical admin pages. */
const CATEGORIES = [
  { key: 'hospital',   label: 'Hospitals',  icon: <MdLocalHospital/>,           subtypes: ['govt-hospital', 'private-hospital'] },
  { key: 'service',    label: 'Services',   icon: <MdMiscellaneousServices/>,   subtypes: ['home', 'transport', 'repairs', 'telemedicine', 'tutor', 'utility'] },
  { key: 'government', label: 'Government', icon: <MdAccountBalance/>,          subtypes: ['nid', 'schemes', 'passport', 'land', 'utility'] },
];

const DIVS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const BLANK = (category, subtype) => ({
  category, subtype, name: '', name_bn: '', description: '', description_bn: '', area: '', area_bn: '', district: '', division: '',
  address: '', address_bn: '', phone: '', website: '', rating: 0, badge_key: '', price_info: '', features: '', is_verified: false,
});

export default function AdminDirectory({ fixedCategory }) {
  const { isBn, t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  // When fixedCategory is provided (dedicated page), lock to it and hide the tab switcher.
  const activeCat = fixedCategory
    ? (CATEGORIES.find(c => c.key === fixedCategory) || CATEGORIES[0])
    : (CATEGORIES.find(c => c.key === searchParams.get('cat')) || CATEGORIES[0]);

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch]   = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm]         = useState(BLANK(activeCat.key, activeCat.subtypes[0]));
  const [saving, setSaving]     = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 40, category: fixedCategory || activeCat.key });
      if (search) q.append('search', search);
      if (districtFilter) q.append('district', districtFilter);
      const res = await api.get(`/admin/directory?${q}`);
      setItems(res.data.data.rows || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeCat.key, page, districtFilter]);

  const switchCat = (key) => {
    const p = new URLSearchParams(searchParams);
    p.set('cat', key);
    setSearchParams(p);
  };

  const openAdd  = () => { setForm(BLANK(activeCat.key, activeCat.subtypes[0])); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, is_verified: !!item.is_verified }); setEditing(item.id); setShowForm(true); };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/directory/${editing}`, form);
        toast.success('Updated');
        setItems(list => list.map(x => x.id === editing ? { ...x, ...form } : x));
      } else {
        const { data } = await api.post('/admin/directory', form);
        toast.success('Created');
        setItems(list => [data.data, ...list]);
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const remove = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/directory/${id}`);
      toast.success('Deleted');
      setItems(list => list.filter(x => x.id !== id));
      setSelectedIds(s => { const next = new Set(s); next.delete(id); return next; });
    } catch { toast.error('Delete failed'); }
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
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/directory/${id}`)));
      toast.success(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      load();
    } catch { toast.error('Failed to delete some items'); load(); }
    finally { setDeletingBulk(false); }
  };

  const submitSearch = (e) => { e.preventDefault(); load(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: 3, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'var(--primary)' }}>{activeCat.icon}</span>
            {fixedCategory
              ? `${activeCat.label} ${isBn ? 'ব্যবস্থাপনা' : 'Manager'}`
              : (isBn ? 'ডিরেক্টরি ব্যবস্থাপনা' : 'Directory Manager')}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {!fixedCategory && (
            <div style={{ display: 'flex', gap: 5 }}>
              {CATEGORIES.filter(c => c.key !== 'hospital').map(c => (
                <button
                  key={c.key}
                  onClick={() => switchCat(c.key)}
                  className={`btn btn-sm ${activeCat.key === c.key ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <span style={{display:'flex',alignItems:'center',gap:4}}>{c.icon} {c.label}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name..." className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }}/>
            </div>
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 150 }}>
              <option value="">{isBn ? 'সব জেলা' : 'All Districts'}</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>{t('common.search')}</button>
          </form>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="btn btn-outline" style={{ height:40, borderRadius:10, borderColor:'var(--red)', color:'var(--red)' }} disabled={deletingBulk}>
                {deletingBulk ? <div className="spinner spinner-sm" style={{ borderTopColor:'var(--red)' }}/> : <FiTrash2 size={13}/>} 
                {isBn ? `নির্বাচিত মুছুন (${selectedIds.size})` : `Delete (${selectedIds.size})`}
              </button>
            )}
            <button onClick={() => setShowImport(true)} className="btn btn-ghost" style={{ height: 40, borderRadius: 10, border:'1px solid var(--border)' }}>
              <FiUploadCloud size={13} /> {isBn ? 'ইমপোর্ট' : 'Import'}
            </button>
            <button onClick={openAdd} className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}>
              <FiPlus size={13}/> {isBn ? 'নতুন যোগ করুন' : 'Add Listing'}
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor:'var(--red)' }} /></th>
              <th>Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Status</th>
              <th style={{ textAlign:'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  {activeCat.icon}
                  <div>No {activeCat.label.toLowerCase()} listed yet. Click "Add Listing" to create the first one.</div>
                </div>
              </td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => setViewItem(item)} style={{ cursor:'pointer' }}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => toggleSelect(item.id, e)} style={{ accentColor:'var(--red)' }} /></td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{item.name}</div>
                  {item.rating > 0 && <div style={{ fontSize: '0.78rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}><FiStar size={11}/>{item.rating}/5</div>}
                </td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--text-muted)' }}>
                    <span className="badge" style={{ fontSize:'0.65rem' }}>{item.subtype}</span>
                  </div>
                </td>
                <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{item.area || item.district || '—'}</td>
                <td style={{ fontSize:'0.85rem', color:'var(--text)' }}>{item.phone || '—'}</td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    {item.is_verified && <span className="badge badge-green" style={{ fontSize:'0.6rem' }}>✓ Verified</span>}
                  </div>
                </td>
                <td style={{ textAlign:'right' }}>
                  <div style={{ display:'inline-flex', gap:6 }}>
                    <button onClick={(e)=>{ e.stopPropagation(); openEdit(item); }} className="btn btn-ghost btn-sm" style={{ padding:'0.3rem 0.6rem' }}><FiEdit2 size={13}/></button>
                    <button onClick={(e)=>{ remove(item.id, item.name, e); }} className="btn btn-outline btn-sm" style={{ padding:'0.3rem 0.6rem' }}><FiTrash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}/>
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 560, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-strong)' }}>{editing ? 'Edit Listing' : `Add ${activeCat.label} Listing`}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX size={13}/></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Name (English) *</label>
                  <input value={form.name} onChange={e => F('name', e.target.value)} className="form-input" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Name (Bangla)</label>
                  <input value={form.name_bn || ''} onChange={e => F('name_bn', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => F('category', e.target.value)} className="form-select">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subtype</label>
                  <select value={form.subtype} onChange={e => F('subtype', e.target.value)} className="form-select">
                    {(CATEGORIES.find(c => c.key === form.category)?.subtypes || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input value={form.phone} onChange={e => F('phone', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input value={form.website} onChange={e => F('website', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Division</label>
                  <select value={form.division} onChange={e => F('division', e.target.value)} className="form-select">
                    <option value="">Select</option>
                    {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input value={form.district} onChange={e => F('district', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Area (English)</label>
                  <input value={form.area} onChange={e => F('area', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Area (Bangla)</label>
                  <input value={form.area_bn || ''} onChange={e => F('area_bn', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => F('rating', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Price info (optional)</label>
                  <input value={form.price_info} onChange={e => F('price_info', e.target.value)} className="form-input" placeholder="e.g. Starts 300 BDT"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Address (English)</label>
                  <input value={form.address} onChange={e => F('address', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Address (Bangla)</label>
                  <input value={form.address_bn || ''} onChange={e => F('address_bn', e.target.value)} className="form-input"/>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Features (comma-separated, optional)</label>
                  <input value={form.features} onChange={e => F('features', e.target.value)} className="form-input" placeholder="Verified Pros, 24/7 Support"/>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description (English)</label>
                  <textarea value={form.description} onChange={e => F('description', e.target.value)} className="form-input" rows={2}/>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description (Bangla)</label>
                  <textarea value={form.description_bn || ''} onChange={e => F('description_bn', e.target.value)} className="form-input" rows={2}/>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={!!form.is_verified} onChange={e => F('is_verified', e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--green)' }}/>
                Verified
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? <div className="spinner spinner-sm"/> : <><FiSave size={13}/>Save</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BulkImportModal isOpen={showImport} onClose={() => setShowImport(false)} table="directory_listings" onImportSuccess={() => { load(); }} />
      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
