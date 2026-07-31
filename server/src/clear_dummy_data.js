const db = require('./config/db');

async function clearData() {
  const tables = [
    'directory_listings', 
    'doctors', 
    'pharmacies', 
    'jobs', 
    'emergency_services', 
    'education_institutions', 
    'blood_donors', 
    'scholarships'
  ];
  
  for (let t of tables) {
    try {
      const [result] = await db.query(`DELETE FROM ${t}`);
      console.log(`Cleared ${t}: ${result.affectedRows} rows deleted.`);
    } catch (e) {
      console.error(`Error clearing ${t}:`, e.message);
    }
  }
  process.exit(0);
}

clearData();
