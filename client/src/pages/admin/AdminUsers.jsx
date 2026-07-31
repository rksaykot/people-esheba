import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiTrash2, FiLock, FiUnlock, FiUser, FiUsers, FiMoreVertical, FiEdit2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

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
  const [roleF, setRoleF]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit, ...(search&&{search}), ...(roleF&&{role:roleF}), ...(statusF&&{status:statusF}) });
      const { data } = await api.get(`/admin/users?${q}`);
      setUsers(data.data.rows); setTotal(data.data.total); setPages(data.data.pages);
      setSelectedIds([]);
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, limit, roleF, statusF]); // eslint-disable-line

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
      await Promise.all(idsToDelete.map(id => api.delete(`/admin/users/${id}`)));
      toast.success(`${idsToDelete.length} users deleted successfully`);
      setUsers(u => u.filter(x => !idsToDelete.includes(x.id)));
      setTotal(t => t - idsToDelete.length);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Some users could not be deleted');
      fetchUsers();
    }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.6rem', color:'var(--text-strong)', marginBottom:4 }}>
            <FiUsers style={{ color:'var(--primary)' }}/> {t('admin.users')}
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>{total} {isBn?'মোট নিবন্ধিত ব্যবহারকারী':'total registered users'}</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:'1.5rem', flexWrap:'wrap', background:'var(--surface)', padding:'1rem', borderRadius:16, border:'1px solid var(--border)' }}>
        <form onSubmit={e=>{e.preventDefault();setPage(1);fetchUsers();}} style={{ display:'flex', gap:10, flex:1, minWidth:280 }}>
          <div style={{ flex:1, position:'relative' }}>
            <FiSearch style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none' }} size={16}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isBn?'নাম বা ইমেইল দিয়ে খুঁজুন...':'Search by name or email...'} className="form-input" style={{ paddingLeft:42, height:44, borderRadius:12 }}/>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height:44, padding:'0 20px' }}>{t('common.search')}</button>
        </form>
        <div style={{ display:'flex', gap:10 }}>
          <select value={roleF} onChange={e=>{setRoleF(e.target.value);setPage(1);}} className="form-select" style={{ width:'auto', minWidth:140, height:44, borderRadius:12 }}>
            <option value="">{isBn?'সব ভূমিকা':'All Roles'}</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} className="form-select" style={{ width:'auto', minWidth:140, height:44, borderRadius:12 }}>
            <option value="">{isBn?'সব স্ট্যাটাস':'All Status'}</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1);}} className="form-select" style={{ width:'auto', height:44, borderRadius:12, background:'var(--surface-2)' }}>
            <option value={20}>20 {isBn?'টি/পৃষ্ঠা':'/ page'}</option>
            <option value={50}>50 {isBn?'টি/পৃষ্ঠা':'/ page'}</option>
            <option value={100}>100 {isBn?'টি/পৃষ্ঠা':'/ page'}</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(239, 68, 68, 0.1)', border:'1px solid rgba(239, 68, 68, 0.3)', padding:'10px 16px', borderRadius:12, marginBottom:'1rem' }}>
          <span style={{ color:'var(--red)', fontWeight:600, fontSize:'0.9rem' }}>
            {selectedIds.length} {isBn ? 'টি নির্বাচিত' : 'selected'}
          </span>
          <button onClick={bulkDelete} className="btn btn-danger" style={{ height:36, padding:'0 16px', fontSize:'0.85rem' }}>
            <FiTrash2 /> {isBn ? 'নির্বাচিত মুছুন' : 'Delete Selected'}
          </button>
        </div>
      )}

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
