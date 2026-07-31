const db = require('../config/db');
const { ok, err } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { type, category, district, search, remote, sort, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = ["j.status = 'active'"];
    const params = [];

    if (type)     { where.push('j.type = ?');           params.push(type); }
    if (category) { where.push('j.category LIKE ?');    params.push(`%${category}%`); }
    if (district) { where.push('j.district LIKE ?');    params.push(`%${district}%`); }
    if (remote === 'true') where.push('j.is_remote = 1');
    if (search)   { where.push('(j.title LIKE ? OR j.company LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    let orderClause = 'ORDER BY j.created_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY j.created_at ASC';
    else if (sort === 'name_asc') orderClause = 'ORDER BY j.title ASC';
    else if (sort === 'name_desc') orderClause = 'ORDER BY j.title DESC';

    const [rows] = await db.execute(
      `SELECT j.*, u.name AS poster_name, u.is_verified AS poster_verified,
       (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id) AS applicants
       FROM jobs j JOIN users u ON j.user_id=u.id
       WHERE ${where.join(' AND ')} ${orderClause}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM jobs j WHERE ${where.join(' AND ')}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('API Error:', error);
    err(res, error.message || 'Failed', 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    await db.execute('UPDATE jobs SET views=views+1 WHERE id=?', [req.params.id]);
    const [[row]] = await db.execute(
      `SELECT j.*, u.name AS poster_name, u.email AS poster_email, u.phone AS poster_phone, u.is_verified AS poster_verified
       FROM jobs j JOIN users u ON j.user_id=u.id WHERE j.id=?`,
      [req.params.id]
    );
    if (!row) return err(res, 'Not found', 404);
    ok(res, row);
  } catch { err(res, 'Failed', 500); }
};

exports.create = async (req, res) => {
  try {
    const { title, company, description, requirements, category, type, salary_min, salary_max, division, district, is_remote, deadline } = req.body;
    if (!title || !company || !description) return err(res, 'Required fields missing', 400);
    // Admin-posted jobs are active immediately; user-submitted jobs go to pending
    const insertStatus = req.user.role === 'admin' ? 'active' : 'pending';
    const [r] = await db.execute(
      `INSERT INTO jobs (user_id,title,company,description,requirements,category,type,salary_min,salary_max,division,district,is_remote,deadline,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, title, company, description, requirements||null, category||'general',
       type||'full-time', salary_min||null, salary_max||null, division||null, district||null, is_remote||0, deadline||null, insertStatus]
    );
    const [[job]] = await db.execute('SELECT * FROM jobs WHERE id=?', [r.insertId]);
    const msg = insertStatus === 'pending'
      ? 'Job submitted for admin review'
      : 'Job posted successfully';
    ok(res, job, msg, 201);
  } catch { err(res, 'Failed to post job', 500); }
};

exports.update = async (req, res) => {
  try {
    const { title, company, description, requirements, category, type, salary_min, salary_max, division, district, is_remote, deadline, status } = req.body;
    const [[job]] = await db.execute('SELECT * FROM jobs WHERE id=?', [req.params.id]);
    if (!job) return err(res, 'Not found', 404);
    if (job.user_id !== req.user.id && req.user.role !== 'admin') return err(res, 'Unauthorized', 403);

    await db.execute(
      `UPDATE jobs SET title=?,company=?,description=?,requirements=?,category=?,type=?,salary_min=?,
       salary_max=?,division=?,district=?,is_remote=?,deadline=?,status=? WHERE id=?`,
      [title,company,description,requirements||null,category,type,salary_min||null,salary_max||null,
       division||null,district||null,is_remote||0,deadline||null,status||'active',req.params.id]
    );
    ok(res, null, 'Job updated');
  } catch { err(res, 'Failed', 500); }
};

exports.remove = async (req, res) => {
  try {
    const [[job]] = await db.execute('SELECT user_id FROM jobs WHERE id=?', [req.params.id]);
    if (!job) return err(res, 'Not found', 404);
    if (job.user_id !== req.user.id && req.user.role !== 'admin') return err(res, 'Unauthorized', 403);
    await db.execute('DELETE FROM jobs WHERE id=?', [req.params.id]);
    ok(res, null, 'Deleted');
  } catch { err(res, 'Failed', 500); }
};

exports.apply = async (req, res) => {
  try {
    const { cover_letter } = req.body;
    const resume = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    const [[existing]] = await db.execute(
      'SELECT id FROM job_applications WHERE job_id=? AND user_id=?', [req.params.id, req.user.id]
    );
    if (existing) return err(res, 'Already applied', 409);
    await db.execute(
      'INSERT INTO job_applications (job_id, user_id, cover_letter, resume) VALUES (?,?,?,?)',
      [req.params.id, req.user.id, cover_letter||null, resume]
    );
    ok(res, null, 'Application submitted', 201);
  } catch { err(res, 'Application failed', 500); }
};

exports.getApplications = async (req, res) => {
  const [[job]] = await db.execute('SELECT user_id FROM jobs WHERE id=?', [req.params.id]);
  if (!job) return err(res, 'Not found', 404);
  if (job.user_id !== req.user.id && req.user.role !== 'admin') return err(res, 'Unauthorized', 403);
  const [rows] = await db.execute(
    `SELECT a.*, u.name, u.email, u.phone, u.avatar FROM job_applications a
     JOIN users u ON a.user_id=u.id WHERE a.job_id=? ORDER BY a.created_at DESC`,
    [req.params.id]
  );
  ok(res, rows);
};

exports.updateApplication = async (req, res) => {
  const { status } = req.body;
  await db.execute('UPDATE job_applications SET status=? WHERE id=?', [status, req.params.appId]);
  ok(res, null, 'Status updated');
};

exports.getMyApplications = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT a.*, j.title AS job_title, j.company FROM job_applications a
     JOIN jobs j ON a.job_id=j.id WHERE a.user_id=? ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  ok(res, rows);
};

exports.getMyPostedJobs = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT j.*, 
     (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id) AS applicants
     FROM jobs j WHERE j.user_id=? ORDER BY j.created_at DESC`,
    [req.user.id]
  );
  ok(res, rows);
};

