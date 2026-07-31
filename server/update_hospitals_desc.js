const db = require('./src/config/db');

const descriptions = {
  'Square Hospitals Ltd.': 'Square Hospital is a 400-bed tertiary care hospital in Dhaka, Bangladesh. It provides comprehensive medical services with state-of-the-art facilities, specialized ICUs, and advanced surgical units. Renowned for its patient-centric care and expert medical professionals.',
  'Evercare Hospital Dhaka': 'Evercare Hospital Dhaka (formerly Apollo Hospitals) is the only JCI-accredited 425-bed multi-disciplinary super-specialty hospital in Bangladesh. It offers world-class healthcare, advanced diagnostics, and 24/7 emergency services.',
  'Dhaka Medical College Hospital': 'Dhaka Medical College Hospital (DMCH) is the largest and most prestigious public medical college and hospital in Bangladesh. Established in 1946, it serves thousands of patients daily and acts as the primary referral hospital for complex cases across the country.',
  'Bangabandhu Sheikh Mujib Medical University (BSMMU)': 'BSMMU is the premier postgraduate medical institution in Bangladesh. Located in Shahbag, Dhaka, it offers specialized treatments, advanced medical research, and comprehensive outpatient and inpatient services.',
  'Labaid Specialized Hospital': 'Labaid Specialized Hospital is one of the leading private hospitals in Bangladesh, especially renowned for its cardiac care. It features modern diagnostic labs, specialized consultants, and dedicated patient care services.',
  'United Hospital Limited': 'United Hospital is a premium private hospital in Gulshan, Dhaka, offering comprehensive medical care with 450+ beds. It is known for its excellence in cardiology, neurology, and oncology, providing international standard healthcare.',
  'BIRDEM General Hospital': 'BIRDEM is a multidisciplinary hospital and the central institution of the Diabetic Association of Bangladesh. It is world-renowned for its diabetic care and also offers excellent general medical and surgical services.',
  'National Heart Foundation Hospital': 'National Heart Foundation Hospital is a specialized cardiovascular care center providing affordable and high-quality treatment for heart diseases, including open-heart surgeries and advanced cardiac interventions.'
};

const genericGovt = 'This is a major government healthcare facility providing essential medical services, emergency care, and specialized treatments to the general public at highly subsidized rates. It serves as a crucial referral center for the region.';
const genericPrivate = 'A modern private hospital equipped with advanced medical technology, experienced specialists, and dedicated patient care facilities. Offers comprehensive diagnostic and therapeutic services round the clock.';

async function run() {
  try {
    const [rows] = await db.query("SELECT id, name, subtype FROM directory_listings WHERE category = 'hospital'");
    let updated = 0;
    
    for (const row of rows) {
      let desc = descriptions[row.name];
      if (!desc) {
        desc = row.subtype === 'govt-hospital' ? genericGovt : genericPrivate;
      }
      await db.query("UPDATE directory_listings SET description = ? WHERE id = ?", [desc, row.id]);
      updated++;
    }
    
    console.log(`Updated descriptions for ${updated} hospitals.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
