import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import api from '../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiUsers, FiBriefcase, FiHeart, FiUsers as FiVol, FiTrendingUp, FiEye, FiCheck, FiClock, FiDroplet, FiDollarSign, FiAlertTriangle, FiPlusCircle, FiActivity, FiPieChart, FiEdit3, FiUploadCloud, FiSettings } from 'react-icons/fi';
import { MdOutlineMedicalServices, MdOutlineLocalPharmacy, MdOutlineSchool, MdOutlineAgriculture } from 'react-icons/md';


const PIE_COLORS = ['#E63946','#06B6D4','#10B981','#F59E0B','#8B5CF6','#EC4899'];

function StatCard({ icon, label, value, sub, color, to }) {
  const inner = (
    <div style={{ 
      background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'1.5rem', 
      transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: to?'pointer':'default',
      position: 'relative', overflow: 'hidden'
    }}
      onMouseEnter={e=>{ if(to){ e.currentTarget.style.borderColor=color; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 10px 25px -5px ${color}20`; }}}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '4rem', opacity: 0.03, color }}>{icon}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem', position: 'relative' }}>
        <div style={{ 
          width:48, height:48, borderRadius:14, background:`${color}12`, border:`1px solid ${color}25`, 
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', color,
          boxShadow: `inset 0 0 10px ${color}10`
        }}>{icon}</div>
        {sub && <span style={{ fontSize:'0.72rem', color:'var(--green)', background:'rgba(16,185,129,0.1)', padding:'4px 10px', borderRadius:99, fontWeight:700, border: '1px solid rgba(16,185,129,0.2)' }}>{sub}</span>}
      </div>
      <div style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--text)', lineHeight:1, marginBottom:6, letterSpacing: '-0.02em' }}>{value ?? '—'}</div>
      <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:600, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration:'none' }}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { t, isBn } = useLang();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r=>setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner"/></div>;
  if (!data) return <div style={{ color:'var(--red)' }}>Failed to load dashboard</div>;

  const s = data.stats;
  const DON_STATUS = [
    { name:'Approved', value: s.active_donations },
    { name:'Pending',  value: s.pending_donations },
  ];

  return (
    <div>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontWeight:800, fontSize:'1.5rem', color:'var(--text-strong)', marginBottom:4 }}>{t('admin.dashboard')} {isBn?'সারসংক্ষেপ':'Overview'}</h1>

      </div>

      {/* Pending approvals banner */}
      {((s.pending_jobs||0) + (s.pending_donations||0) + (s.pending_blood||0) + (s.pending_volunteers||0)) > 0 && (
        <div style={{ marginBottom:'1.5rem', padding:'1rem 1.5rem', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:16, display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
          <span style={{ fontWeight:800, color:'#F59E0B', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:6 }}>
            <FiClock size={16}/> {isBn ? 'অনুমোদন প্রয়োজন:' : 'Needs Approval:'}
          </span>
          {s.pending_jobs>0 && <Link to="/admin/jobs" style={{ textDecoration:'none', background:'rgba(245,158,11,0.15)', color:'#F59E0B', borderRadius:10, padding:'4px 12px', fontSize:'0.8rem', fontWeight:700 }}>&#x1F4BC; {s.pending_jobs} {isBn?'চাকরি':'Jobs'}</Link>}
          {s.pending_donations>0 && <Link to="/admin/donations" style={{ textDecoration:'none', background:'rgba(230,57,70,0.15)', color:'#E63946', borderRadius:10, padding:'4px 12px', fontSize:'0.8rem', fontWeight:700 }}>&#x2764;&#xFE0F; {s.pending_donations} {isBn?'ডোনেশন':'Donations'}</Link>}
          {s.pending_blood>0 && <Link to="/admin/blood" style={{ textDecoration:'none', background:'rgba(239,68,68,0.15)', color:'#EF4444', borderRadius:10, padding:'4px 12px', fontSize:'0.8rem', fontWeight:700 }}>&#x1FA78; {s.pending_blood} {isBn?'রক্তদাতা':'Blood Donors'}</Link>}
          {s.pending_volunteers>0 && <Link to="/admin/volunteers" style={{ textDecoration:'none', background:'rgba(139,92,246,0.15)', color:'#8B5CF6', borderRadius:10, padding:'4px 12px', fontSize:'0.8rem', fontWeight:700 }}>&#x1F64B; {s.pending_volunteers} {isBn?'স্বেচ্ছাসেবক':'Volunteers'}</Link>}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard icon={<FiUsers/>} label={t('admin.totalUsers')}  value={s.total_users?.toLocaleString()}  color="#06B6D4"   to="/admin/users"     sub={`+${s.new_users_today} today`}/>
        <StatCard icon={<FiBriefcase/>} label={t('admin.totalJobs')} value={s.active_jobs?.toLocaleString()} color="#10B981"  to="/admin/jobs" sub={s.pending_jobs>0 ? `${s.pending_jobs} pending` : undefined}/>
        <StatCard icon={<FiHeart/>} label={t('admin.totalDonations')} value={s.pending_donations?.toLocaleString()} color="#E63946" to="/admin/donations" sub={s.pending_donations>0? (isBn ? 'রিভিউ প্রয়োজন' : 'Review needed') : undefined}/>
        <StatCard icon={<FiVol/>} label={t('admin.totalVolunteers')} value={s.active_volunteers?.toLocaleString()} color="#8B5CF6" to="/admin/volunteers" sub={s.pending_volunteers>0 ? `${s.pending_volunteers} pending` : undefined}/>
        <StatCard icon={<FiDroplet/>} label="Blood Donors" value={s.available_donors?.toLocaleString()} color="#E63946" to="/admin/blood" sub={s.pending_blood>0 ? `${s.pending_blood} pending` : undefined}/>
        <StatCard icon={<FiAlertTriangle/>} label="Emergency Services" value={s.emergency_services?.toLocaleString()} color="#E63946" to="/admin/emergency"/>
        <StatCard icon={<FiClock/>} label="Pending Reports" value={s.pending_reports?.toLocaleString()} color="#F59E0B" to="/admin/reports"/>
      </div>

      {/* CMS / Content Management Quick Access */}
      <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiEdit3 style={{ color: '#a78bfa' }} size={16} />
            <h3 style={{ fontWeight: 800, color: 'var(--text-strong)', fontSize: '0.95rem' }}>
              {isBn ? 'কন্টেন্ট ম্যানেজমেন্ট (CMS)' : 'Content Management (CMS)'}
            </h3>
          </div>
          <Link to="/admin/settings" style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiSettings size={12} /> {isBn ? 'সব সেটিংস' : 'All Settings'}
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: isBn ? 'হোমপেজ সম্পাদনা' : 'Edit Homepage', desc: isBn ? 'হিরো, ট্যাগলাইন, CTA' : 'Hero, tagline, CTA text', to: '/admin/settings', color: '#8B5CF6', icon: <FiEdit3 /> },
            { label: isBn ? 'ডাক্তার যোগ করুন' : 'Import Doctors', desc: isBn ? 'CSV/Excel আপলোড' : 'Upload CSV/Excel', to: '/admin/doctors', color: '#06B6D4', icon: <FiUploadCloud /> },
            { label: isBn ? 'নোটিশ যোগ করুন' : 'Add Notices', desc: isBn ? 'সরকারি নোটিশ' : 'Govt & edu notices', to: '/admin/notices', color: '#10B981', icon: <MdOutlineSchool /> },
            { label: isBn ? 'শিক্ষা প্রতিষ্ঠান' : 'Education Inst.', desc: isBn ? 'স্কুল, কলেজ, বিশ্ববিদ্যালয়' : 'Schools, colleges, universities', to: '/admin/education', color: '#F59E0B', icon: <MdOutlineSchool /> },
            { label: isBn ? 'ফার্মেসি' : 'Pharmacies', desc: isBn ? 'ঔষধের দোকান' : 'Manage pharmacies', to: '/admin/pharmacy', color: '#E63946', icon: <MdOutlineLocalPharmacy /> },
            { label: isBn ? 'বৃত্তি যোগ করুন' : 'Scholarships', desc: isBn ? 'স্কলারশিপ তথ্য' : 'Add scholarship data', to: '/admin/scholarships', color: '#EC4899', icon: <FiPlusCircle /> },
          ].map(item => (
            <Link key={item.to + item.label} to={item.to} style={{ textDecoration: 'none', padding: '0.75rem 1rem', background: 'var(--surface)', border: `1px solid ${item.color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}20`; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>


      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.25rem', marginBottom:'1.75rem' }}>
        {/* Line chart */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
          <h3 style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, color:'var(--text-strong)', marginBottom:'1.25rem', fontSize:'0.95rem' }}>
            <FiTrendingUp style={{ color:'var(--red)' }}/> {isBn?'নতুন ব্যবহারকারী (গত ৬ মাস)':'New Users (Last 6 Months)'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.monthly_users}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="month" tick={{ fill:'var(--text-dim)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'var(--text-dim)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--surface-3)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-strong)', fontSize:12 }}/>
              <Line type="monotone" dataKey="count" stroke="var(--red)" strokeWidth={2.5} dot={{ fill:'var(--red)', r:4 }} activeDot={{ r:6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
          <h3 style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, color:'var(--text-strong)', marginBottom:'1.25rem', fontSize:'0.95rem' }}>
            <FiPieChart style={{ color:'var(--cyan)' }}/> {isBn?'দান অবস্থা':'Donation Status'}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DON_STATUS} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {DON_STATUS.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:'var(--surface-3)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-strong)', fontSize:12 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Recent users */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, color:'var(--text-strong)', fontSize:'0.95rem' }}>
              <FiUsers style={{ color:'var(--cyan)' }}/> {isBn?'সাম্প্রতিক ব্যবহারকারী':'Recent Users'}
            </h3>
            <Link to="/admin/users" style={{ fontSize:'0.78rem', color:'var(--cyan)', fontWeight:600, textDecoration:'none' }}>{t('common.viewAll')}</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {data.recent_users?.slice(0,6).map(u => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--grad-cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'var(--text-strong)', flexShrink:0 }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, color:'var(--text-strong)', fontSize:'0.83rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role==='admin'?'badge-red':'badge-gray'}`} style={{ fontSize:'0.65rem' }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending donations */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, color:'var(--text-strong)', fontSize:'0.95rem' }}>
              <FiClock style={{ color:'var(--amber)' }}/> {isBn?'অনুমোদনের অপেক্ষায়':'Pending Approvals'}
            </h3>
            <Link to="/admin/donations" style={{ fontSize:'0.78rem', color:'var(--cyan)', fontWeight:600, textDecoration:'none' }}>{t('common.viewAll')}</Link>
          </div>
          {data.pending_donations?.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-dim)', fontSize:'0.85rem', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
              <FiCheck size={24} style={{ color:'var(--green)', opacity:0.5 }}/>
              {isBn?'সব পরিষ্কার':'All clear!'}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {data.pending_donations?.slice(0,5).map(d => (
                <div key={d.id} style={{ padding:'10px 12px', background:'var(--surface-2)', borderRadius:10, border:'1px solid var(--border)' }}>
                  <div style={{ fontWeight:600, color:'var(--text-strong)', fontSize:'0.83rem', marginBottom:2 }}>{d.title}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.73rem', color:'var(--text-dim)' }}>
                    <span>by {d.poster_name}</span>
                    <span>৳{Number(d.amount_needed).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
