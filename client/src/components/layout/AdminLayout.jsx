import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiGrid, FiUsers, FiHeart, FiBriefcase, FiDroplet, FiUsers as FiVol,
  FiAlertTriangle, FiFlag, FiBarChart2, FiBell, FiActivity,
  FiLogOut, FiMenu, FiX, FiExternalLink, FiBook, FiFileText, FiAward,
  FiMoon, FiSun, FiSettings, FiPlusCircle, FiPieChart, FiBox,
} from 'react-icons/fi';
import { MdOutlineLocalHospital, MdOutlineHealthAndSafety, MdOutlineMedicalServices, MdOutlineSchool, MdOutlineAgriculture, MdOutlineLocalPharmacy, MdOutlineMiscellaneousServices, MdAccountBalance } from 'react-icons/md';

const NAV_ITEMS = (t) => [
  { icon:<FiGrid/>,         label:t('admin.dashboard'),     to:'/admin',              group:'core' },
  { icon:<FiUsers/>,        label:t('admin.users'),         to:'/admin/users',        group:'core' },
  { icon:<FiHeart/>,        label:t('admin.donations'),     to:'/admin/donations',    group:'core' },
  { icon:<FiBriefcase/>,    label:t('admin.jobs'),          to:'/admin/jobs',         group:'core' },
  { icon:<FiDroplet/>,      label:t('admin.blood'),         to:'/admin/blood',        group:'core' },
  { icon:<FiVol/>,          label:t('admin.volunteers'),    to:'/admin/volunteers',   group:'core' },
  { icon:<FiAlertTriangle/>,label:t('admin.emergency'),     to:'/admin/emergency',    group:'core' },

  // Content management
  { icon:<MdOutlineLocalHospital/>, label: t('emergency.hospital') || 'Hospitals', to:'/admin/hospitals',   group:'content' },
  { icon:<MdOutlineMedicalServices/>, label: t('health.doctors') || 'Doctors',       to:'/admin/doctors',      group:'content' },
  { icon:<MdOutlineLocalPharmacy/>,   label: t('health.pharmacy') || 'Pharmacy',                           to:'/admin/pharmacy',     group:'content' },
  { icon:<MdOutlineMiscellaneousServices/>, label: t('nav.services') || 'Services',   to:'/admin/services',    group:'content' },
  { icon:<MdAccountBalance/>,          label: t('nav.government') || 'Government',   to:'/admin/government', group:'content' },
  { icon:<FiFileText/>,               label: t('nav.notices') || 'Notices',        to:'/admin/notices',      group:'content' },
  { icon:<MdOutlineSchool/>,          label: t('nav.education') || 'Education',    to:'/admin/education',    group:'content' },
  { icon:<FiAward/>,                  label: t('education.scholarships') || 'Scholarships',                        to:'/admin/scholarships', group:'content' },
  // System
  { icon:<FiFlag/>,         label:t('admin.reports'),       to:'/admin/reports',      group:'system' },
  { icon:<FiBarChart2/>,    label:t('admin.analytics'),     to:'/admin/analytics',    group:'system' },
  { icon:<FiPieChart/>,     label: t('admin.logs') || 'System Logs',            to:'/admin/logs',         group:'system' },
  { icon:<FiSettings/>,     label: t('admin.settings'),     to:'/admin/settings',     group:'system' },
  { icon:<FiBell/>,         label:t('admin.notifications'), to:'/admin/notifications', group:'system' },
];

