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

const types = [
  { subtype: 'nid', name: 'NID Registration Center', desc: 'Regional Election Office for NID services.' },
  { subtype: 'schemes', name: 'Social Service Office', desc: 'Allowances and government social schemes.' },
  { subtype: 'passport', name: 'Regional Passport Office', desc: 'E-Passport application and visa services.' },
  { subtype: 'land', name: 'AC Land Office', desc: 'Land mutation, records, and registration.' },
  { subtype: 'utility', name: 'Palli Bidyut Samity', desc: 'Electricity and utility services.' }
];

async function seed() {
  try {
    console.log('Seeding Government Services...');
    
    // First, verify admin exists
    const [[admin]] = await db.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    const adminId = admin ? admin.id : 1;

    let count = 0;
    
    // Clear old seeded government data if necessary, or just append
    // await db.query("DELETE FROM directory_listings WHERE category='government'");

    for (const district of districts) {
      for (const t of types) {
        const title = `${district} ${t.name}`;
        
        await db.query(
          `INSERT INTO directory_listings 
           (category, subtype, name, district, address, phone, website, description, created_by, is_verified) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'government',
            t.subtype,
            title,
            district,
            `Main Road, ${district} Sadar`,
            '16000',
            `https://${t.subtype}.${district.toLowerCase().replace(/[^a-z]/g, '')}.gov.bd`,
            t.desc,
            adminId,
            1
          ]
        );
        count++;
      }
    }

    console.log(`Successfully seeded ${count} Government services across all 64 districts!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed();
