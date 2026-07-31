const db = require('./src/config/db');
db.query("DELETE FROM notices WHERE title LIKE 'Important Update regarding%'").then(() => {
  console.log('Cleaned dummy notices');
  process.exit(0);
});
