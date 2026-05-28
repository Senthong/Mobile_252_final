const pool = require('../db/pool');

// ── GET /budgets?month=YYYY-MM ────────────────────────────
async function getBudgets(req, res) {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.category_id,
        b.limit_amount,
        b.month,
        c.name  AS category_name,
        c.icon  AS category_icon,
        c.color AS category_color,
        COALESCE(
          (SELECT SUM(amount)
           FROM transactions t
           WHERE t.user_id = b.user_id
             AND t.category_id = b.category_id
             AND t.type = 'expense'
             AND to_char(t.date, 'YYYY-MM') = b.month
          ), 0
        ) AS spent
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      WHERE b.user_id = $1 AND b.month = $2
      ORDER BY c.name
    `, [req.userId, month]);

    res.json({
      success: true,
      data: result.rows.map(b => ({
        id: b.id,
        categoryId: b.category_id,
        limit: parseFloat(b.limit_amount),
        spent: parseFloat(b.spent),
        month: b.month,
        category: {
          id: b.category_id,
          name: b.category_name,
          icon: b.category_icon,
          color: b.category_color,
        },
      })),
    });
  } catch (err) {
    console.error('[getBudgets]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── POST /budgets ─────────────────────────────────────────
async function upsertBudget(req, res) {
  const { category_id, limit_amount, month } = req.body;

  if (!category_id || !limit_amount || !month) {
    return res.status(400).json({ success: false, message: 'Thiếu category_id, limit_amount hoặc month' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO budgets (user_id, category_id, limit_amount, month)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category_id, month)
      DO UPDATE SET limit_amount = EXCLUDED.limit_amount
      RETURNING *
    `, [req.userId, category_id, parseFloat(limit_amount), month]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[upsertBudget]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── DELETE /budgets/:id ───────────────────────────────────
async function deleteBudget(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ngân sách không tồn tại' });
    }
    res.json({ success: true, message: 'Xóa ngân sách thành công' });
  } catch (err) {
    console.error('[deleteBudget]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { getBudgets, upsertBudget, deleteBudget };
