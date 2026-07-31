const db = require('./config/db');
const { runScrapers } = require('./services/scraperService');

async function run() {
  try {
    console.log('Clearing all notices...');
    const [result] = await db.query("DELETE FROM notices");
    console.log('Deleted notices:', result.affectedRows);
    
    console.log('Running scraper to fetch and translate real notices...');
    const count = await runScrapers();
    console.log('Scraper finished. New translated notices added:', count);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
