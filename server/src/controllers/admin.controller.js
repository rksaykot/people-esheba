const db = require('../config/db');
const { ok, err } = require('../utils/response');

/* ── GET /admin/dashboard ─────────────────────────────────── */
exports.getDashboard = async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='user')          AS total_users,
        (SELECT COUNT(*) FROM users WHERE role='admin')         AS total_admins,
        (SELECT COUNT(*) FROM users WHERE is_active=0)          AS blocked_users,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at)=CURDATE()) AS new_users_today,
        (SELECT COUNT(*) FROM jobs WHERE status='active')       AS active_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status='pending')      AS pending_jobs,
        (SELECT COUNT(*) FROM jobs)                             AS total_jobs,
        (SELECT COUNT(*) FROM donations WHERE status='pending') AS pending_donations,
        (SELECT COUNT(*) FROM donations WHERE status='approved')AS active_donations,
        (SELECT COALESCE(SUM(amount),0) FROM donation_transactions) AS total_donated,
        (SELECT COUNT(*) FROM blood_donors WHERE is_available=1 AND COALESCE(status,'approved')='approved') AS available_donors,
        (SELECT COUNT(*) FROM blood_donors WHERE COALESCE(status,'approved')='pending') AS pending_blood,
        (SELECT COUNT(*) FROM volunteers WHERE is_active=1)     AS active_volunteers,
        (SELECT COUNT(*) FROM volunteers WHERE is_active=0)     AS pending_volunteers,
        (SELECT COUNT(*) FROM emergency_services)               AS emergency_services,
        (SELECT COUNT(*) FROM job_applications)                 AS total_applications,
        (SELECT COUNT(*) FROM reports WHERE status='pending')   AS pending_reports
    `);

    const [recent_users] = await db.execute(
      'SELECT id,name,email,role,is_active,created_at FROM users ORDER BY created_at DESC LIMIT 8'
    );
    const [pending_donations] = await db.execute(
      `SELECT d.*,u.name AS poster_name FROM donations d
       JOIN users u ON d.user_id=u.id WHERE d.status='pending' ORDER BY d.created_at DESC LIMIT 8`
    );
    const [recent_jobs] = await db.execute(
      `SELECT j.id,j.title,j.company,j.type,j.status,j.created_at,u.name AS poster
       FROM jobs j JOIN users u ON j.user_id=u.id ORDER BY j.created_at DESC LIMIT 6`
    );

    // Monthly new users (last 6 months)
    const [monthlyUsers] = await db.execute(`
      SELECT DATE_FORMAT(created_at,'%b %Y') AS month, COUNT(*) AS count
      FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY MIN(created_at)
    `);

    ok(res, { stats, recent_users, pending_donations, recent_jobs, monthly_users: monthlyUsers });
  } catch (e) {
    console.error(e);
    err(res, 'Dashboard failed', 500);
  }
};

/* ── GET /admin/users ─────────────────────────────────────── */
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, district, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = ['1=1'];
    const params = [];

    if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (district) { where.push('district LIKE ?'); params.push(`%${district}%`); }
    if (role)   { where.push('role = ?');   params.push(role); }
    if (status === 'active')   where.push('is_active = 1');
    if (status === 'blocked')  where.push('is_active = 0');

    const [rows] = await db.execute(
      `SELECT id,name,email,phone,role,avatar,division,district,is_active,is_verified,created_at
       FROM users WHERE ${where.join(' AND ')} ORDER BY created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM users WHERE ${where.join(' AND ')}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

/* ── PUT /admin/users/:id/toggle ──────────────────────────── */
exports.toggleUser = async (req, res) => {
  const [[user]] = await db.execute('SELECT id,is_active,role FROM users WHERE id=?', [req.params.id]);
  if (!user) return err(res, 'Not found', 404);
  if (user.role === 'admin') return err(res, 'Cannot block admin', 403);
  await db.execute('UPDATE users SET is_active=? WHERE id=?', [user.is_active ? 0 : 1, req.params.id]);
  ok(res, { is_active: !user.is_active }, user.is_active ? 'User blocked' : 'User unblocked');
};

