const db = require('./src/config/db');
db.query("DELETE FROM jobs WHERE external_link = 'https://jobs.bdjobs.com/'").then(() => {
  console.log('Cleaned dummy jobs');
  process.exit(0);
});
