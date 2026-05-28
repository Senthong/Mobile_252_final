const pool = require('./pool');

const DEFAULT_CATEGORIES = [
  { id: 'food',          name: 'Ăn uống',    icon: '🍜', color: '#FF6B6B' },
  { id: 'transport',     name: 'Di chuyển',  icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping',      name: 'Mua sắm',    icon: '🛍️', color: '#45B7D1' },
  { id: 'housing',       name: 'Nhà cửa',    icon: '🏠', color: '#96CEB4' },
  { id: 'health',        name: 'Sức khỏe',   icon: '❤️', color: '#FFEAA7' },
  { id: 'entertainment', name: 'Giải trí',   icon: '🎮', color: '#DDA0DD' },
  { id: 'salary',        name: 'Lương',      icon: '💰', color: '#98FB98' },
  { id: 'other',         name: 'Khác',       icon: '📦', color: '#B0C4DE' },
];

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Bắt đầu seed dữ liệu...');

    // Thêm default categories (is_default = true, không gắn user)
    for (const cat of DEFAULT_CATEGORIES) {
      await client.query(`
        INSERT INTO categories (id, name, icon, color, is_default)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id) DO NOTHING
      `, [cat.id, cat.name, cat.icon, cat.color]);
    }

    console.log(`✅ Đã seed ${DEFAULT_CATEGORIES.length} categories mặc định`);
  } catch (err) {
    console.error('❌ Seed thất bại:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
