const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:../../packages/database/sqlite.db' });

async function run() {
  const rs = await client.execute('SELECT id, timestamp FROM trades ORDER BY id DESC LIMIT 5');
  console.log(rs.rows);
}
run();
