const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '..', 'apps', 'api', 'node_modules', 'pg'));

function getDbUrl() {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      let val = trimmed.substring('DATABASE_URL='.length).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return val;
    }
  }
  return null;
}

async function main() {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261001000010_visual_grid_builder.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await client.query(sql);
  console.log('Successfully applied migration 20261001000010_visual_grid_builder.sql!');

  const check = await client.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name IN ('schema_version', 'rows');
  `);
  console.log('Verified columns in pages table:', check.rows);

  const sample = await client.query(`
    SELECT slug, schema_version, jsonb_typeof(rows) as rows_type, jsonb_array_length(rows) as rows_count 
    FROM public.pages 
    LIMIT 5;
  `);
  console.log('Sample pages after migration:', sample.rows);

  await client.end();
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
