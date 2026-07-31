const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./config/db');

const districts = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Chuadanga', 
  'Comilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 
  'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 
  'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 
  'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 
  'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 
  'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

function getRandomPhone() {
  const prefixes = ['017', '018', '019', '015', '016', '013', '014'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000 + 10000000);
  return `${prefix}${number}`;
}

async function scrapeMinistries() {
  console.log('[Wiki Scraper] Fetching Government Ministries...');
  try {
    const res = await axios.get('https://en.wikipedia.org/wiki/Cabinet_of_Bangladesh', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(res.data);
    const ministries = [];
    
    // There are tables for the council of ministers. Let's just extract text containing 'Ministry of'
    $('td, th, a, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text.startsWith('Ministry of ') && text.length < 100 && !ministries.includes(text)) {
        ministries.push(text);
      }
    });

    // Also a fixed list if Wikipedia fails or structure is weird
    const fallbackMinistries = [
      'Ministry of Agriculture', 'Ministry of Civil Aviation and Tourism', 'Ministry of Commerce', 
      'Ministry of Defense', 'Ministry of Education', 'Ministry of Finance', 'Ministry of Foreign Affairs',
      'Ministry of Health and Family Welfare', 'Ministry of Home Affairs', 'Ministry of Information and Broadcasting',
      'Ministry of Law, Justice and Parliamentary Affairs', 'Ministry of Public Administration'
    ];

    const targetMinistries = ministries.length > 5 ? ministries : fallbackMinistries;

    console.log(`[Wiki Scraper] Found ${targetMinistries.length} ministries. Inserting...`);
    let count = 0;
    for (const m of targetMinistries) {
      try {
        await db.query(`
          INSERT INTO directory_listings (category, subtype, name, description, district, address, phone, is_verified, rating)
          VALUES ('government', 'ministry', ?, ?, 'Dhaka', 'Bangladesh Secretariat, Dhaka', ?, 1, ?)
        `, [
          m, `${m}, Government of the People's Republic of Bangladesh.`, getRandomPhone(), (Math.random() * 1.0 + 4.0).toFixed(1)
        ]);
        count++;
      } catch (err) {}
    }
    console.log(`[Wiki Scraper] Added ${count} government services.`);
  } catch (err) {
    console.error(err.message);
  }
}

async function scrapeBanks() {
  console.log('[Wiki Scraper] Fetching Banks (Financial Services)...');
  try {
    const res = await axios.get('https://en.wikipedia.org/wiki/List_of_banks_in_Bangladesh', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(res.data);
    const banks = [];
    
    $('div.mw-parser-output ul li').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Bank') && text.length > 5 && text.length < 50 && !text.includes('Wikipedia')) {
        let name = text.replace(/\[\d+\]/g, '').trim();
        if (!banks.includes(name)) banks.push(name);
      }
    });

    console.log(`[Wiki Scraper] Found ${banks.length} banks. Inserting...`);
    let count = 0;
    for (const b of banks) {
      // Add branches for top districts
      const branchDistricts = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'];
      for (const d of branchDistricts) {
        try {
          await db.query(`
            INSERT INTO directory_listings (category, subtype, name, description, district, address, phone, is_verified, rating)
            VALUES ('finance', 'bank', ?, ?, ?, ?, ?, 1, ?)
          `, [
            `${b} - ${d} Branch`, `Branch of ${b} located in ${d}`, d, `Main Road, ${d}`, getRandomPhone(), (Math.random() * 1.5 + 3.5).toFixed(1)
          ]);
          count++;
        } catch (err) {}
      }
    }
    console.log(`[Wiki Scraper] Added ${count} bank branches.`);
  } catch (err) {
    console.error(err.message);
  }
}

async function generateDoctors() {
  console.log('[Generator] Generating Doctors...');
  let count = 0;
  const specialties = ['Medicine', 'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Gynaecology', 'Dermatology', 'Psychiatry'];
  const firstNames = ['Abdul', 'Syed', 'Mohammad', 'Kamrul', 'Tariqul', 'Nazmul', 'Sharmin', 'Nusrat', 'Sadia', 'Farhana'];
  const lastNames = ['Rahman', 'Islam', 'Hasan', 'Ahmed', 'Chowdhury', 'Khan', 'Hossain', 'Akter', 'Begum'];

  for (const district of districts) {
    for (let i = 0; i < 5; i++) { // 5 doctors per district
      const name = `Dr. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      try {
        await db.query(`
          INSERT INTO doctors (name, specialty, area, district, phone, rating, is_verified)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [
          name, specialty, `Sadar Hospital Area, ${district}`, district, getRandomPhone(), (Math.random() * 1.0 + 4.0).toFixed(1)
        ]);
        count++;
      } catch (err) {}
    }
  }
  console.log(`[Generator] Added ${count} doctors.`);
}

async function generatePharmacies() {
  console.log('[Generator] Generating Pharmacies...');
  let count = 0;
  const prefixes = ['Maa', 'Bismillah', 'Al-Madina', 'Care', 'Health', 'Life', 'National', 'Sadar'];
  
  for (const district of districts) {
    for (let i = 0; i < 4; i++) {
      const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} Pharmacy`;
      const is_24h = Math.random() > 0.7 ? 1 : 0;
      
      try {
        await db.query(`
          INSERT INTO pharmacies (name, area, district, type, phone, is_24h, is_verified)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [
          name, `Hospital Road, ${district}`, district, 'retail', getRandomPhone(), is_24h
        ]);
        count++;
      } catch (err) {}
    }
  }
  console.log(`[Generator] Added ${count} pharmacies.`);
}

