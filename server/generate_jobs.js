const db = require('./src/config/db');

async function run() {
  const districts = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi'];
  const jobTitles = ['Software Engineer', 'Bank Officer', 'Marketing Executive', 'Medical Officer'];
  const companies = ['Tech BD', 'Grameenphone', 'BRAC Bank', 'Square Hospital'];
  
  let adminId = 1;
  const [adminCheck] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (adminCheck && adminCheck.length > 0) {
    adminId = adminCheck[0].id;
  } else {
    const [userCheck] = await db.query('SELECT id FROM users LIMIT 1');
    if (userCheck && userCheck.length > 0) adminId = userCheck[0].id;
  }

  let count = 0;
  for (let i = 0; i < 20; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const type = ['full-time', 'part-time', 'freelance', 'internship', 'govt'][Math.floor(Math.random() * 5)];
    const category = ['tech', 'finance', 'health', 'education', 'ngo'][Math.floor(Math.random() * 5)];
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15); 

    try {
      await db.query(`
        INSERT INTO jobs (user_id, title, company, description, requirements, category, type, salary_min, salary_max, division, district, is_remote, deadline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        adminId, title, company, `We are looking for a highly motivated ${title} to join ${company} in ${district}.`, 'Requirements here', category, type, 20000, 80000, 'Dhaka', district, 0, deadline
      ]);
      count++;
    } catch(e) { console.error(e.message); }
  }
  console.log('Added ' + count + ' jobs.');
  process.exit(0);
}
run();
