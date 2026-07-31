const db = require('./src/config/db');
async function fix() {
  await db.query("UPDATE directory_listings SET subtype = 'govt-hospital' WHERE category = 'hospital' AND subtype = 'public'");
  await db.query("UPDATE directory_listings SET subtype = 'private-hospital' WHERE category = 'hospital' AND subtype = 'private'");
  console.log("Updated subtypes");
  process.exit(0);
}
fix();
