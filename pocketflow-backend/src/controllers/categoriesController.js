const pool = require('../db/pool');

// ── GET /categories ───────────────────────────────────────
// Trả về default categories + categories riêng của user
async function getCategories(req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM categories
      WHERE is_default = true OR user_id = $1
      ORDER BY is_default DESC, name ASC
    `, [req.userId]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getCategories]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { getCategories };
