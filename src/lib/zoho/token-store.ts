import { Pool } from "pg";

// Small key value store for integration secrets (the Zoho refresh token lives here).
// It uses its own table so no Prisma migration is needed. The table is created on first use.

let pool: Pool | null = null;
let tableReady = false;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL not set");
  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 2 });
  return pool;
}

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS integration_tokens (
      name TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableReady = true;
}

export async function storeToken(name: string, token: string): Promise<void> {
  await ensureTable();
  await getPool().query(
    `INSERT INTO integration_tokens (name, token) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET token = $2, updated_at = NOW()`,
    [name, token],
  );
}

export async function retrieveToken(name: string): Promise<string | null> {
  try {
    await ensureTable();
    const result = await getPool().query("SELECT token FROM integration_tokens WHERE name = $1", [name]);
    return result.rows[0]?.token ?? null;
  } catch {
    return null;
  }
}