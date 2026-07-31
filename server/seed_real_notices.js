const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./src/config/db');

async function seedRealNotices() {
  try {
    console.log('Fetching real notices from BPSC...');
    const res = await axios.get('http://bpsc.gov.bd/site/view/notices', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(res.data);
    
    let adminId = 1;
    const [adminCheck] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck && adminCheck.length > 0) adminId = adminCheck[0].id;
    
    let count = 0;
    const notices = [];
    
    $('table tbody tr').each((i, el) => {
      if (i === 0) return; // Header
      const title = $(el).find('td').eq(1).text().trim();
      let link = $(el).find('td a').attr('href');
      const dateStr = $(el).find('td').eq(2).text().trim(); // Might be date
      
      if (title && link) {
        if (!link.startsWith('http')) link = 'http://bpsc.gov.bd' + link;
        notices.push({ title, link, dateStr });
      }
    });

    console.log(`Found ${notices.length} notices on BPSC. Inserting...`);
    
    for (const notice of notices.slice(0, 30)) { // Top 30 notices
      const [existing] = await db.query("SELECT id FROM notices WHERE link = ?", [notice.link]);
      if (existing.length > 0) continue;

      await db.query(`
        INSERT INTO notices (title, description, category, source, link, status, is_urgent, created_by)
        VALUES (?, ?, 'government', 'Bangladesh Public Service Commission (BPSC)', ?, 'published', 0, ?)
      `, [
        notice.title, 
        'Official government notice from Bangladesh Public Service Commission. Click "View Details" to view or download the original notice document.',
        notice.link,
        adminId
      ]);
      count++;
    }
    
    console.log(`Successfully added ${count} real notices!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding real notices:', err.message);
    process.exit(1);
  }
}

seedRealNotices();