/* ── PUT /admin/users/:id/role ────────────────────────────── */
exports.changeRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return err(res, 'Invalid role', 400);
  await db.execute('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
  ok(res, null, 'Role updated');
};

/* ── DELETE /admin/users/:id ──────────────────────────────── */
exports.deleteUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return err(res, 'Cannot delete yourself', 400);
  await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
  ok(res, null, 'User deleted');
};

/* ── Donations management ─────────────────────────────────── */
exports.getDonations = async (req, res) => {
  try {
    const { status, search, district, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = ['1=1'];
    const params = [];
    if (status) { where.push('d.status = ?'); params.push(status); }
    if (search) { where.push('(d.title LIKE ? OR u.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (district) { where.push('d.district LIKE ?'); params.push(`%${district}%`); }
    const [rows] = await db.execute(
      `SELECT d.*, u.name AS poster_name, u.email AS poster_email
       FROM donations d JOIN users u ON d.user_id=u.id
       WHERE ${where.join(' AND ')} ORDER BY d.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM donations d WHERE ${where.join(' AND ')}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

exports.updateDonationStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved','rejected','completed'].includes(status)) return err(res, 'Invalid status', 400);
  await db.execute('UPDATE donations SET status=? WHERE id=?', [status, req.params.id]);
  ok(res, null, `Donation ${status}`);
};

exports.deleteDonation = async (req, res) => {
  await db.execute('DELETE FROM donations WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};

/* ── Jobs management ──────────────────────────────────────── */
exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search, district } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    const params = [];
    if (status) { where.push('j.status = ?'); params.push(status); }
    if (search) { where.push('(j.title LIKE ? OR j.company LIKE ? OR u.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (district) { where.push('j.district LIKE ?'); params.push(`%${district}%`); }
    const cond = where.join(' AND ');
    const [rows] = await db.execute(
      `SELECT j.*, u.name AS poster_name,
       (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id) AS applicants
       FROM jobs j JOIN users u ON j.user_id=u.id
       WHERE ${cond}
       ORDER BY j.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM jobs j WHERE ${cond}`, params);
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

exports.deleteJob = async (req, res) => {
  await db.execute('DELETE FROM jobs WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};

exports.createJob = async (req, res) => {
  try {
    const { title, company, description, type, location, division, district, salary, salary_min, salary_max, deadline, is_active } = req.body;
    if (!title || !company) return err(res, 'Title and company required', 400);
    // Support both salary (string) and salary_min/salary_max (numbers) from different form layouts
    const sMin = salary_min || null;
    const sMax = salary_max || null;
    const desc = description || (salary ? `Salary: ${salary}` : '') || '';
    const dist = district || location || null;
    const status = (is_active === false || is_active === 0) ? 'draft' : 'active';
    const [r] = await db.execute(
      `INSERT INTO jobs (user_id,title,company,description,type,salary_min,salary_max,division,district,deadline,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, title, company, desc, type||'full-time', sMin, sMax, division||null, dist, deadline||null, status]
    );
    const [[job]] = await db.execute(
      `SELECT j.*, u.name AS poster_name FROM jobs j JOIN users u ON j.user_id=u.id WHERE j.id=?`,
      [r.insertId]
    );
    ok(res, job, 'Job posted', 201);
  } catch (e) { console.error(e); err(res, 'Failed to post job', 500); }
};

exports.updateJob = async (req, res) => {
  try {
    const { title, company, description, type, location, division, district, salary, salary_min, salary_max, deadline, is_active, status } = req.body;
    const [[job]] = await db.execute('SELECT id FROM jobs WHERE id=?', [req.params.id]);
    if (!job) return err(res, 'Not found', 404);
    const sMin = salary_min || null;
    const sMax = salary_max || null;
    const desc = description || '';
    const dist = district || location || null;
    const jobStatus = status || ((is_active === false || is_active === 0) ? 'draft' : 'active');
    await db.execute(
      `UPDATE jobs SET title=?,company=?,description=?,type=?,salary_min=?,salary_max=?,division=?,district=?,deadline=?,status=? WHERE id=?`,
      [title, company, desc, type||'full-time', sMin, sMax, division||null, dist, deadline||null, jobStatus, req.params.id]
    );
    ok(res, null, 'Job updated');
  } catch (e) { console.error(e); err(res, 'Failed to update job', 500); }
};

/* ── Reports ──────────────────────────────────────────────── */
exports.getReports = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT r.*, u.name AS reporter_name FROM reports r
     JOIN users u ON r.reporter_id=u.id ORDER BY r.created_at DESC LIMIT 50`
  );
  ok(res, rows);
};

exports.resolveReport = async (req, res) => {
  await db.execute("UPDATE reports SET status='resolved' WHERE id=?", [req.params.id]);
  ok(res, null, 'Resolved');
};

/* ── Announcements ────────────────────────────────────────── */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return err(res, 'Title and body required', 400);
    await db.execute(
      'INSERT INTO announcements (admin_id, title, body) VALUES (?,?,?)',
      [req.user.id, title, body]
    );
    // Notify all users
    const [users] = await db.execute('SELECT id FROM users WHERE is_active=1');
    const inserts = users.map(u => [u.id, title, body, 'announcement', null]);
    if (inserts.length) {
      await db.query(
        'INSERT INTO notifications (user_id, title, body, type, link) VALUES ?', [inserts]
      );
    }
    ok(res, null, `Announcement sent to ${users.length} users`, 201);
  } catch { err(res, 'Failed', 500); }
};

/* ── Blood donors (admin view) ────────────────────────────── */
exports.getBloodDonors = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [rows] = await db.execute(
      `SELECT b.*, u.name, u.email, u.phone, u.is_verified
       FROM blood_donors b JOIN users u ON b.user_id=u.id
       ORDER BY b.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM blood_donors');
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

/* ── Volunteers (admin view) ──────────────────────────────── */
exports.getVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [rows] = await db.execute(
      `SELECT v.*, u.name, u.email, u.phone
       FROM volunteers v JOIN users u ON v.user_id=u.id
       ORDER BY v.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM volunteers');
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

/* ── Emergency services management ───────────────────────── */
exports.getEmergencyServices = async (req, res) => {
  try {
    const { search, district, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    const params = [];
    
    if (search) { where.push('(name LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (district) { where.push('district LIKE ?'); params.push(`%${district}%`); }
    
    const cond = where.join(' AND ');
    const [rows] = await db.execute(
      `SELECT * FROM emergency_services WHERE ${cond} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM emergency_services WHERE ${cond}`, params);
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

exports.createEmergencyService = async (req, res) => {
  try {
    const { name, type, address, division, district, phone, latitude, longitude, is_24h } = req.body;
    const [r] = await db.execute(
      `INSERT INTO emergency_services (name,type,address,division,district,phone,latitude,longitude,is_24h,is_verified,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,1,?)`,
      [name,type,address||null,division||null,district||null,phone||null,latitude||null,longitude||null,is_24h||0,req.user.id]
    );
    const [[row]] = await db.execute('SELECT * FROM emergency_services WHERE id=?', [r.insertId]);
    ok(res, row, 'Created', 201);
  } catch { err(res, 'Failed', 500); }
};

exports.updateEmergencyService = async (req, res) => {
  const { name, type, address, division, district, phone, is_verified, is_24h } = req.body;
  await db.execute(
    'UPDATE emergency_services SET name=?,type=?,address=?,division=?,district=?,phone=?,is_verified=?,is_24h=? WHERE id=?',
    [name,type,address||null,division||null,district||null,phone||null,is_verified||0,is_24h||0,req.params.id]
  );
  ok(res, null, 'Updated');
};

exports.deleteEmergencyService = async (req, res) => {
  await db.execute('DELETE FROM emergency_services WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};

/* ── Analytics ────────────────────────────────────────────── */
exports.getAnalytics = async (req, res) => {
  try {
    const [topJobs] = await db.execute(
      'SELECT title, company, views, type FROM jobs ORDER BY views DESC LIMIT 5'
    );
    const [topDonations] = await db.execute(
      "SELECT title, amount_needed, amount_raised, category FROM donations WHERE status='approved' ORDER BY amount_raised DESC LIMIT 5"
    );
    const [bloodByGroup] = await db.execute(
      'SELECT blood_group, COUNT(*) AS count FROM blood_donors WHERE is_available=1 GROUP BY blood_group'
    );
    const [volunteerByCategory] = await db.execute(
      'SELECT category, COUNT(*) AS count FROM volunteers WHERE is_active=1 GROUP BY category'
    );
    ok(res, { topJobs, topDonations, bloodByGroup, volunteerByCategory });
  } catch { err(res, 'Failed', 500); }
};

/* ── Blood donors extras ──────────────────────────────────── */
exports.deleteBloodDonor = async (req, res) => {
  await db.execute('DELETE FROM blood_donors WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};
exports.verifyBloodDonor = async (req, res) => {
  await db.execute('UPDATE users u JOIN blood_donors b ON u.id=b.user_id SET u.is_verified=1 WHERE b.id=?', [req.params.id]);
  ok(res, null, 'Verified');
};
exports.approveBloodDonor = async (req, res) => {
  const { status } = req.body;
  if (!['approved','rejected'].includes(status)) return err(res, 'Invalid status', 400);
  await db.execute('UPDATE blood_donors SET status=? WHERE id=?', [status, req.params.id]);
  ok(res, null, `Blood donor ${status}`);
};

/* ── Admin blood donors list with status filter ───────────── */
exports.getBloodDonorsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, district } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    const params = [];
    if (status) { where.push("COALESCE(b.status,'approved') = ?"); params.push(status); }
    if (search) { where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (district) { where.push('b.district LIKE ?'); params.push(`%${district}%`); }
    const cond = where.join(' AND ');
    const [rows] = await db.execute(
      `SELECT b.*, u.name, u.email, u.phone, u.is_verified
       FROM blood_donors b JOIN users u ON b.user_id=u.id
       WHERE ${cond}
       ORDER BY b.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM blood_donors b WHERE ${cond}`, params);
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

/* ── Volunteers extras ────────────────────────────────────── */
exports.deleteVolunteer = async (req, res) => {
  await db.execute('DELETE FROM volunteers WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};
exports.verifyVolunteer = async (req, res) => {
  await db.execute('UPDATE users u JOIN volunteers v ON u.id=v.user_id SET u.is_verified=1 WHERE v.id=?', [req.params.id]);
  ok(res, null, 'Verified');
};
exports.approveVolunteer = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  const isActive = status === 'approved' ? 1 : 0;
  await db.execute('UPDATE volunteers SET is_active=? WHERE id=?', [isActive, req.params.id]);
  ok(res, null, `Volunteer ${status}`);
};

/* ── Volunteers admin list with pending support ───────────── */
exports.getVolunteersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, district } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    const params = [];
    if (status === 'pending')  { where.push('v.is_active = 0'); }
    else if (status === 'active')   { where.push('v.is_active = 1'); }
    if (search) { where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (district) { where.push('v.district LIKE ?'); params.push(`%${district}%`); }
    const cond = where.join(' AND ');
    const [rows] = await db.execute(
      `SELECT v.*, u.name, u.email, u.phone
       FROM volunteers v JOIN users u ON v.user_id=u.id
       WHERE ${cond}
       ORDER BY v.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM volunteers v WHERE ${cond}`, params);
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

/* ── Jobs extras ──────────────────────────────────────────── */
exports.updateJobStatus = async (req, res) => {
  const { status } = req.body;
  if (!['active','closed','draft'].includes(status)) return err(res, 'Invalid status', 400);
  await db.execute('UPDATE jobs SET status=? WHERE id=?', [status, req.params.id]);
  ok(res, null, `Job ${status}`);
};

/* ── Bulk Import ──────────────────────────────────────────── */
const bcrypt = require('bcryptjs');

// notices.category ENUM মান — template/পুরনো CSV এর সাধারণ মানগুলো schema-র ENUM এ ম্যাপ করা হয়
const NOTICE_CATEGORY_MAP = {
  govt: 'government', government: 'government',
  education: 'academic', academic: 'academic', edu: 'academic',
  job: 'career', jobs: 'career', career: 'career',
  scholarship: 'scholarship', donate: 'donate', donation: 'donate',
  health: 'general', general: 'general',
};

// একটা টেবিলের আসল column গুলো DB থেকে বের করে আনে (unknown column ফেলে দেওয়ার জন্য)
async function getTableColumns(table) {
  const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\``);
  return cols.map(c => c.Field);
}

// blood_donors / volunteers এর জন্য name+phone দিয়ে একটা placeholder user তৈরি করে (বা থাকলে সেটাই reuse করে) user_id ফেরত দেয়
async function ensurePlaceholderUser(row) {
  const name = (row.name || row.full_name || 'Imported User').toString().trim();
  const phone = (row.phone || row.emergency_contact || '').toString().trim();
  // email তৈরি — phone থাকলে সেটার ভিত্তিতে, নাহলে name ভিত্তিতে (যাতে re-import এ ডুপ্লিকেট user না হয়)
  const slug = (phone || name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user')
    .replace(/[^a-z0-9]/gi, '');
  const email = `import_${slug}@placeholder.esheba`;

  const [existing] = await db.query('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
  if (existing.length) return existing[0].id;

  const passwordHash = await bcrypt.hash('Imported@' + Math.random().toString(36).slice(2), 10);
  const [result] = await db.execute(
    'INSERT INTO users (name, email, phone, password_hash, role, division, district) VALUES (?,?,?,?,?,?,?)',
    [name, email, phone || null, passwordHash, 'user', row.division || null, row.district || null]
  );
  return result.insertId;
}

exports.bulkImport = async (req, res) => {
  try {
    const { table, rows } = req.body;
    if (!table || !Array.isArray(rows) || rows.length === 0) return err(res, 'Invalid data', 400);

    const allowedTables = ['doctors', 'pharmacies', 'notices', 'education_institutions', 'scholarships', 'jobs', 'blood_donors', 'volunteers', 'emergency_services', 'directory_listings'];
    if (!allowedTables.includes(table)) return err(res, 'Invalid table', 400);

    // টেবিলের আসল column গুলো DB থেকে নিই — এতে template এর extra/ভুল column আপনা-আপনি বাদ পড়বে
    const validColumns = await getTableColumns(table);

    // created_by FK আছে এমন টেবিল — admin এর id বসানো হয়
    const tablesWithCreatedBy = ['doctors', 'pharmacies', 'notices', 'education_institutions', 'scholarships', 'jobs', 'directory_listings'];
    const needsCreatedBy = tablesWithCreatedBy.includes(table) && validColumns.includes('created_by');

    // user_id (NOT NULL) দরকার এমন টেবিল
    const userBackedTables = ['blood_donors', 'volunteers']; // name/phone দিয়ে placeholder user তৈরি হবে
    const jobLikeTables = ['jobs'];                           // admin নিজেই owner (user_id = admin)

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = { ...rows[i] };
      delete raw.id;

      try {
        // ── special handling ──
        if (needsCreatedBy) raw.created_by = req.user.id;

        if (table === 'notices' && raw.category != null && raw.category !== '') {
          const mapped = NOTICE_CATEGORY_MAP[String(raw.category).toLowerCase().trim()];
          raw.category = mapped || 'general';
        }

        if (userBackedTables.includes(table)) {
          raw.user_id = await ensurePlaceholderUser(raw);
        } else if (jobLikeTables.includes(table) && !raw.user_id) {
          raw.user_id = req.user.id;
        }

        // ── শুধু আসল column গুলো রেখে বাকি সব বাদ দিই ──
        const columns = Object.keys(raw).filter(k => validColumns.includes(k));
        if (columns.length === 0) throw new Error('No matching columns for this table');

        const values = columns.map(col => {
          let val = raw[col];
          if (val === undefined || val === '') return null;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return val;
        });
        const placeholders = columns.map(() => '?').join(',');
        const query = `INSERT INTO \`${table}\` (${columns.join(',')}) VALUES (${placeholders})`;

        await db.execute(query, values);
        successCount++;
      } catch (e) {
        console.error(`Failed to insert row ${i + 1} into ${table}:`, e.message);
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    ok(res, { successCount, total: rows.length, errors: errors.slice(0, 5) }, `Imported ${successCount}/${rows.length} records`);
  } catch (e) {
    console.error(e);
    err(res, 'Import failed', 500);
  }
};

