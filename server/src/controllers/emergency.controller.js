const db = require('../config/db');
const { ok, err } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { type, district, division, search, sort, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = ['1=1'];
    const params = [];

    if (type)     { where.push('e.type = ?');              params.push(type); }
    if (district) { where.push('e.district LIKE ?');       params.push(`%${district}%`); }
    if (division) { where.push('e.division LIKE ?');       params.push(`%${division}%`); }
    if (search)   { where.push('e.name LIKE ?');           params.push(`%${search}%`); }

    let orderClause = 'ORDER BY e.is_verified DESC, e.created_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY e.created_at ASC';
    else if (sort === 'name_asc') orderClause = 'ORDER BY e.name ASC';
    else if (sort === 'name_desc') orderClause = 'ORDER BY e.name DESC';

    const [rows] = await db.execute(
      `SELECT e.*, u.name AS added_by
       FROM emergency_services e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE ${where.join(' AND ')}
       ${orderClause}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM emergency_services e WHERE ${where.join(' AND ')}`,
      params
    );

    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    err(res, 'Failed to fetch services', 500);
  }
};

exports.getOne = async (req, res) => {
  const [[row]] = await db.execute('SELECT * FROM emergency_services WHERE id=?', [req.params.id]);
  row ? ok(res, row) : err(res, 'Not found', 404);
};

exports.create = async (req, res) => {
  try {
    const { name, type, address, division, district, upazila, phone, latitude, longitude, is_24h } = req.body;
    if (!name || !type) return err(res, 'Name and type required', 400);

    const [r] = await db.execute(
      `INSERT INTO emergency_services (name,type,address,division,district,upazila,phone,latitude,longitude,is_24h,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [name, type, address||null, division||null, district||null, upazila||null, phone||null,
       latitude||null, longitude||null, is_24h||0, req.user.id]
    );
    const [[row]] = await db.execute('SELECT * FROM emergency_services WHERE id=?', [r.insertId]);
    ok(res, row, 'Service added', 201);
  } catch {
    err(res, 'Failed to create service', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { name, type, address, division, district, upazila, phone, latitude, longitude, is_24h, is_verified } = req.body;
    await db.execute(
      `UPDATE emergency_services SET name=?,type=?,address=?,division=?,district=?,upazila=?,phone=?,
       latitude=?,longitude=?,is_24h=?,is_verified=? WHERE id=?`,
      [name,type,address||null,division||null,district||null,upazila||null,phone||null,
       latitude||null,longitude||null,is_24h||0,is_verified||0, req.params.id]
    );
    ok(res, null, 'Updated');
  } catch {
    err(res, 'Update failed', 500);
  }
};

exports.remove = async (req, res) => {
  await db.execute('DELETE FROM emergency_services WHERE id=?', [req.params.id]);
  ok(res, null, 'Deleted');
};

exports.getSOS = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM sos_contacts WHERE is_active=1 ORDER BY id');
  ok(res, rows);
};
