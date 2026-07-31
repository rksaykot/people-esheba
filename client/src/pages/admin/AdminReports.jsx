import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiFlag, FiSearch, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function AdminReports() {
  const { t, isBn } = useLang();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then(r=>setItems(r.data.data)).catch(()=>[]).finally(()=>setLoading(false));
  }, []);

  const resolve = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      toast.success('Resolved');
      setItems(i => i.map(x => x.id===id ? {...x, status:'resolved'} : x));
    } catch { toast.error('Failed'); }
  };

  const S_COLOR = { pending:'badge-amber', reviewed:'badge-cyan', resolved:'badge-green' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.6rem', color:'var(--text-strong)', marginBottom:4 }}>
            <FiFlag style={{ color:'var(--amber)' }}/> {t('admin.reports')}
          </h1>

        </div>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>{isBn?'রিপোর্টকারী':'Reporter'}</th>
                <th>{isBn?'বিষয়':'Entity'}</th>
                <th>{isBn?'কারণ':'Reason'}</th>
                <th>{isBn?'স্ট্যাটাস':'Status'}</th>
                <th>{isBn?'তারিখ':'Date'}</th>
                <th>{isBn?'কার্যক্রম':'Actions'}</th>
              </tr></thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight:600, color:'var(--text-strong)', fontSize:'0.85rem' }}>{r.reporter_name}</td>
                    <td><span className="badge badge-gray">{r.entity_type} #{r.entity_id}</span></td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-muted)', maxWidth:220 }}>{r.reason}</td>
                    <td><span className={`badge ${S_COLOR[r.status]||'badge-gray'}`}>{r.status}</span></td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'pending' && (
                        <button onClick={()=>resolve(r.id)} className="btn btn-sm btn-ghost" style={{ color:'var(--green)', borderColor:'rgba(16,185,129,0.3)' }}>
                          <FiCheck size={13}/>{isBn?'সমাধান':'Resolve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                 {items.length===0 && (
                   <tr>
                     <td colSpan={6} style={{ textAlign:'center', padding:'3rem', color:'var(--text-dim)' }}>
                       <FiCheck size={32} style={{ color:'var(--green)', opacity:0.3, marginBottom:10 }}/>
                       <div>{isBn?'কোনো নতুন রিপোর্ট নেই':'No reports to review'}</div>
                     </td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
