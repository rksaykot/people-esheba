const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db');

// List of job target configurations
const jobScrapers = [
  {
    name: 'BPSC (Government Jobs)',
    url: 'http://bpsc.gov.bd/site/view/notices', // Government jobs are usually posted here
    category: 'govt',
    type: 'full-time',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const jobs = [];
      $('table tbody tr').each((i, el) => {
        if (i === 0) return; // skip header
        const title = $(el).find('td').eq(1).text().trim();
        let link = $(el).find('td a').attr('href');
        if (title && link && title.toLowerCase().includes('job') || title.toLowerCase().includes('recruitment') || title.includes('নিয়োগ')) {
          if (!link.startsWith('http')) link = 'http://bpsc.gov.bd' + link;
          jobs.push({ 
            title, 
            company: 'Government of Bangladesh (BPSC)', 
            link, 
            location: 'Bangladesh', 
            description: `Official recruitment notice by BPSC.\nOriginal Link: ${link}` 
          });
        }
      });
      return jobs;
    }
  },
  {
    name: 'BDJobs (IT / Software)',
    url: 'https://jobs.bdjobs.com/jobsearch.asp?fcatId=8',
    category: 'tech',
    type: 'full-time',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const jobs = [];
      // BDJobs usually has a specific structure. Note: Cloudflare might block this in production.
      $('.job-title-text a').each((i, el) => {
        const title = $(el).text().trim();
        let link = $(el).attr('href');
        const companyNode = $(el).closest('.row').find('.comp-name-text');
        const company = companyNode.text().trim() || 'Unknown Company';
        
        if (title && link) {
          if (!link.startsWith('http')) link = 'https://jobs.bdjobs.com/' + link;
          jobs.push({ 
            title, 
            company, 
            link, 
            location: 'Dhaka', 
            description: `Job posted on BDJobs.\nOriginal Link: ${link}`
          });
        }
      });
      return jobs;
    }
  }
];

async function saveJob(job, category, type) {
  try {
    // Basic deduplication check using description which contains the link
    const [rows] = await db.execute('SELECT id FROM jobs WHERE description LIKE ?', [`%${job.link}%`]);
    if (rows.length > 0) {
      return false; // Already exists
    }

    // Insert new job using Admin ID 1 (ensure Admin exists or this might fail)
    // We will use user_id = 1 as a fallback.
    let adminId = 1;
    const [adminCheck] = await db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.length > 0) {
      adminId = adminCheck[0].id;
    }

    // Generate a deadline 15 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);

    await db.execute(
      `INSERT INTO jobs (user_id, title, company, description, category, type, division, status, deadline, external_link)
       VALUES (?, ?, ?, ?, ?, ?, 'Dhaka', 'active', ?, ?)`,
      [
        adminId, 
        job.title, 
        job.company, 
        job.description, 
        category, 
        type, 
        deadline,
        job.link
      ]
    );
    return true; // Successfully inserted
  } catch (error) {
    console.error(`[JobScraper] Error saving job "${job.title}":`, error.message);
    return false;
  }
}

async function runJobScrapers() {
  console.log('[JobScraper] Starting automated job fetch...');
  let newCount = 0;

  for (const site of jobScrapers) {
    try {
      console.log(`[JobScraper] Fetching data from ${site.name}...`);
      
      const response = await axios.get(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000 // 10 seconds timeout
      });

      const jobs = await site.scrape(response.data);
      console.log(`[JobScraper] Extracted ${jobs.length} potential jobs from ${site.name}.`);

      for (const job of jobs) {
        const added = await saveJob(job, site.category, site.type);
        if (added) newCount++;
      }

    } catch (error) {
      console.error(`[JobScraper] Failed to scrape ${site.name}:`, error.message);
    }
  }

  console.log(`[JobScraper] Automated fetch complete. Added ${newCount} new jobs.`);
  return newCount;
}

module.exports = {
  runJobScrapers
};
