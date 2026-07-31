import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiShield, FiCheckCircle, FiCheck, FiX, FiClock, FiUsers, FiUploadCloud, FiSearch } from 'react-icons/fi';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { BD_DISTRICTS } from '../../utils/helpers';

const STATUS_TABS = [
  { key: '', label: 'All', labelBn: 'সব' },
  { key: 'pending', label: 'Pending', labelBn: 'অপেক্ষমান' },
  { key: 'active', label: 'Active', labelBn: 'সক্রিয়' },
];

export default function AdminVolunteers() {
  const { t, isBn } = useLang();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }), ...(search && { search }), ...(districtFilter && { district: districtFilter }) });
      const r = await api.get(`/admin/volunteers?${q}`);
      setItems(r.data.data.rows); setTotal(r.data.data.total); setPages(r.data.data.pages);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const fetchPendingCount = async () => {
    try {
      const r = await api.get('/admin/volunteers?status=pending&limit=1');
      setPendingCount(r.data.data.total || 0);
    } catch {}
  };

  useEffect(() => { fetchVolunteers(); }, [page, statusFilter, districtFilter]); // eslint-disable-line
  useEffect(() => { fetchPendingCount(); }, []); // eslint-disable-line

  const approveVolunteer = async (id, status, name) => {
    try {
      await api.put(`/admin/volunteers/${id}/status`, { status });
      toast.success(isBn
        ? `${name} ${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে`
        : `${name} ${status}`);
      setItems(i => i.map(x => x.id === id ? { ...x, is_active: status === 'approved' ? 1 : 0 } : x));
      if (statusFilter === 'pending') setItems(i => i.filter(x => x.id !== id));
      fetchPendingCount();
    } catch { toast.error('Failed'); }
  };

  const verifyVol = async (id, name) => {
    try {
      await api.put(`/admin/volunteers/${id}/verify`);
      toast.success(`${name} verified`);
      setItems(i => i.map(x => x.id === id ? { ...x, is_verified: 1 } : x));
    } catch { toast.error('Failed'); }
  };

  const deleteItem = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Remove ${name} as volunteer?`)) return;
    try {
      await api.delete(`/admin/volunteers/${id}`);
      toast.success('Removed');
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
    if (!window.confirm(`Delete ${selectedIds.size} volunteers?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/volunteers/${id}`)));
      toast.success(`Deleted ${selectedIds.size} volunteers`);
      setSelectedIds(new Set());
      fetchVolunteers();
    } catch { toast.error('Failed to delete some volunteers'); fetchVolunteers(); }
    finally { setDeletingBulk(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-strong)', marginBottom: 3 }}>
            <FiUsers style={{ color: 'var(--cyan)' }} /> {t('admin.volunteers')}
            {pendingCount > 0 && (
              <span style={{ background: '#F59E0B', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                {pendingCount} {isBn ? 'অপেক্ষমান' : 'pending'}
              </span>
            )}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchVolunteers(); }} style={{ display: 'flex', gap: 5 }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn?'খুঁজুন...':'Search name...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }}/>
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
            <button onClick={() => setShowImport(true)} className="btn btn-ghost" style={{ height: 40, borderRadius: 10, border: '1px solid var(--border)' }}>
              <FiUploadCloud size={14} /> {isBn ? 'ডেটা আমদানি' : 'Import'}
            </button>
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
              {tab.key === 'pending' && pendingCount > 0 && (
                <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem' }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor:'var(--red)' }} /></th>
                <th>{isBn ? 'স্বেচ্ছাসেবক' : 'Volunteer'}</th>
                <th>{isBn ? 'বিভাগ' : 'Category'}</th>
                <th>{isBn ? 'দক্ষতা' : 'Skills'}</th>
                <th>{isBn ? 'এলাকা' : 'Location'}</th>
                <th>{isBn ? 'উপলব্ধতা' : 'Availability'}</th>
                <th>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th>{isBn ? 'কার্যক্রম' : 'Actions'}</th>
              </tr></thead>
              <tbody>
                {items.map(v => {
                  const isPending = !v.is_active;
                  return (
                    <tr key={v.id} style={{ background: isPending ? 'rgba(245,158,11,0.04)' : 'transparent', cursor: 'pointer' }}>
                      <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(v.id)} onChange={(e) => toggleSelect(v.id, e)} style={{ accentColor:'var(--red)' }} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                            {v.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>{v.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{v.email}</div>
                            {v.is_verified ? <span style={{ fontSize: '0.65rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 2 }}><FiCheckCircle size={10} /> verified</span> : null}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-green">{v.category}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.skills || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.district || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.availability || '—'}</td>
                      <td>
                        {isPending
                          ? <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={10} /> {isBn ? 'অপেক্ষমান' : 'Pending'}</span>
                          : <span className="badge badge-green">{t('common.active')}</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {/* Approve / Reject for pending */}
                          {isPending && (<>
                            <button onClick={() => approveVolunteer(v.id, 'approved', v.name)} title={isBn ? 'অনুমোদন করুন' : 'Approve'}
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiCheck size={13} />
                            </button>
                            <button onClick={() => approveVolunteer(v.id, 'rejected', v.name)} title={isBn ? 'বাতিল করুন' : 'Reject'}
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiX size={13} />
                            </button>
                          </>)}
                          {!v.is_verified && v.is_active ? (
                            <button onClick={() => verifyVol(v.id, v.name)} title="Verify"
                              style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiShield size={12} />
                            </button>
                          ) : null}
                          <button onClick={(e) => deleteItem(v.id, v.name, e)} title="Remove"
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(230,57,70,0.2)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>{t('common.noResults')}</td></tr>}
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
      <BulkImportModal isOpen={showImport} onClose={() => setShowImport(false)} table="volunteers" onImportSuccess={() => { setPage(1); fetchVolunteers(); }} />
    </div>
  );
}
