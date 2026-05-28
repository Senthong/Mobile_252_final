const pool = require('./pool');

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Bắt đầu migration...');

    await client.query('BEGIN');

    // ── Users ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        phone       VARCHAR(20),
        dob         DATE,
        password    VARCHAR(255) NOT NULL,
        avatar      TEXT,
        tier        VARCHAR(50) DEFAULT 'THÀNH VIÊN',
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Categories ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          VARCHAR(50) PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        icon        VARCHAR(10) NOT NULL,
        color       VARCHAR(20) NOT NULL,
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        is_default  BOOLEAN DEFAULT false,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Accounts ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        VARCHAR(100) NOT NULL,
        balance     NUMERIC(15, 2) DEFAULT 0,
        type        VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet')),
        currency    VARCHAR(10) DEFAULT 'VND',
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Transactions ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        category_id   VARCHAR(50) NOT NULL REFERENCES categories(id),
        amount        NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        type          VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        note          TEXT,
        date          TIMESTAMPTZ DEFAULT NOW(),
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Budgets ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id   VARCHAR(50) NOT NULL REFERENCES categories(id),
        limit_amount  NUMERIC(15, 2) NOT NULL,
        month         VARCHAR(7) NOT NULL,  -- "YYYY-MM"
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, category_id, month)
      );
    `);

    // ── Indexes ────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id  ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id      ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_month    ON budgets(user_id, month);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration hoàn tất!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
