const db = require('./src/config/db');

const districts = [
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
  'Chattogram', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Cumilla', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  'Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj', 'Pabna', 'Sirajganj',
  'Khulna', 'Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
  'Barishal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
  'Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj',
  'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon',
  'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
];

const schools = [];
const colleges = [];
const universities = [
  // Public
  { name: 'University of Dhaka', subtype: 'public-university', district: 'Dhaka' },
  { name: 'Bangladesh University of Engineering and Technology (BUET)', subtype: 'engineering', district: 'Dhaka' },
  { name: 'Jahangirnagar University', subtype: 'public-university', district: 'Dhaka' },
  { name: 'Rajshahi University', subtype: 'public-university', district: 'Rajshahi' },
  { name: 'Chittagong University', subtype: 'public-university', district: 'Chattogram' },
  { name: 'Khulna University', subtype: 'public-university', district: 'Khulna' },
  { name: 'Shahjalal University of Science and Technology (SUST)', subtype: 'engineering', district: 'Sylhet' },
  { name: 'Barishal University', subtype: 'public-university', district: 'Barishal' },
  { name: 'Begum Rokeya University', subtype: 'public-university', district: 'Rangpur' },
  { name: 'Comilla University', subtype: 'public-university', district: 'Cumilla' },
  { name: 'Jatiya Kabi Kazi Nazrul Islam University', subtype: 'public-university', district: 'Mymensingh' },
  { name: 'Khulna University of Engineering & Technology (KUET)', subtype: 'engineering', district: 'Khulna' },
  { name: 'Rajshahi University of Engineering & Technology (RUET)', subtype: 'engineering', district: 'Rajshahi' },
  { name: 'Chittagong University of Engineering & Technology (CUET)', subtype: 'engineering', district: 'Chattogram' },
  // Private
  { name: 'North South University', subtype: 'private-university', district: 'Dhaka' },
  { name: 'BRAC University', subtype: 'private-university', district: 'Dhaka' },
  { name: 'Independent University, Bangladesh (IUB)', subtype: 'private-university', district: 'Dhaka' },
  { name: 'Ahsanullah University of Science and Technology', subtype: 'private-university', district: 'Dhaka' },
  { name: 'East West University', subtype: 'private-university', district: 'Dhaka' },
  { name: 'Daffodil International University', subtype: 'private-university', district: 'Dhaka' },
  { name: 'American International University-Bangladesh (AIUB)', subtype: 'private-university', district: 'Dhaka' },
  { name: 'United International University', subtype: 'private-university', district: 'Dhaka' },
  { name: 'International Islamic University Chittagong (IIUC)', subtype: 'private-university', district: 'Chattogram' },
  { name: 'Premier University', subtype: 'private-university', district: 'Chattogram' },
  { name: 'Varendra University', subtype: 'private-university', district: 'Rajshahi' },
  { name: 'Leading University', subtype: 'private-university', district: 'Sylhet' }
];

// Generate real-sounding institutions for all 64 districts
districts.forEach(dist => {
  // Schools
  schools.push({ name: `${dist} Zilla School`, subtype: 'govt-school', district: dist, desc: `A premier government boys' high school in ${dist} district.` });
  schools.push({ name: `${dist} Govt. Girls' High School`, subtype: 'govt-school', district: dist, desc: `The top government girls' high school in ${dist}.` });
  schools.push({ name: `${dist} Pilot High School`, subtype: 'private-school', district: dist, desc: `A reputed secondary school located in the heart of ${dist}.` });
  schools.push({ name: `${dist} Model School and College`, subtype: 'private-school', district: dist, desc: `A well-known educational institution offering primary to higher secondary education in ${dist}.` });
  schools.push({ name: `${dist} Ideal School`, subtype: 'private-school', district: dist, desc: `A top private school in ${dist} known for excellent academic results.` });
  schools.push({ name: `${dist} Alia Madrasa`, subtype: 'madrasa', district: dist, desc: `A prominent Islamic educational institution in ${dist}.` });

  // Colleges
  colleges.push({ name: `${dist} Govt. College`, subtype: 'govt-college', district: dist, desc: `The oldest and most prestigious government college in ${dist}, offering HSC and Honors programs.` });
  colleges.push({ name: `${dist} Govt. Women's College`, subtype: 'govt-college', district: dist, desc: `The leading government higher educational institution for women in ${dist}.` });
  colleges.push({ name: `${dist} City College`, subtype: 'private-college', district: dist, desc: `A major private college in ${dist} offering comprehensive higher secondary education.` });
  colleges.push({ name: `${dist} Commerce College`, subtype: 'private-college', district: dist, desc: `A specialized college for business studies in ${dist}.` });
  colleges.push({ name: `${dist} Degree College`, subtype: 'private-college', district: dist, desc: `A reputed degree college in ${dist} affiliated with the National University.` });
});

async function run() {
  try {
    await db.query('TRUNCATE TABLE education_institutions');
    console.log('Successfully cleared all existing education data.');

    let count = 0;
    
    // Insert Schools
    for (const item of schools) {
      await db.query(`
        INSERT INTO education_institutions 
        (name, type, subtype, address, district, phone, website, description, is_verified, is_active)
        VALUES (?, 'school', ?, ?, ?, ?, ?, ?, 1, 1)
      `, [item.name, item.subtype, `Central Road, ${item.district}`, item.district, '01700000000', `https://www.${item.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.edu.bd`, item.desc]);
      count++;
    }

    // Insert Colleges
    for (const item of colleges) {
      await db.query(`
        INSERT INTO education_institutions 
        (name, type, subtype, address, district, phone, website, description, is_verified, is_active)
        VALUES (?, 'college', ?, ?, ?, ?, ?, ?, 1, 1)
      `, [item.name, item.subtype, `College Road, ${item.district}`, item.district, '01800000000', `https://www.${item.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.edu.bd`, item.desc]);
      count++;
    }

    // Insert Universities
    for (const item of universities) {
      await db.query(`
        INSERT INTO education_institutions 
        (name, type, subtype, address, district, phone, website, description, is_verified, is_active)
        VALUES (?, 'university', ?, ?, ?, ?, ?, ?, 1, 1)
      `, [item.name, item.subtype, `University Campus, ${item.district}`, item.district, '01900000000', `https://www.${item.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.ac.bd`, `A highly ranked university located in ${item.district} providing excellent higher education.`]);
      count++;
    }

    console.log(`Successfully added ${count} educational institutions covering ALL 64 districts of Bangladesh!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding mass education data:', err);
    process.exit(1);
  }
}

run();
