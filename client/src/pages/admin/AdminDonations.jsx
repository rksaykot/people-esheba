import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrash2, FiEye, FiFilter, FiTrendingUp, FiHeart, FiClock, FiSearch, FiZap } from 'react-icons/fi';
import { MdOutlineMedicalServices, MdOutlineSchool, MdOutlineAgriculture } from 'react-icons/md';
import { BD_DISTRICTS } from '../../utils/helpers';
import DetailsModal from '../../components/ui/DetailsModal';

export default function AdminDonations() {
  const { t, isBn } = useLang();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [statusF, setStatusF] = useState('pending');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit:15, ...(statusF&&statusF!=='all'&&{status:statusF}), ...(search && { search }), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/donations?${q}`);
      setItems(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, statusF, districtFilter]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/donations/${id}`, { status });
      toast.success(`Donation ${status}`);
      setItems(i => i.map(x => x.id===id ? {...x, status} : x));
    } catch { toast.error('Failed'); }
  };

  const deleteItem = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this donation request?')) return;
    try {
      await api.delete(`/admin/donations/${id}`);
      toast.success('Deleted');
      setItems(i => i.filter(x => x.id!==id));
      setTotal(t => t-1);
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
    if (!window.confirm(`Delete ${selectedIds.size} donations?`)) return;
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/donations/${id}`)));
      toast.success(`Deleted ${selectedIds.size} donations`);
      setSelectedIds(new Set());
      fetch();
    } catch { toast.error('Failed to delete some donations'); fetch(); }
    finally { setDeletingBulk(false); }
  };

  const S_COLOR = { pending:'badge-amber', approved:'badge-green', rejected:'badge-red', completed:'badge-cyan' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.6rem', color:'var(--text-strong)', marginBottom:4 }}>
            <FiHeart style={{ color:'#EF4444' }}/> {t('admin.donations')}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetch(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn?'খুঁজুন...':'Search...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }}/>
            </div>
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 150 }}>
              <option value="">{isBn ? 'সব জেলা' : 'All Districts'}</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>{t('common.search')}</button>
          </form>
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className="btn btn-outline" style={{ height: 40, borderRadius: 10, borderColor:'var(--red)', color:'var(--red)' }} disabled={deletingBulk}>
              {deletingBulk ? <div className="spinner spinner-sm" style={{ borderTopColor:'var(--red)' }}/> : <FiTrash2 size={13}/>} 
              {isBn ? `নির্বাচিত মুছুন (${selectedIds.size})` : `Delete (${selectedIds.size})`}
            </button>
          )}
        </div>
        <div style={{ display:'flex', gap:6, background:'var(--surface)', padding:4, borderRadius:12, border:'1px solid var(--border)' }}>
          {['all','pending','approved','rejected','completed'].map(s => (
            <button key={s} onClick={()=>{setStatusF(s);setPage(1);}} 
              style={{ 
                padding:'6px 12px', borderRadius:8, border:'none', fontSize:'0.75rem', fontWeight:700,
                cursor:'pointer', transition:'all 0.2s',
                background: statusF===s ? 'var(--primary)' : 'transparent',
                color: statusF===s ? '#fff' : 'var(--text-muted)'
              }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner"/></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} style={{ accentColor:'var(--red)' }} /></th>
                <th>{isBn?'শিরোনাম':'Title'}</th>
                <th>{isBn?'পোস্টকারী':'Posted By'}</th>
                <th>{isBn?'বিভাগ':'Category'}</th>
                <th>{isBn?'লক্ষ্য':'Target'}</th>
                <th>{isBn?'সংগ্রহ':'Raised'}</th>
                <th>{isBn?'স্ট্যাটাস':'Status'}</th>
                <th>{isBn?'তারিখ':'Date'}</th>
                <th>{isBn?'কার্যক্রম':'Actions'}</th>
              </tr></thead>
              <tbody>
                {items.map(d => (
                  <tr key={d.id} onClick={() => setViewItem(d)} style={{ cursor: 'pointer' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(d.id)} onChange={(e) => toggleSelect(d.id, e)} style={{ accentColor:'var(--red)' }} /></td>
                    <td style={{ maxWidth:180 }}>
                      <div style={{ fontWeight:600, color:'var(--text-strong)', fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.title}</div>
                      {d.is_urgent && <span className="badge badge-red" style={{ fontSize:'0.65rem', marginTop:3, display:'flex', alignItems:'center', gap:3 }}><FiZap size={10} fill="currentColor" /> URGENT</span>}
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      <div>{d.poster_name}</div>
                      <div style={{ color:'var(--text-dim)', fontSize:'0.72rem' }}>{d.poster_email}</div>
                    </td>
                    <td><span className="badge badge-gray">{d.category}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.83rem' }}>৳{Number(d.amount_needed).toLocaleString()}</td>
                    <td style={{ color:'var(--green)', fontWeight:600, fontSize:'0.83rem' }}>৳{Number(d.amount_raised).toLocaleString()}</td>
                    <td><span className={`badge ${S_COLOR[d.status]||'badge-gray'}`}>{d.status}</span></td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {d.status === 'pending' && <>
                          <button onClick={()=>updateStatus(d.id,'approved')} title="Approve Request" 
                            style={{ 
                              width:34, height:34, borderRadius:10, border:'1px solid var(--border)', 
                              background:'var(--surface-2)', color:'#10B981', 
                              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                              transition:'all 0.2s'
                            }}
                            onMouseEnter={e=>e.currentTarget.style.borderColor='#10B981'}
                            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                            <FiCheck size={15}/>
                          </button>
                          <button onClick={()=>updateStatus(d.id,'rejected')} title="Reject Request" 
                            style={{ 
                              width:34, height:34, borderRadius:10, border:'1px solid var(--border)', 
                              background:'var(--surface-2)', color:'#EF4444', 
                              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                              transition:'all 0.2s'
                            }}
                            onMouseEnter={e=>e.currentTarget.style.borderColor='#EF4444'}
                            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                            <FiX size={15}/>
                          </button>
                        </>}
                        {d.status === 'approved' && (
                          <button onClick={()=>updateStatus(d.id,'completed')} title="Mark as Completed" 
                            style={{ 
                              padding:'0 12px', height:34, borderRadius:10, border:'1px solid var(--border)', 
                              background:'var(--surface-2)', color:'var(--cyan)', 
                              cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                              fontSize:'0.72rem', fontWeight:800, transition:'all 0.2s'
                            }}
                            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--cyan)'}
                            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                            <FiCheck size={14}/> DONE
                          </button>
                        )}
                        <button onClick={(e)=>deleteItem(d.id, e)} title="Delete Permanently" 
                          style={{ 
                            width:34, height:34, borderRadius:10, border:'1px solid var(--border)', 
                            background:'var(--surface-2)', color:'var(--text-dim)', 
                            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all 0.2s'
                          }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='#EF4444'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                          <FiTrash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length===0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:'2.5rem', color:'var(--text-dim)' }}>{t('common.noResults')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>‹</button>
          {Array.from({length:Math.min(5,pages)},(_,i)=>i+Math.max(1,page-2)).filter(p=>p<=pages).map(p=>(
            <button key={p} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page===pages}>›</button>
        </div>
      )}
      {viewItem && <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
