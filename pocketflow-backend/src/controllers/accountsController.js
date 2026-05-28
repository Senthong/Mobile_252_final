const pool = require('../db/pool');

// ── GET /accounts ─────────────────────────────────────────
async function getAccounts(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json({
      success: true,
      data: result.rows.map(a => ({ ...a, balance: parseFloat(a.balance) })),
    });
  } catch (err) {
    console.error('[getAccounts]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── POST /accounts ────────────────────────────────────────
async function createAccount(req, res) {
  const { name, balance = 0, type, currency = 'VND' } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, message: 'Thiếu name hoặc type' });
  }
  if (!['cash', 'bank', 'ewallet'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type phải là cash, bank hoặc ewallet' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO accounts (user_id, name, balance, type, currency)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.userId, name, parseFloat(balance), type, currency]);

    const acc = result.rows[0];
    res.status(201).json({
      success: true,
      data: { ...acc, balance: parseFloat(acc.balance) },
    });
  } catch (err) {
    console.error('[createAccount]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── PUT /accounts/:id ─────────────────────────────────────
async function updateAccount(req, res) {
  const { id } = req.params;
  const { name, type, currency } = req.body;

  try {
    const result = await pool.query(`
      UPDATE accounts
      SET
        name     = COALESCE($1, name),
        type     = COALESCE($2, type),
        currency = COALESCE($3, currency),
        updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [name, type, currency, id, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    const acc = result.rows[0];
    res.json({ success: true, data: { ...acc, balance: parseFloat(acc.balance) } });
  } catch (err) {
    console.error('[updateAccount]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { getAccounts, createAccount, updateAccount };
