const db = require('../config/db');
const { ok, err } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { status = 'approved', category, district, urgent, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let   where  = [];
    const params = [];

    if (status !== 'all') { where.push('d.status = ?'); params.push(status); }
    if (category) { where.push('d.category = ?');       params.push(category); }
    if (district) { where.push('d.district LIKE ?');    params.push(`%${district}%`); }
    if (urgent === 'true') { where.push('d.is_urgent = 1'); }
    if (search)   { where.push('d.title LIKE ?');       params.push(`%${search}%`); }

    const cond = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
    let orderClause = 'ORDER BY d.is_urgent DESC, d.created_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY d.created_at ASC';
    else if (sort === 'name_asc') orderClause = 'ORDER BY d.title ASC';
    else if (sort === 'name_desc') orderClause = 'ORDER BY d.title DESC';

    const [rows] = await db.execute(
      `SELECT d.*, u.name AS poster_name, u.avatar AS poster_avatar, u.is_verified AS poster_verified
       FROM donations d JOIN users u ON d.user_id=u.id
       ${cond} ${orderClause}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM donations d ${cond}`, params
    );
    ok(res, { rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    err(res, 'Failed', 500);
  }
};

exports.getOne = async (req, res) => {
  const [[row]] = await db.execute(
    `SELECT d.*, u.name AS poster_name, u.phone AS poster_phone, u.avatar AS poster_avatar, u.is_verified AS poster_verified
     FROM donations d JOIN users u ON d.user_id=u.id WHERE d.id=?`,
    [req.params.id]
  );
  if (!row) return err(res, 'Not found', 404);

  const [transactions] = await db.execute(
    `SELECT dt.*, u.name AS donor_name FROM donation_transactions dt
     LEFT JOIN users u ON dt.donor_id=u.id
     WHERE dt.donation_id=? ORDER BY dt.created_at DESC LIMIT 20`,
    [row.id]
  );
  ok(res, { ...row, transactions });
};

exports.create = async (req, res) => {
  try {
    const { title, description, category, amount_needed, division, district, is_urgent, deadline } = req.body;
    if (!title || !description || !amount_needed) return err(res, 'Required fields missing', 400);
    const image = req.file ? `/uploads/donations/${req.file.filename}` : null;

      const urgentVal = (is_urgent === 'true' || is_urgent === true || is_urgent === 1) ? 1 : 0;

    const [r] = await db.execute(
      `INSERT INTO donations (user_id,title,description,category,amount_needed,image,division,district,is_urgent,deadline)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, title, description, category||'other', amount_needed, image,
       division||null, district||null, urgentVal, deadline||null]
    );
    const [[row]] = await db.execute('SELECT * FROM donations WHERE id=?', [r.insertId]);
    ok(res, row, 'Request submitted for review', 201);
  } catch {
    err(res, 'Failed to create', 500);
  }
};

exports.donate = async (req, res) => {
  try {
    const { amount, message, is_anonymous } = req.body;
    if (!amount || amount <= 0) return err(res, 'Valid amount required', 400);

    const [[donation]] = await db.execute(
      "SELECT * FROM donations WHERE id=? AND status='approved'", [req.params.id]
    );
    if (!donation) return err(res, 'Donation not found or not active', 404);

    await db.execute(
      'INSERT INTO donation_transactions (donation_id, donor_id, amount, message, is_anonymous) VALUES (?,?,?,?,?)',
      [donation.id, is_anonymous ? null : req.user.id, amount, message||null, is_anonymous||0]
    );
    await db.execute(
      'UPDATE donations SET amount_raised = amount_raised + ? WHERE id=?', [amount, donation.id]
    );
    ok(res, null, 'Donation recorded. Thank you!', 201);
  } catch {
    err(res, 'Failed', 500);
  }
};

exports.getMyDonations = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM donations WHERE user_id=? ORDER BY created_at DESC', [req.user.id]
  );
  ok(res, rows);
};
