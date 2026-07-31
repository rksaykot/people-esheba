const axios = require('axios');
const db = require('./src/config/db');

async function seedRealJobs() {
  try {
    console.log('Fetching real jobs from Remotive API...');
    const res = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=10');
    const jobs = res.data.jobs;
    
    let adminId = 1;
    const [adminCheck] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck && adminCheck.length > 0) adminId = adminCheck[0].id;
    
    // Optional: Clear out old dummy jobs so user only sees real ones? Let's just insert these at the top.
    
    let count = 0;
    for (const job of jobs) {
      // Avoid inserting duplicates
      const [existing] = await db.query("SELECT id FROM jobs WHERE external_link = ?", [job.url]);
      if (existing.length > 0) continue;

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      
      const desc = job.description.replace(/<[^>]+>/g, '').substring(0, 1000) + '...\n\n[Original Source]';
      
      await db.query(`
        INSERT INTO jobs (user_id, title, company, description, category, type, is_remote, deadline, status, external_link)
        VALUES (?, ?, ?, ?, 'tech', 'full-time', 1, ?, 'active', ?)
      `, [
        adminId, job.title, job.company_name, desc, deadline, job.url
      ]);
      count++;
    }
    
    console.log(`Successfully added ${count} real jobs with exact URLs!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding real jobs:', err.message);
    process.exit(1);
  }
}

seedRealJobs();
