const db = require('./src/config/db');
db.query("UPDATE jobs SET external_link = 'https://jobs.bdjobs.com/'").then(() => {
  console.log('Updated 5 jobs');
  process.exit(0);
});
