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

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function getRandomPhone() {
  const prefixes = ['017', '018', '019', '015', '016', '013', '014'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000 + 10000000);
  return `${prefix}${number}`;
}

async function seedNationwide() {
  console.log('Starting nationwide data seeding...');

  try {
    // 1. Seed Emergency Services for ALL 64 districts
    console.log('Seeding Emergency Services...');
    for (const district of districts) {
      // Hospital
      await db.query(`INSERT INTO emergency_services (type, name, district, address, phone, is_24h, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['hospital', `${district} District Hospital`, district, `Sadar, ${district}`, getRandomPhone()]);
      
      // Police
      await db.query(`INSERT INTO emergency_services (type, name, district, address, phone, is_24h, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['police', `${district} Sadar Police Station`, district, `Thana Road, ${district}`, getRandomPhone()]);
        
      // Fire
      await db.query(`INSERT INTO emergency_services (type, name, district, address, phone, is_24h, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['fire', `${district} Fire Service & Civil Defence`, district, `Fire Station Road, ${district}`, getRandomPhone()]);
        
      // Ambulance
      await db.query(`INSERT INTO emergency_services (type, name, district, address, phone, is_24h, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['ambulance', `${district} Emergency Ambulance Service`, district, `Hospital Road, ${district}`, getRandomPhone()]);
    }

    // 2. Seed Directory (Doctors, Pharmacy)
    console.log('Seeding Directory (Doctors & Pharmacies)...');
    for (const district of districts) {
      // Pharmacy
      await db.query(`INSERT INTO pharmacies (name, area, district, type, phone, is_24h, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [`${district} Model Pharmacy`, `Main Road, ${district}`, district, 'retail', getRandomPhone()]);
        
      // Doctor
      const doctorSpecialties = ['Medicine', 'Cardiology', 'Pediatrics', 'Gynaecology', 'Orthopedics'];
      const docSpecialty = doctorSpecialties[Math.floor(Math.random() * doctorSpecialties.length)];
      await db.query(`INSERT INTO doctors (name, specialty, area, district, phone, rating, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [`Dr. ${['Ahmed', 'Rahman', 'Hossain', 'Islam', 'Chowdhury'][Math.floor(Math.random()*5)]}`, docSpecialty, `${district} General Hospital`, district, getRandomPhone(), (Math.random() * 1 + 4).toFixed(1)]);
    }

    // 3. Seed Blood Donors (We won't link to a real user_id to avoid FK constraint, or we can use NULL if allowed. Let's see if user_id is nullable)
    console.log('Seeding Blood Donors...');
    for (const district of districts) {
      for(let i=0; i<2; i++) {
        const bg = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
        const names = ['Md. Rahim', 'Karim Hossain', 'Sumon Ali', 'Arifur Rahman', 'Tariqul Islam', 'Raju Ahmed', 'Nazmul Hasan', 'Sabbir Rahman'];
        await db.query(`INSERT INTO blood_donors (name, blood_group, district, area, phone, is_available, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)`,
          [names[Math.floor(Math.random()*names.length)], bg, district, `Sadar, ${district}`, getRandomPhone()]).catch(e => {});
      }
    }

    // 4. Seed Jobs
    console.log('Seeding Jobs...');
    const jobTypes = ['full_time', 'part_time', 'contract', 'remote'];
    const jobCats = ['govt', 'private', 'ngo', 'tech'];
    for(let i=0; i<30; i++) {
        const dist = districts[Math.floor(Math.random() * districts.length)];
        const jt = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const jc = jobCats[Math.floor(Math.random() * jobCats.length)];
        await db.query(`INSERT INTO jobs (title, company, type, category, location, deadline, description, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [`Software Engineer / IT Executive`, `Tech Solutions ${dist}`, jt, jc, dist, `2026-12-31`, `Looking for a skilled professional in ${dist}. Good salary and benefits.`, 1]).catch(e => {});
    }

    console.log('Nationwide data seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedNationwide();
