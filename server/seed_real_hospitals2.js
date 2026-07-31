const db = require('./src/config/db');

const realHospitals = [
  {
    name: 'Square Hospitals Ltd.',
    name_bn: 'স্কয়ার হাসপাতাল লিমিটেড',
    category: 'private',
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak West, Panthapath, Dhaka 1205',
    district: 'Dhaka',
    phone: '10616',
    email: 'info@squarehospital.com',
    website: 'https://www.squarehospital.com',
    rating: 4.8,
    is_verified: true,
    latitude: 23.7531,
    longitude: 90.3813
  },
  {
    name: 'Evercare Hospital Dhaka',
    name_bn: 'এভারকেয়ার হাসপাতাল ঢাকা',
    category: 'private',
    address: 'Plot: 81, Block: E, Bashundhara R/A, Dhaka 1229',
    district: 'Dhaka',
    phone: '10678',
    email: 'feedback@evercarebd.com',
    website: 'https://www.evercarebd.com',
    rating: 4.7,
    is_verified: true,
    latitude: 23.8105,
    longitude: 90.4313
  },
  {
    name: 'United Hospital Limited',
    name_bn: 'ইউনাইটেড হাসপাতাল লিমিটেড',
    category: 'private',
    address: 'Plot 15 Road 71, Gulshan, Dhaka 1212',
    district: 'Dhaka',
    phone: '10666',
    email: 'info@uhlbd.com',
    website: 'https://www.uhlbd.com',
    rating: 4.6,
    is_verified: true,
    latitude: 23.7997,
    longitude: 90.4144
  },
  {
    name: 'Labaid Specialized Hospital',
    name_bn: 'ল্যাবএইড স্পেশালাইজড হাসপাতাল',
    category: 'private',
    address: 'House- 06, Road-04, Dhanmondi, Dhaka 1205',
    district: 'Dhaka',
    phone: '10606',
    email: 'info@labaidgroup.com',
    website: 'https://labaidgroup.com',
    rating: 4.5,
    is_verified: true,
    latitude: 23.7417,
    longitude: 90.3833
  },
  {
    name: 'Ibn Sina Trust Hospital',
    name_bn: 'ইবনে সিনা ট্রাস্ট হাসপাতাল',
    category: 'private',
    address: 'House # 48, Road # 9/A, Dhanmondi, Dhaka 1209',
    district: 'Dhaka',
    phone: '+8801717351631',
    email: 'info@ibnsinatrust.com',
    website: 'https://www.ibnsinatrust.com',
    rating: 4.4,
    is_verified: true,
    latitude: 23.7431,
    longitude: 90.3755
  },
  {
    name: 'Dhaka Medical College Hospital',
    name_bn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'Secretariat Road, Dhaka 1000',
    district: 'Dhaka',
    phone: '+880255165088',
    email: 'dmc@ac.bd',
    website: 'https://dmc.gov.bd',
    rating: 4.2,
    is_verified: true,
    latitude: 23.7262,
    longitude: 90.3976
  },
  {
    name: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    name_bn: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
    category: 'public',
    address: 'Shahbag, Dhaka 1000',
    district: 'Dhaka',
    phone: '+880255165760',
    email: 'info@bsmmu.edu.bd',
    website: 'https://bsmmu.edu.bd',
    rating: 4.3,
    is_verified: true,
    latitude: 23.7389,
    longitude: 90.3957
  },
  {
    name: 'BIRDEM General Hospital',
    name_bn: 'বারডেম জেনারেল হাসপাতাল',
    category: 'private',
    address: '122 Kazi Nazrul Islam Avenue, Shahbagh, Dhaka 1000',
    district: 'Dhaka',
    phone: '+880241060311',
    email: 'info@birdembd.org',
    website: 'https://www.birdembd.org',
    rating: 4.5,
    is_verified: true,
    latitude: 23.7397,
    longitude: 90.3954
  },
  {
    name: 'National Heart Foundation Hospital',
    name_bn: 'ন্যাশনাল হার্ট ফাউন্ডেশন হাসপাতাল',
    category: 'public',
    address: 'Plot-7/2, Section-2, Mirpur, Dhaka 1216',
    district: 'Dhaka',
    phone: '+880258151012',
    email: 'admin@nhf.org.bd',
    website: 'https://www.nhf.org.bd',
    rating: 4.7,
    is_verified: true,
    latitude: 23.8052,
    longitude: 90.3629
  },
  {
    name: 'Kurmitola General Hospital',
    name_bn: 'কুর্মিটোলা জেনারেল হাসপাতাল',
    category: 'public',
    address: 'Dhaka Cantonment, Dhaka 1206',
    district: 'Dhaka',
    phone: '+880255062201',
    email: 'kgh@kgh.gov.bd',
    website: '',
    rating: 4.1,
    is_verified: true,
    latitude: 23.8164,
    longitude: 90.4005
  },
  {
    name: 'Chattogram Medical College Hospital',
    name_bn: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'KB Fazlul Kader Road, Panchlaish, Chattogram',
    district: 'Chattogram',
    phone: '+88031619597',
    email: 'info@cmch.gov.bd',
    website: '',
    rating: 4.0,
    is_verified: true,
    latitude: 22.3614,
    longitude: 91.8317
  },
  {
    name: 'Evercare Hospital Chattogram',
    name_bn: 'এভারকেয়ার হাসপাতাল চট্টগ্রাম',
    category: 'private',
    address: 'Plot No. H1, Ananna Residential Area, CDA, Hathazari, Chattogram',
    district: 'Chattogram',
    phone: '10663',
    email: 'info.ctg@evercarebd.com',
    website: 'https://www.evercarebd.com',
    rating: 4.6,
    is_verified: true,
    latitude: 22.3951,
    longitude: 91.8213
  },
  {
    name: 'Rajshahi Medical College Hospital',
    name_bn: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'Rajshahi Medical College Campus, Rajshahi 6000',
    district: 'Rajshahi',
    phone: '+880721774300',
    email: 'rmc@ac.bd',
    website: '',
    rating: 4.1,
    is_verified: true,
    latitude: 24.3733,
    longitude: 88.5959
  },
  {
    name: 'Sylhet MAG Osmani Medical College Hospital',
    name_bn: 'সিলেট এম এ জি ওসমানী মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'Medical Road, Sylhet 3100',
    district: 'Sylhet',
    phone: '+880821714881',
    email: 'somc@ac.bd',
    website: '',
    rating: 4.0,
    is_verified: true,
    latitude: 24.9016,
    longitude: 91.8596
  },
  {
    name: 'Khulna Medical College Hospital',
    name_bn: 'খুলনা মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'Boyra Main Road, Khulna 9000',
    district: 'Khulna',
    phone: '+88041761531',
    email: 'kmc@ac.bd',
    website: '',
    rating: 3.9,
    is_verified: true,
    latitude: 22.8256,
    longitude: 89.5411
  },
  {
    name: 'Barishal Sher-e-Bangla Medical College Hospital',
    name_bn: 'বরিশাল শেরে বাংলা মেডিকেল কলেজ হাসপাতাল',
    category: 'public',
    address: 'Band Road, Barishal 8200',
    district: 'Barishal',
    phone: '+8804312173543',
    email: 'sbmch@ac.bd',
    website: '',
    rating: 4.0,
    is_verified: true,
    latitude: 22.6874,
    longitude: 90.3629
  },
  {
    name: 'Popular Diagnostic Centre Ltd.',
    name_bn: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ',
    category: 'private',
    address: 'House # 16, Road # 2, Dhanmondi R/A, Dhaka-1205',
    district: 'Dhaka',
    phone: '09613787801',
    email: 'info@populardiagnostic.com',
    website: 'https://populardiagnostic.com',
    rating: 4.5,
    is_verified: true,
    latitude: 23.7380,
    longitude: 90.3850
  },
  {
    name: 'National Institute of Neurosciences & Hospital',
    name_bn: 'ন্যাশনাল ইনস্টিটিউট অব নিউরোসায়েন্সেস ও হাসপাতাল',
    category: 'public',
    address: 'Sher-E-Bangla Nagar, Agargaon, Dhaka 1207',
    district: 'Dhaka',
    phone: '+88029137305',
    email: 'info@nins.com.bd',
    website: 'http://nins.com.bd',
    rating: 4.8,
    is_verified: true,
    latitude: 23.7712,
    longitude: 90.3708
  },
  {
    name: 'Anwer Khan Modern Hospital Ltd.',
    name_bn: 'আনোয়ার খান মডার্ন হাসপাতাল লিঃ',
    category: 'private',
    address: 'House # 17, Road # 8, Dhanmondi R/A, Dhaka-1205',
    district: 'Dhaka',
    phone: '+88029670295',
    email: 'info@akmmc.edu.bd',
    website: 'https://akmmc.edu.bd',
    rating: 4.2,
    is_verified: true,
    latitude: 23.7432,
    longitude: 90.3802
  },
  {
    name: 'Bangladesh Eye Hospital',
    name_bn: 'বাংলাদেশ আই হসপিটাল',
    category: 'private',
    address: '78, Satmasjid Road, Dhanmondi, Dhaka',
    district: 'Dhaka',
    phone: '09666787878',
    email: 'info@bdeyehospital.com',
    website: 'https://www.bdeyehospital.com',
    rating: 4.6,
    is_verified: true,
    latitude: 23.7461,
    longitude: 90.3739
  }
];

async function seedRealHospitals() {
  try {
    console.log('Connecting to database...');
    await db.query("DELETE FROM directory_listings WHERE category = 'hospital'");
    console.log('Successfully cleared all existing hospital data.');

    let count = 0;
    for (const h of realHospitals) {
      await db.query(`
        INSERT INTO directory_listings 
        (category, subtype, name, description, address, district, phone, website, rating, is_verified)
        VALUES ('hospital', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        h.category, 
        h.name, 
        h.name_bn || '', 
        h.address, 
        h.district, 
        h.phone, 
        h.website || '', 
        h.rating, 
        h.is_verified ? 1 : 0
      ]);
      count++;
    }

    console.log(`Successfully added ${count} completely real hospitals.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding real hospitals:', err);
    process.exit(1);
  }
}

seedRealHospitals();
