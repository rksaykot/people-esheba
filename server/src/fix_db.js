const db = require('./config/db');

async function fix() {
  try {
    const [result] = await db.query("UPDATE directory_listings SET name = TRIM(SUBSTRING_INDEX(name, '#', 1)) WHERE name LIKE '%#%'");
    console.log('Updated directory_listings:', result.affectedRows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fix();
