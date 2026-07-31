const db = require('../config/db');
const { ok, err } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { category, district, search, sort, page = 1, limit = 16 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = ['v.is_active = 1'];
    const params = [];

    if (category) { where.push('v.category = ?');      params.push(category); }
    if (district) { where.push('v.district LIKE ?');   params.push(`%${district}%`); }
    if (search)   { where.push('u.name LIKE ?');       params.push(`%${search}%`); }

    let orderClause = 'ORDER BY v.created_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY v.created_at ASC';
    else if (sort === 'name_asc') orderClause = 'ORDER BY u.name ASC';
    else if (sort === 'name_desc') orderClause = 'ORDER BY u.name DESC';

    const [rows] = await db.execute(
      `SELECT v.*, u.name, u.avatar, u.is_verified
       FROM volunteers v JOIN users u ON v.user_id=u.id
       WHERE ${where.join(' AND ')} ${orderClause}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM volunteers v JOIN users u ON v.user_id=u.id WHERE ${where.join(' AND ')}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { err(res, 'Failed', 500); }
};

exports.register = async (req, res) => {
  try {
    const { skills, availability, category, division, district, bio } = req.body;
    const [[existing]] = await db.execute('SELECT id FROM volunteers WHERE user_id=?', [req.user.id]);
    if (existing) return err(res, 'Already registered', 409);

    const [r] = await db.execute(
      `INSERT INTO volunteers (user_id,skills,availability,category,division,district,bio,is_active)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.id, skills||null, availability||null, category||'general', division||null, district||null, bio||null, 0]
    );
    const [[row]] = await db.execute(
      'SELECT v.*, u.name, u.avatar FROM volunteers v JOIN users u ON v.user_id=u.id WHERE v.id=?',
      [r.insertId]
    );
    ok(res, row, 'Registration submitted for admin review', 201);
  } catch { err(res, 'Failed', 500); }
};

exports.updateVolunteer = async (req, res) => {
  try {
    const { skills, availability, category, district, bio } = req.body;
    await db.execute(
      'UPDATE volunteers SET skills=?,availability=?,category=?,district=?,bio=? WHERE user_id=?',
      [skills||null, availability||null, category||'general', district||null, bio||null, req.user.id]
    );
    ok(res, null, 'Updated');
  } catch { err(res, 'Failed', 500); }
};

exports.deactivate = async (req, res) => {
  await db.execute('UPDATE volunteers SET is_active=0 WHERE user_id=?', [req.user.id]);
  ok(res, null, 'Deactivated');
};

exports.getMyVolunteer = async (req, res) => {
  const [[row]] = await db.execute('SELECT * FROM volunteers WHERE user_id=?', [req.user.id]);
  row ? ok(res, row) : err(res, 'Not registered', 404);
};