export default function AdminLayout() {
  const { user, logout }   = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const navigate           = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Backdrop for mobile */}
      <div className={`admin-sidebar-backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`} style={{
        width: collapsed ? 64 : 240, flexShrink:0, background:'var(--surface)',
        borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh', zIndex:1000,
      }}>
        {/* Logo */}
        <div style={{ padding:collapsed?'1rem 0':'1.2rem 1.25rem', display:'flex', alignItems:'center', justifyContent: collapsed?'center':'space-between', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          {(!collapsed || mobileOpen) && (
            <Link to="/admin" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
              <img src={theme === 'dark' ? '/Logo.png' : '/logo-dark.png'} alt="People E-Sheba Admin" style={{ height: 32, width: 'auto' }} />
            </Link>
          )}
          <button className="desktop-collapse-btn" onClick={()=>setCollapsed(s=>!s)} style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {collapsed?<FiMenu size={14}/>:<FiX size={14}/>}
          </button>
          <button className="mobile-header-btn" onClick={()=>setMobileOpen(false)} style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <FiX size={14}/>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'0.75rem 0.5rem', overflowY:'auto' }}>
          {(() => {
            let lastGroup = null;
            const GROUP_LABELS = { core:'Core', content:'Content', system:'System' };
            return NAV_ITEMS(t).map((item) => {
              const showDivider = !collapsed && item.group && item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <div key={item.to}>
                  {showDivider && (
                    <div style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px 12px 4px', marginTop: lastGroup ? 4 : 0 }}>
                      {GROUP_LABELS[item.group]}
                    </div>
                  )}
                  <NavLink to={item.to} end={item.to==='/admin'} onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({
                      display:'flex', alignItems:'center', gap:10, padding:collapsed?'10px':'9px 12px',
                      borderRadius:9, textDecoration:'none', marginBottom:2, transition:'all 0.18s',
                      background: isActive?'rgba(230,57,70,0.12)':'transparent',
                      color: isActive?'var(--red)':'var(--text-muted)',
                      fontWeight: isActive?700:500, fontSize:'0.84rem',
                      justifyContent: collapsed?'center':'flex-start',
                      border: isActive?'1px solid rgba(230,57,70,0.2)':'1px solid transparent',
                    })}>
                    <span style={{ fontSize:'1rem', flexShrink:0 }}>{item.icon}</span>
                    {(!collapsed || mobileOpen) && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
                  </NavLink>
                </div>
              );
            });
          })()}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'0.75rem 0.5rem', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          {(!collapsed || mobileOpen) && (
            <div style={{ padding:'10px 12px', borderRadius:9, background:'var(--surface-2)', marginBottom:8, display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--grad-cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'var(--text-strong)', flexShrink:0 }}>
                {user?.name?.[0]?.toUpperCase()||'A'}
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontWeight:700, fontSize:'0.8rem', color:'var(--text-strong)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
                <span className="badge badge-red" style={{ fontSize:'0.6rem', padding:'1px 6px' }}>ADMIN</span>
              </div>
            </div>
          )}
          <Link to="/" onClick={() => setMobileOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'9px':'9px 12px', borderRadius:9, textDecoration:'none', color:'var(--text-muted)', fontSize:'0.83rem', fontWeight:500, marginBottom:4, transition:'all 0.18s', justifyContent:collapsed?'center':'flex-start' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)';}}>
            <FiExternalLink size={14} style={{ flexShrink:0 }}/>{(!collapsed || mobileOpen)&&t('admin.backToSite')}
          </Link>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'9px':'9px 12px', borderRadius:9, border:'none', background:'transparent', color:'var(--red)', fontSize:'0.83rem', fontWeight:600, cursor:'pointer', width:'100%', transition:'all 0.18s', justifyContent:collapsed?'center':'flex-start' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(230,57,70,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <FiLogOut size={14} style={{ flexShrink:0 }}/>{(!collapsed || mobileOpen)&&t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <header className="admin-topbar" style={{ height:60, background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 1.5rem', gap:'1rem', flexShrink:0, position:'sticky', top:0, zIndex:100 }}>
          <button className="mobile-header-btn" onClick={()=>setMobileOpen(true)} style={{ background:'transparent', border:'none', color:'var(--text-strong)', cursor:'pointer', alignItems:'center', justifyContent:'center', padding:0 }}>
            <FiMenu size={20} />
          </button>
          <div style={{ flex:1, fontSize:'0.9rem', color:'var(--text-muted)' }}>
            <span style={{ color:'var(--text-strong)', fontWeight:600 }}>Admin</span> Panel
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={toggleTheme} style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-2)', color:'var(--text)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              {theme === 'dark' ? <FiSun size={16}/> : <FiMoon size={16}/>}
            </button>
            <button onClick={toggleLang} style={{ height:36, padding:'0 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-2)', color:'var(--text-muted)', fontSize:'0.75rem', fontWeight:800, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              {lang==='en'?'বাং':'EN'}
            </button>
            <div className="system-status-btn" style={{ display:'flex', alignItems:'center', gap:8, padding:'0 14px', height:36, borderRadius:10, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 10px var(--green)', animation:'pulse-glow 2s infinite' }}/>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--green)', letterSpacing:'0.02em' }}>{t('admin.allSystems')}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-main-content" style={{ flex:1, padding:'1.75rem', overflowY:'auto' }}>
          <Outlet/>
        </main>
      </div>

      <style>{`
        .admin-sidebar {
          transition: all 0.3s ease;
        }
        .mobile-header-btn { display: none !important; }
        .admin-sidebar-backdrop { display: none; }
        
        @media(max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            left: -260px;
            width: 240px !important;
            z-index: 1000 !important;
          }
          .admin-sidebar.open {
            left: 0;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
          }
          .admin-sidebar-backdrop {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 999;
            backdrop-filter: blur(4px);
          }
          .admin-sidebar-backdrop.open {
            display: block;
            animation: fadeIn 0.3s;
          }
          .mobile-header-btn { display: flex !important; }
          .desktop-collapse-btn { display: none !important; }
          .admin-main-content { padding: 1rem !important; }
          .admin-topbar { padding: 0 1rem !important; gap: 0.5rem !important; }
          .system-status-btn span { display: none; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
