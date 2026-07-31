const db = require('../config/db');
const { ok, err } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { blood_group, district, division, available, sort, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    // Only show approved & available donors publicly
    let   where  = ['b.is_available = 1', "COALESCE(b.status,'approved') = 'approved'"];
    const params = [];

    if (blood_group) { where.push('b.blood_group = ?');    params.push(blood_group); }
    if (district)    { where.push('b.district LIKE ?');    params.push(`%${district}%`); }
    if (division)    { where.push('b.division LIKE ?');    params.push(`%${division}%`); }
    if (available === 'false') where[0] = '1=1';

    let orderClause = 'ORDER BY b.updated_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY b.updated_at ASC';
    else if (sort === 'name_asc') orderClause = 'ORDER BY b.name ASC';
    else if (sort === 'name_desc') orderClause = 'ORDER BY b.name DESC';

    const [rows] = await db.execute(
      `SELECT b.*, null as avatar, 1 as is_verified
       FROM blood_donors b
       WHERE ${where.join(' AND ')}
       ${orderClause}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM blood_donors b WHERE ${where.join(' AND ')}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch {
    err(res, 'Failed', 500);
  }
};

exports.register = async (req, res) => {
  try {
    const { blood_group, division, district, upazila, address, emergency_contact } = req.body;
    if (!blood_group) return err(res, 'Blood group required', 400);

    const [[existing]] = await db.execute('SELECT id FROM blood_donors WHERE user_id=?', [req.user.id]);
    if (existing) return err(res, 'Already registered as donor', 409);

    const [[user]] = await db.execute('SELECT name, phone FROM users WHERE id=?', [req.user.id]);

    const [r] = await db.execute(
      `INSERT INTO blood_donors (user_id, name, phone, blood_group, division, district, upazila, address, emergency_contact, status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, user.name, user.phone, blood_group, division||null, district||null, upazila||null, address||null, emergency_contact||null, 'pending']
    );
    const [[row]] = await db.execute(
      'SELECT b.* FROM blood_donors b WHERE b.id=?',
      [r.insertId]
    );
    ok(res, row, 'Registration submitted for admin review', 201);
  } catch {
    err(res, 'Registration failed', 500);
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const [[donor]] = await db.execute('SELECT id, is_available FROM blood_donors WHERE user_id=?', [req.user.id]);
    if (!donor) return err(res, 'Not a registered donor', 404);
    const next = donor.is_available ? 0 : 1;
    await db.execute('UPDATE blood_donors SET is_available=? WHERE user_id=?', [next, req.user.id]);
    ok(res, { is_available: next }, next ? 'Marked available' : 'Marked unavailable');
  } catch {
    err(res, 'Failed', 500);
  }
};

exports.getMyDonor = async (req, res) => {
  const [[row]] = await db.execute('SELECT * FROM blood_donors WHERE user_id=?', [req.user.id]);
  row ? ok(res, row) : err(res, 'Not registered', 404);
};

exports.update = async (req, res) => {
  try {
    const { division, district, upazila, address, emergency_contact } = req.body;
    await db.execute(
      'UPDATE blood_donors SET division=?,district=?,upazila=?,address=?,emergency_contact=? WHERE user_id=?',
      [division||null, district||null, upazila||null, address||null, emergency_contact||null, req.user.id]
    );
    ok(res, null, 'Updated');
  } catch {
    err(res, 'Failed', 500);
  }
};
