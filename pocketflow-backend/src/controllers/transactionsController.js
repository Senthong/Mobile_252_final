const pool = require('../db/pool');

// ── GET /transactions ─────────────────────────────────────
async function getTransactions(req, res) {
  const { limit = 50, offset = 0, type, category_id, month, account_id } = req.query;

  try {
    let conditions = ['t.user_id = $1'];
    let params = [req.userId];
    let idx = 2;

    if (type) {
      conditions.push(`t.type = $${idx++}`);
      params.push(type);
    }
    if (category_id) {
      conditions.push(`t.category_id = $${idx++}`);
      params.push(category_id);
    }
    if (account_id) {
      conditions.push(`t.account_id = $${idx++}`);
      params.push(account_id);
    }
    if (month) {
      // month = "YYYY-MM"
      conditions.push(`to_char(t.date, 'YYYY-MM') = $${idx++}`);
      params.push(month);
    }

    const where = conditions.join(' AND ');

    const result = await pool.query(`
      SELECT
        t.id, t.amount, t.type, t.note, t.date,
        t.account_id,
        a.name   AS account_name,
        c.id     AS category_id,
        c.name   AS category_name,
        c.icon   AS category_icon,
        c.color  AS category_color
      FROM transactions t
      JOIN accounts   a ON a.id = t.account_id
      JOIN categories c ON c.id = t.category_id
      WHERE ${where}
      ORDER BY t.date DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions t WHERE ${where}`,
      params
    );

    res.json({
      success: true,
      data: result.rows.map(formatTransaction),
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('[getTransactions]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── POST /transactions ────────────────────────────────────
async function createTransaction(req, res) {
  const { amount, type, category_id, account_id, note, date } = req.body;

  if (!amount || !type || !category_id || !account_id) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu trường bắt buộc: amount, type, category_id, account_id',
    });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type phải là income hoặc expense' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Kiểm tra account thuộc về user
    const accCheck = await client.query(
      'SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2',
      [account_id, req.userId]
    );
    if (accCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    // Tạo transaction
    const txResult = await client.query(`
      INSERT INTO transactions (user_id, account_id, category_id, amount, type, note, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.userId, account_id, category_id, parseFloat(amount), type, note || '', date || new Date()]);

    // Cập nhật balance của account
    const balanceDelta = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
      [balanceDelta, account_id]
    );

    await client.query('COMMIT');

    // Lấy transaction đầy đủ (có join category, account)
    const fullTx = await pool.query(`
      SELECT
        t.id, t.amount, t.type, t.note, t.date, t.account_id,
        a.name AS account_name,
        c.id AS category_id, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      JOIN categories c ON c.id = t.category_id
      WHERE t.id = $1
    `, [txResult.rows[0].id]);

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công',
      data: formatTransaction(fullTx.rows[0]),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createTransaction]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  } finally {
    client.release();
  }
}

// ── DELETE /transactions/:id ──────────────────────────────
async function deleteTransaction(req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tx = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (tx.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Giao dịch không tồn tại' });
    }

    const { amount, type, account_id } = tx.rows[0];

    // Hoàn lại balance
    const balanceDelta = type === 'income' ? -parseFloat(amount) : parseFloat(amount);
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
      [balanceDelta, account_id]
    );

    await client.query('DELETE FROM transactions WHERE id = $1', [id]);
    await client.query('COMMIT');

    res.json({ success: true, message: 'Xóa giao dịch thành công' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[deleteTransaction]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  } finally {
    client.release();
  }
}

// ── GET /transactions/summary ─────────────────────────────
async function getSummary(req, res) {
  const { month } = req.query; // "YYYY-MM"

  try {
    let dateFilter = '';
    const params = [req.userId];

    if (month) {
      dateFilter = `AND to_char(date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    const result = await pool.query(`
      SELECT
        type,
        SUM(amount) AS total,
        COUNT(*)    AS count
      FROM transactions
      WHERE user_id = $1 ${dateFilter}
      GROUP BY type
    `, params);

    const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    for (const row of result.rows) {
      if (row.type === 'income') {
        summary.income = parseFloat(row.total);
        summary.incomeCount = parseInt(row.count);
      } else {
        summary.expense = parseFloat(row.total);
        summary.expenseCount = parseInt(row.count);
      }
    }
    summary.balance = summary.income - summary.expense;

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('[getSummary]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── Helper ────────────────────────────────────────────────
function formatTransaction(row) {
  return {
    id: row.id,
    amount: parseFloat(row.amount),
    type: row.type,
    note: row.note,
    date: row.date,
    account: row.account_id,
    accountName: row.account_name,
    category: {
      id: row.category_id,
      name: row.category_name,
      icon: row.category_icon,
      color: row.category_color,
    },
  };
}

module.exports = { getTransactions, createTransaction, deleteTransaction, getSummary };