async function generateJobs() {
  console.log('[Generator] Generating Jobs...');
  let count = 0;
  const jobTitles = ['Software Engineer', 'Bank Officer', 'Marketing Executive', 'Medical Officer', 'Data Analyst', 'Teacher', 'Project Manager', 'Customer Support'];
  const companies = ['Tech BD', 'Grameenphone', 'BRAC Bank', 'Square Hospital', 'Daraz BD', 'Govt of Bangladesh', 'Save the Children', 'Pathao'];
  
  // We need a dummy user_id for the foreign key. We know Admin exists with id 1 usually.
  let adminId = 1;
  const [adminCheck] = await db.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  if (adminCheck && adminCheck.length > 0) {
    adminId = adminCheck[0].id;
  } else {
    // fallback to first user
    const [userCheck] = await db.query('SELECT id FROM users LIMIT 1');
    if (userCheck && userCheck.length > 0) adminId = userCheck[0].id;
  }

  for (let i = 0; i < 50; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const type = ['full-time', 'part-time', 'freelance', 'internship', 'govt'][Math.floor(Math.random() * 5)];
    const category = ['tech', 'finance', 'health', 'education', 'ngo'][Math.floor(Math.random() * 5)];
    
    // Future deadline
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 30 + 10)); 

    try {
      await db.query(`
        INSERT INTO jobs (user_id, title, company, description, requirements, category, type, salary_min, salary_max, division, district, is_remote, deadline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        adminId, title, company, `We are looking for a highly motivated ${title} to join ${company} in ${district}.`, `Minimum 2 years of experience in related field. Bachelor's degree required.`, category, type, 20000, 80000, 'Dhaka', district, Math.random() > 0.8 ? 1 : 0, deadline
      ]);
      count++;
    } catch (err) {
      // if adminId 1 doesn't exist, it'll fail, so we skip
    }
  }
  console.log(`[Generator] Added ${count} jobs.`);
}

async function generateNotices() {
  console.log('[Generator] Generating Notices...');
  let count = 0;
  const categories = ['academic', 'career', 'scholarship', 'government', 'donate', 'general'];
  const sources = ['Ministry of Education', 'Bangladesh Public Service Commission', 'UGC Bangladesh', 'Directorate General of Health Services', 'Dhaka University'];
  
  for (let i = 0; i < 30; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const isUrgent = Math.random() > 0.8 ? 1 : 0;
    
    try {
      await db.query(`
        INSERT INTO notices (title, category, source, link, description, is_urgent, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [
        `Important Update regarding ${category} - ${source}`, category, source, 'https://example.com/notice', `This is an official notice issued by ${source}. Please read the attached document for full details and deadline information.`, isUrgent
      ]);
      count++;
    } catch (err) {}
  }
  console.log(`[Generator] Added ${count} notices.`);
}

async function generateScholarships() {
  console.log('[Generator] Generating Scholarships...');
  let count = 0;
  const categories = ['undergraduate', 'postgraduate', 'phd', 'general'];
  const providers = ['Ministry of Education', 'UGC Bangladesh', 'ICT Division', 'Prime Minister Education Trust', 'Australian Government'];
  
  for (let i = 0; i < 20; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const amount = ['Full Tuition', 'BDT 50,000/year', 'Stipend + Tuition', 'BDT 20,000 one-time'][Math.floor(Math.random() * 4)];
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 60 + 15));
    
    try {
      await db.query(`
        INSERT INTO scholarships (title, provider, deadline, amount, link, description, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        `${provider} ${category.toUpperCase()} Scholarship 2026`, provider, deadline, amount, 'https://example.com/scholarship', `Apply for the prestigious scholarship offered by ${provider}. Eligible candidates will receive ${amount}.`, category
      ]);
      count++;
    } catch (err) {}
  }
  console.log(`[Generator] Added ${count} scholarships.`);
}

async function generateBloodDonors() {
  console.log('[Generator] Generating Blood Donors...');
  let count = 0;
  
  // We need to insert fake users first so they can be blood donors
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  for (let i = 0; i < 100; i++) {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const bg = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
    
    try {
      // 1. Create a fake user
      const [userRes] = await db.query(`
        INSERT INTO users (name, email, phone, password_hash, role, division, district, is_verified)
        VALUES (?, ?, ?, ?, 'user', 'Dhaka', ?, 1)
      `, [
        `Donor ${i}`, `donor${i}@example.com`, getRandomPhone(), '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2pHKPAlMy2', district
      ]);
      const userId = userRes.insertId;

      // 2. Add blood donor profile
      await db.query(`
        INSERT INTO blood_donors (user_id, blood_group, is_available, district, total_donations, status)
        VALUES (?, ?, 1, ?, ?, 'approved')
      `, [
        userId, bg, district, Math.floor(Math.random() * 5)
      ]);
      count++;
    } catch (err) {
      // Duplicate email etc.
    }
  }
  console.log(`[Generator] Added ${count} blood donors.`);
}


async function runAll() {
  console.log('--- Starting Comprehensive Data Population ---');
  await scrapeMinistries();
  await scrapeBanks();
  await generateDoctors();
  await generatePharmacies();
  await generateJobs();
  await generateNotices();
  await generateScholarships();
  await generateBloodDonors();
  
  console.log('--- Finished Comprehensive Data Population ---');
  process.exit(0);
}

runAll();
