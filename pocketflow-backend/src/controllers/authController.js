const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');

// ── Validation rules ──────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Tên không được để trống'),
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];

// ── Register ──────────────────────────────────────────────
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, phone, dob } = req.body;
  const client = await pool.connect();

  try {
    // Kiểm tra email đã tồn tại
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo user
    const result = await client.query(`
      INSERT INTO users (name, email, password, phone, dob)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, dob, tier, avatar, created_at
    `, [name, email, hashedPassword, phone || null, dob || null]);

    const user = result.rows[0];

    // Tạo tài khoản mặc định cho user mới
    await client.query(`
      INSERT INTO accounts (user_id, name, balance, type, currency)
      VALUES
        ($1, 'Tiền mặt', 0, 'cash', 'VND'),
        ($1, 'Ngân hàng', 0, 'bank', 'VND')
    `, [user.id]);

    // Tạo JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { token, user },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  } finally {
    client.release();
  }
}

// ── Login ─────────────────────────────────────────────────
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, name, email, password, phone, dob, tier, avatar FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Trả về user không kèm password
    const { password: _pwd, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { token, user: userWithoutPassword },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── Get current user (me) ─────────────────────────────────
async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, dob, tier, avatar, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[getMe]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { register, login, getMe, registerRules, loginRules };
