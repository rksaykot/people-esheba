import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { FiPieChart, FiActivity, FiTerminal, FiServer, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const LOGS = [
  { id: 1, type: 'info', action: 'User Login', user: 'admin@esheba.com', time: '10 mins ago', desc: 'Successful login from IP 192.168.1.1' },
  { id: 2, type: 'warning', action: 'Failed Login', user: 'unknown', time: '1 hour ago', desc: '5 failed login attempts for user@test.com' },
  { id: 3, type: 'success', action: 'Data Export', user: 'admin@esheba.com', time: '2 hours ago', desc: 'Exported 150 user records to CSV' },
  { id: 4, type: 'error', action: 'API Error', user: 'system', time: '5 hours ago', desc: 'Failed to connect to SMS gateway provider' },
  { id: 5, type: 'info', action: 'Job Posted', user: 'hr@company.com', time: '1 day ago', desc: 'New job "Software Engineer" was created' },
];

export default function AdminLogs() {
  const { isBn } = useLang();
  const [filter, setFilter] = useState('all');

  const filteredLogs = filter === 'all' ? LOGS : LOGS.filter(l => l.type === filter);

  const getIcon = (type) => {
    switch(type) {
      case 'info': return <FiActivity style={{ color: 'var(--cyan)' }} />;
      case 'warning': return <FiAlertTriangle style={{ color: 'var(--amber)' }} />;
      case 'error': return <FiTerminal style={{ color: 'var(--red)' }} />;
      case 'success': return <FiCheckCircle style={{ color: 'var(--green)' }} />;
      default: return <FiServer style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.6rem', color:'var(--text-strong)', marginBottom: 4 }}>
            <FiPieChart style={{ color: 'var(--purple)' }} /> {isBn ? 'সিস্টেম লগ' : 'System Logs'}
          </h1>

        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          {['all', 'info', 'success', 'warning', 'error'].map(s => (
            <button key={s} onClick={() => setFilter(s)} 
              style={{ 
                padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                background: filter === s ? 'var(--primary)' : 'transparent',
                color: filter === s ? '#fff' : 'var(--text-muted)'
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Action</th>
                <th>Description</th>
                <th>User/System</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      {getIcon(log.type)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color:'var(--text-strong)', fontSize: '0.85rem' }}>{log.action}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 300 }}>{log.desc}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.user}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{log.time}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No logs found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
