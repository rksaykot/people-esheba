// ── Date formatting ───────────────────────────────────────────
export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtRelative = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return fmtDate(d);
};

// ── Money formatting ──────────────────────────────────────────
export const fmtMoney = (n, currency = 'BDT') => {
  if (!n && n !== 0) return '—';
  return `৳${Number(n).toLocaleString('en-BD')}`;
};

// ── Percent ───────────────────────────────────────────────────
export const pct = (raised, needed) => {
  if (!needed || needed === 0) return 0;
  return Math.min(100, Math.round((raised / needed) * 100));
};

// ── Truncate text ─────────────────────────────────────────────
export const trunc = (str = '', len = 120) =>
  str.length > len ? str.slice(0, len).trimEnd() + '…' : str;

// ── Avatar initials ───────────────────────────────────────────
export const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

// ── Blood group color ─────────────────────────────────────────
export const bloodColor = (g) => {
  const map = { 'A+':'#E63946','A-':'#c1121f','B+':'#06B6D4','B-':'#0284c7','AB+':'#8B5CF6','AB-':'#7c3aed','O+':'#10B981','O-':'#059669' };
  return map[g] || '#94A3B8';
};

// ── Job type color ────────────────────────────────────────────
export const jobTypeColor = (t) => {
  const map = { 'full-time':'cyan','part-time':'purple','freelance':'amber','internship':'green','govt':'red' };
  return map[t] || 'gray';
};

// ── Status badge color ────────────────────────────────────────
export const statusColor = (s) => {
  const map = { pending:'amber', approved:'green', rejected:'red', active:'green', closed:'gray', completed:'cyan', shortlisted:'purple', hired:'green' };
  return map[s] || 'gray';
};

// ── Build query string ────────────────────────────────────────
export const buildQuery = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

// ── Debounce ──────────────────────────────────────────────────
export const debounce = (fn, delay = 400) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

export const DIVISIONS = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh'];
export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
export const JOB_TYPES = ['full-time','part-time','freelance','internship','govt'];
export const DONATION_CATEGORIES = ['medical','education','disaster','food','other'];
export const VOLUNTEER_CATEGORIES = ['general','medical','education','disaster','environment','tech','other'];
export const EMERGENCY_TYPES = ['hospital','police','fire','ambulance','mental','other'];
export const BD_DISTRICTS = [
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Jamalpur', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Mymensingh', 'Narayanganj', 'Narsingdi', 'Netrokona', 'Rajbari', 'Shariatpur', 'Sherpur', 'Tangail',
  'Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajgonj',
  'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon',
  'Barguna', 'Barisal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
  'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chittagong', 'Comilla', "Cox's Bazar", 'Feni', 'Khagrachari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet',
  'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'
].sort();
