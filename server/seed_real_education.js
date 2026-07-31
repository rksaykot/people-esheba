const db = require('./src/config/db');

const realInstitutes = [
  // SCHOOLS
  {
    name: 'Dhaka Residential Model College',
    name_bn: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
    type: 'school',
    subtype: 'govt-school',
    address: 'Mirpur Road, Mohammadpur, Dhaka-1207',
    district: 'Dhaka',
    phone: '02-8115682',
    website: 'https://www.drmc.edu.bd',
    description: 'A prestigious public school and college in Dhaka known for its sprawling campus, excellent academic results, and vast extracurricular opportunities.',
    rating: 4.8,
    is_verified: true
  },
  {
    name: 'Viqarunnisa Noon School & College',
    name_bn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ',
    type: 'school',
    subtype: 'private-school',
    address: '1/A New Baily Road, Dhaka',
    district: 'Dhaka',
    phone: '02-48321034',
    website: 'https://www.vnsc.edu.bd',
    description: 'One of the leading educational institutions for girls in Bangladesh with multiple branches across Dhaka city.',
    rating: 4.7,
    is_verified: true
  },
  {
    name: 'Ideal School and College',
    name_bn: 'আইডিয়াল স্কুল অ্যান্ড কলেজ',
    type: 'school',
    subtype: 'private-school',
    address: 'Motijheel, Dhaka-1000',
    district: 'Dhaka',
    phone: '02-7193231',
    website: 'https://www.iscm.edu.bd',
    description: 'A famous private school in Bangladesh known for admitting a large number of students and maintaining excellent academic performance.',
    rating: 4.6,
    is_verified: true
  },
  {
    name: 'Chittagong Collegiate School',
    name_bn: 'চট্টগ্রাম কলেজিয়েট স্কুল',
    type: 'school',
    subtype: 'govt-school',
    address: 'Ice Factory Road, Chittagong',
    district: 'Chattogram',
    phone: '031-611294',
    website: 'http://ccs.edu.bd',
    description: 'One of the oldest schools in Bangladesh, established in 1836, providing high-quality government-funded education to boys.',
    rating: 4.9,
    is_verified: true
  },

  // COLLEGES
  {
    name: 'Dhaka College',
    name_bn: 'ঢাকা কলেজ',
    type: 'college',
    subtype: 'govt-college',
    address: 'Mirpur Road, Dhanmondi, Dhaka',
    district: 'Dhaka',
    phone: '02-9669642',
    website: 'https://www.dhakacollege.edu.bd',
    description: 'The oldest secular educational institution in Bangladesh, established in 1841. It offers higher secondary and undergraduate programs.',
    rating: 4.7,
    is_verified: true
  },
  {
    name: 'Notre Dame College',
    name_bn: 'নটর ডেম কলেজ',
    type: 'college',
    subtype: 'private-college',
    address: 'Motijheel, Dhaka',
    district: 'Dhaka',
    phone: '02-41070712',
    website: 'https://ndc.edu.bd',
    description: 'A higher secondary educational institution in Dhaka, administered by the Congregation of Holy Cross. Highly reputed for its academic excellence.',
    rating: 4.9,
    is_verified: true
  },
  {
    name: 'Rajshahi College',
    name_bn: 'রাজশাহী কলেজ',
    type: 'college',
    subtype: 'govt-college',
    address: 'Rajshahi City',
    district: 'Rajshahi',
    phone: '0721-771511',
    website: 'http://rc.edu.bd',
    description: 'Established in 1873, it is the third oldest college in Bangladesh. It has a beautiful campus and consistently ranks among the top national colleges.',
    rating: 4.8,
    is_verified: true
  },
  {
    name: 'Chittagong College',
    name_bn: 'চট্টগ্রাম কলেজ',
    type: 'college',
    subtype: 'govt-college',
    address: 'College Road, Chawkbazar, Chittagong',
    district: 'Chattogram',
    phone: '031-616999',
    website: 'http://www.ctgcollege.gov.bd',
    description: 'The oldest science educational institution in Bangladesh, offering HSC and honors programs with highly qualified faculty.',
    rating: 4.6,
    is_verified: true
  },

  // UNIVERSITIES
  {
    name: 'University of Dhaka',
    name_bn: 'ঢাকা বিশ্ববিদ্যালয়',
    type: 'university',
    subtype: 'public-university',
    address: 'Nilkhet, Dhaka-1000',
    district: 'Dhaka',
    phone: '02-9661920',
    website: 'https://www.du.ac.bd',
    description: 'The oldest and premier university of Bangladesh, widely regarded as the highest echelon of academic excellence in the country.',
    rating: 4.9,
    is_verified: true
  },
  {
    name: 'Bangladesh University of Engineering and Technology (BUET)',
    name_bn: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়',
    type: 'university',
    subtype: 'engineering',
    address: 'Palashi, Dhaka-1000',
    district: 'Dhaka',
    phone: '02-9665650',
    website: 'https://www.buet.ac.bd',
    description: 'The top-ranked public university in Bangladesh focusing on engineering and architecture, known for its rigorous admission process.',
    rating: 5.0,
    is_verified: true
  },
  {
    name: 'North South University',
    name_bn: 'নর্থ সাউথ বিশ্ববিদ্যালয়',
    type: 'university',
    subtype: 'private-university',
    address: 'Bashundhara, Dhaka-1229',
    district: 'Dhaka',
    phone: '02-55668200',
    website: 'http://www.northsouth.edu',
    description: 'The first private university in Bangladesh, famous for its world-class campus, American-style curriculum, and modern facilities.',
    rating: 4.7,
    is_verified: true
  },
  {
    name: 'BRAC University',
    name_bn: 'ব্র্যাক বিশ্ববিদ্যালয়',
    type: 'university',
    subtype: 'private-university',
    address: 'Merul Badda, Dhaka',
    district: 'Dhaka',
    phone: '02-222264051',
    website: 'https://www.bracu.ac.bd',
    description: 'A leading private university in Bangladesh with a strong emphasis on research, liberal arts, and producing global leaders.',
    rating: 4.8,
    is_verified: true
  }
];

async function run() {
  try {
    // Truncate table to remove all previous data
    await db.query('TRUNCATE TABLE education_institutions');
    console.log('Successfully cleared all existing education data.');

    let count = 0;
    for (const inst of realInstitutes) {
      await db.query(`
        INSERT INTO education_institutions 
        (name, name_bn, type, subtype, address, district, phone, website, description, is_verified, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        inst.name,
        inst.name_bn,
        inst.type,
        inst.subtype,
        inst.address,
        inst.district,
        inst.phone,
        inst.website,
        inst.description,
        inst.is_verified ? 1 : 0
      ]);
      count++;
    }

    console.log(`Successfully added ${count} completely real educational institutions.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding real educational institutions:', err);
    process.exit(1);
  }
}

run();
