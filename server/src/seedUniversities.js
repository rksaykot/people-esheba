const db = require('./config/db');

async function seedUniversities() {
  // Delete existing universities
  await db.query('DELETE FROM education_institutions WHERE type = ?', ['university']);
  console.log('Deleted existing universities.');

  const universities = [
    // Top 10 Public Universities
    { subtype: 'public', name: 'University of Dhaka', district: 'Dhaka', acronym: 'du.ac.bd' },
    { subtype: 'public', name: 'Bangladesh University of Engineering and Technology', district: 'Dhaka', acronym: 'buet.ac.bd' },
    { subtype: 'public', name: 'Jahangirnagar University', district: 'Savar, Dhaka', acronym: 'juniv.edu' },
    { subtype: 'public', name: 'University of Rajshahi', district: 'Rajshahi', acronym: 'ru.ac.bd' },
    { subtype: 'public', name: 'University of Chittagong', district: 'Chattogram', acronym: 'cu.ac.bd' },
    { subtype: 'public', name: 'Shahjalal University of Science and Technology', district: 'Sylhet', acronym: 'sust.edu' },
    { subtype: 'public', name: 'Khulna University', district: 'Khulna', acronym: 'ku.ac.bd' },
    { subtype: 'public', name: 'Bangladesh Agricultural University', district: 'Mymensingh', acronym: 'bau.edu.bd' },
    { subtype: 'public', name: 'Jagannath University', district: 'Dhaka', acronym: 'jnu.ac.bd' },
    { subtype: 'public', name: 'Comilla University', district: 'Comilla', acronym: 'cou.ac.bd' },

    // Top 10 Private Universities
    { subtype: 'private', name: 'North South University', district: 'Dhaka', acronym: 'northsouth.edu' },
    { subtype: 'private', name: 'BRAC University', district: 'Dhaka', acronym: 'bracu.ac.bd' },
    { subtype: 'private', name: 'Independent University, Bangladesh', district: 'Dhaka', acronym: 'iub.edu.bd' },
    { subtype: 'private', name: 'East West University', district: 'Dhaka', acronym: 'ewubd.edu' },
    { subtype: 'private', name: 'Ahsanullah University of Science and Technology', district: 'Dhaka', acronym: 'aust.edu' },
    { subtype: 'private', name: 'American International University-Bangladesh', district: 'Dhaka', acronym: 'aiub.edu' },
    { subtype: 'private', name: 'Daffodil International University', district: 'Dhaka', acronym: 'daffodilvarsity.edu.bd' },
    { subtype: 'private', name: 'United International University', district: 'Dhaka', acronym: 'uiu.ac.bd' },
    { subtype: 'private', name: 'University of Liberal Arts Bangladesh', district: 'Dhaka', acronym: 'ulab.edu.bd' },
    { subtype: 'private', name: 'Stamford University Bangladesh', district: 'Dhaka', acronym: 'stamforduniversity.edu.bd' }
  ];

  let count = 0;
  for (const u of universities) {
    try {
      await db.query(`
        INSERT INTO education_institutions (type, subtype, name, district, address, phone, website, is_verified)
        VALUES ('university', ?, ?, ?, ?, ?, ?, 1)
      `, [
        u.subtype, 
        u.name, 
        u.district, 
        u.district + ', Bangladesh', 
        '02-' + Math.floor(Math.random() * 9000000 + 1000000), 
        'https://www.' + u.acronym
      ]);
      count++;
    } catch (err) {
      console.error('Error inserting:', u.name, err.message);
    }
  }
  console.log(`Seeded ${count} real universities.`);
  process.exit(0);
}

seedUniversities();
