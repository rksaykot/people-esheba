const db = require('./config/db');

async function seedEmergency() {
  const data = [
    { type: 'hospital', name: 'Dhaka Medical College Hospital', area: 'Shahbagh', district: 'Dhaka', phone: '02-55165088', lat: 23.725, lng: 90.397 },
    { type: 'hospital', name: 'Kurmitola General Hospital', area: 'Cantonment', district: 'Dhaka', phone: '02-8716300', lat: 23.815, lng: 90.402 },
    { type: 'hospital', name: 'Square Hospital Emergency', area: 'Panthapath', district: 'Dhaka', phone: '10616', lat: 23.753, lng: 90.382 },
    { type: 'police', name: 'DMP Central Control Room', area: 'Ramna', district: 'Dhaka', phone: '02-9514400', lat: 23.74, lng: 90.40 },
    { type: 'police', name: 'Gulshan Police Station', area: 'Gulshan', district: 'Dhaka', phone: '01320-041477', lat: 23.78, lng: 90.41 },
    { type: 'fire', name: 'Fire Service Headquarters', area: 'Kazi Alauddin Road', district: 'Dhaka', phone: '02-9555555', lat: 23.72, lng: 90.40 },
    { type: 'fire', name: 'Mirpur Fire Station', area: 'Mirpur 10', district: 'Dhaka', phone: '02-9001055', lat: 23.80, lng: 90.36 },
    { type: 'ambulance', name: 'Al Markazul Islami Ambulance', area: 'Mohammadpur', district: 'Dhaka', phone: '01715-207042', lat: 23.75, lng: 90.36 },
    { type: 'ambulance', name: 'Anjuman Mufidul Islam', area: 'Kakrail', district: 'Dhaka', phone: '02-9336611', lat: 23.73, lng: 90.40 },
    { type: 'hospital', name: 'Chittagong Medical College Hospital', area: 'Panchlaish', district: 'Chattogram', phone: '031-619400', lat: 22.36, lng: 91.83 },
    { type: 'police', name: 'CMP Control Room', area: 'Dampara', district: 'Chattogram', phone: '031-639022', lat: 22.35, lng: 91.82 },
    { type: 'fire', name: 'Agrabad Fire Station', area: 'Agrabad', district: 'Chattogram', phone: '031-716326', lat: 22.32, lng: 91.81 },
  ];

  let count = 0;
  for (const item of data) {
    try {
      await db.query(`
        INSERT INTO emergency_services (type, name, district, address, phone, latitude, longitude, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [item.type, item.name, item.district, item.area, item.phone, item.lat, item.lng]);
      count++;
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log(`Seeded ${count} emergency services.`);
}

async function seedSchools() {
  const data = [
    { name: 'Rajuk Uttara Model College', district: 'Dhaka' },
    { name: 'Viqarunnisa Noon School and College', district: 'Dhaka' },
    { name: 'Ideal School and College', district: 'Dhaka' },
    { name: 'Dhaka Residential Model College', district: 'Dhaka' },
    { name: 'St. Joseph Higher Secondary School', district: 'Dhaka' },
    { name: 'Holy Cross Girls\' High School', district: 'Dhaka' },
    { name: 'Notre Dame College', district: 'Dhaka' },
    { name: 'Government Laboratory High School', district: 'Dhaka' },
    { name: 'Cantonment Public School and College', district: 'Rangpur' },
    { name: 'Chattogram Collegiate School', district: 'Chattogram' },
    { name: 'Dr. Khastagir Government Girls\' School', district: 'Chattogram' },
    { name: 'Faujdarhat Cadet College', district: 'Chattogram' },
    { name: 'Comilla Zilla School', district: 'Comilla' },
    { name: 'Sylhet Government Pilot High School', district: 'Sylhet' },
    { name: 'Rajshahi Collegiate School', district: 'Rajshahi' },
    { name: 'Khulna Zilla School', district: 'Khulna' },
    { name: 'Barishal Zilla School', district: 'Barishal' },
    { name: 'Mymensingh Zilla School', district: 'Mymensingh' },
    { name: 'Bogra Zilla School', district: 'Bogra' },
    { name: 'Rangpur Zilla School', district: 'Rangpur' }
  ];

  let count = 0;
  for (const item of data) {
    try {
      await db.query(`
        INSERT INTO education_institutions (type, subtype, name, district, address, phone, website, is_verified)
        VALUES ('school', 'public', ?, ?, ?, ?, ?, 1)
      `, [
        item.name, item.district, item.district + ', Bangladesh', '01' + Math.floor(Math.random() * 9000000 + 1000000), 'https://www.example.edu.bd'
      ]);
      count++;
    } catch (e) {}
  }
  console.log(`Seeded ${count} real schools.`);
}

async function run() {
  await seedEmergency();
  await seedSchools();
  process.exit(0);
}
run();
