import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiTrash2, FiLock, FiUnlock, FiUser, FiUsers, FiMoreVertical, FiEdit2, FiCheckCircle, FiXCircle, FiUploadCloud, FiPlus } from 'react-icons/fi';
import { BD_DISTRICTS } from '../../utils/helpers';

export default function AdminUsers() {
  const { t, isBn } = useLang();
  const { user: me } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [limit, setLimit]   = useState(20);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [roleF, setRoleF]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit, ...(search&&{search}), ...(roleF&&{role:roleF}), ...(statusF&&{status:statusF}), ...(districtFilter && { district: districtFilter }) });
      const { data } = await api.get(`/admin/users?${q}`);
      setUsers(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
      setSelectedIds([]);
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, limit, roleF, statusF, districtFilter]); // eslint-disable-line

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      toast.success(data.message);
      setUsers(u => u.map(x => x.id===id ? {...x, is_active: data.data.is_active?1:0} : x));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success('Role updated');
      setUsers(u => u.map(x => x.id===id ? {...x, role} : x));
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(u => u.filter(x => x.id !== id));
      setTotal(t => t - 1);
      setSelectedIds(s => s.filter(sid => sid !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length && users.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;
    
    // Ensure we don't try to delete ourselves if somehow selected
    const idsToDelete = selectedIds.filter(id => id !== me?.id);
    if (idsToDelete.length === 0) {
      toast.error('Cannot delete yourself.');
      return;
    }

    try {
      setDeletingBulk(true);
      await Promise.all(idsToDelete.map(id => api.delete(`/admin/users/${id}`)));
      toast.success(`${idsToDelete.length} users deleted successfully`);
      setUsers(u => u.filter(x => !idsToDelete.includes(x.id)));
      setTotal(t => t - idsToDelete.length);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Some users could not be deleted');
      fetchUsers();
    } finally {
      setDeletingBulk(false);
    }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.6rem', color:'var(--text-strong)', marginBottom:4 }}>
            <FiUsers style={{ color:'var(--primary)' }}/> {t('admin.users')}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <form onSubmit={e => { e.preventDefault(); setPage(1); fetchUsers(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isBn?'খুঁজুন...':'Search name or email...'} className="form-input" style={{ paddingLeft: 36, height: 40, borderRadius: 10, fontSize: '0.85rem', width: 220 }}/>
            </div>
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 150 }}>
              <option value="">{isBn ? 'সব জেলা' : 'All Districts'}</option>
              {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={roleF} onChange={e=>{setRoleF(e.target.value);setPage(1);}} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 100 }}>
              <option value="">{isBn?'ভূমিকা':'Role'}</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} className="form-input" style={{ height: 40, borderRadius: 10, fontSize: '0.85rem', width: 100 }}>
              <option value="">{isBn?'স্ট্যাটাস':'Status'}</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 15px' }}>{t('common.search')}</button>
          </form>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {selectedIds.length > 0 && (
              <button onClick={bulkDelete} className="btn btn-outline" style={{ height: 40, borderRadius: 10, borderColor:'var(--red)', color:'var(--red)' }} disabled={deletingBulk}>
                {deletingBulk ? <div className="spinner spinner-sm" style={{ borderTopColor:'var(--red)' }}/> : <FiTrash2 size={13}/>} 
                {isBn ? `নির্বাচিত মুছুন (${selectedIds.length})` : `Delete (${selectedIds.length})`}
              </button>
            )}
            <button className="btn btn-ghost" style={{ height: 40, borderRadius: 10, border:'1px solid var(--border)' }}><FiUploadCloud size={13}/>{isBn ? 'ইমপোর্ট' : 'Import'}</button>
            <button className="btn btn-primary" style={{ height: 40, borderRadius: 10 }}><FiPlus size={13}/>{isBn?'যোগ করুন':'Add User'}</button>
          </div>
        </div>
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner"/></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={users.length > 0 && selectedIds.length === users.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>{isBn?'ব্যবহারকারী':'User'}</th>
                  <th>{isBn?'যোগাযোগ':'Contact'}</th>
                  <th>{isBn?'এলাকা':'Location'}</th>
                  <th>{isBn?'ভূমিকা':'Role'}</th>
                  <th>{isBn?'স্ট্যাটাস':'Status'}</th>
                  <th>{isBn?'যোগদান':'Joined'}</th>
                  <th>{isBn?'কার্যক্রম':'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ background: selectedIds.includes(u.id) ? 'var(--surface-2)' : 'transparent' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--grad-cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:800, color:'var(--text-strong)', flexShrink:0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--text-strong)', fontSize:'0.85rem' }}>{u.name}</div>
                          {u.is_verified && <span style={{ fontSize:'0.68rem', color:'var(--cyan)', display:'flex', alignItems:'center', gap:2 }}><FiCheckCircle size={10}/> verified</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      <div>{u.email}</div>
                      {u.phone && <div style={{ color:'var(--text-dim)' }}>{u.phone}</div>}
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{u.district||'—'}{u.division&&`, ${u.division}`}</td>
                    <td>
                      <select value={u.role} onChange={e=>changeRole(u.id, e.target.value)} disabled={u.id===me?.id}
                        style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:7, color: u.role==='admin'?'var(--red)':'var(--text-muted)', fontSize:'0.78rem', padding:'4px 8px', cursor:'pointer' }}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>{u.is_active?t('common.active'):t('common.inactive')}</span>
                    </td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {u.id !== me?.id && (
                          <>
                            <button onClick={()=>toggleUser(u.id)} title={u.is_active?'Block User':'Unblock User'} 
                              style={{ 
                                width:34, height:34, borderRadius:10, border:'1px solid var(--border)', 
                                background:'var(--surface-2)', color:u.is_active?'#F59E0B':'#10B981', 
                                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.2s'
                              }}
                              onMouseEnter={e=>e.currentTarget.style.borderColor=u.is_active?'#F59E0B':'#10B981'}
                              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                              {u.is_active ? <FiLock size={15}/> : <FiUnlock size={15}/>}
                            </button>
                            <button onClick={()=>deleteUser(u.id, u.name)} title="Delete User" 
                              style={{ 
                                width:34, height:34, borderRadius:10, border:'1px solid var(--border)', 
                                background:'var(--surface-2)', color:'#EF4444', 
                                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.2s'
                              }}
                              onMouseEnter={e=>e.currentTarget.style.borderColor='#EF4444'}
                              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                              <FiTrash2 size={15}/>
                            </button>
                          </>
                        )}
                        {u.id === me?.id && (
                          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:8, background:'rgba(6,182,212,0.1)', color:'var(--cyan)', fontSize:'0.75rem', fontWeight:700 }}>
                            <FiUser size={12}/> {isBn ? 'আপনি' : 'You'}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'2.5rem', color:'var(--text-dim)' }}>{t('common.noResults')}</td></tr>
                )}
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
    </div>
  );
}
