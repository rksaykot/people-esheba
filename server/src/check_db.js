const db = require('./config/db');

async function check() {
  const tables = ['directory_listings', 'doctors', 'pharmacies', 'jobs', 'emergency_services'];
  for (const t of tables) {
    try {
      const [rows] = await db.query(`SELECT id, name FROM ${t} WHERE name LIKE '%#%' LIMIT 2`);
      if (rows.length) console.log(t, rows);
    } catch(e) {
       try {
         const [rows] = await db.query(`SELECT id, title as name FROM ${t} WHERE title LIKE '%#%' LIMIT 2`);
         if (rows.length) console.log(t, rows);
       } catch (err) {}
    }
  }
  process.exit(0);
}
check();
