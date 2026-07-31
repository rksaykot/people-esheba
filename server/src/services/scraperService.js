const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db');
const { translate } = require('@vitalets/google-translate-api');

// List of target configurations
const scrapers = [
  {
    name: 'Bangladesh Public Service Commission (BPSC)',
    url: 'http://bpsc.gov.bd/site/view/notices',
    category: 'government',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      // Example structure for BPSC (usually table rows inside #contents)
      $('table tbody tr').each((i, el) => {
        if (i === 0) return; // skip header
        const title = $(el).find('td').eq(1).text().trim();
        let link = $(el).find('td a').attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'http://bpsc.gov.bd' + link;
          notices.push({ title, link, source: 'BPSC', is_urgent: title.includes('Urgent') ? 1 : 0 });
        }
      });
      return notices;
    }
  },
  {
    name: 'Ministry of Education',
    url: 'http://moedu.gov.bd/site/view/notices',
    category: 'government',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      $('table tbody tr').each((i, el) => {
        const title = $(el).find('td').eq(1).text().trim();
        let link = $(el).find('td a').attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'http://moedu.gov.bd' + link;
          notices.push({ title, link, source: 'Ministry of Education', is_urgent: 0 });
        }
      });
      return notices;
    }
  },
  {
    name: 'Bangladesh Technical Education Board (BTEB)',
    url: 'http://bteb.gov.bd/site/view/notices',
    category: 'academic',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      $('table tbody tr').each((i, el) => {
        if (i === 0) return; // skip header
        const title = $(el).find('td').eq(1).text().trim();
        let link = $(el).find('td a').attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'http://bteb.gov.bd' + link;
          notices.push({ title, link, source: 'BTEB', is_urgent: title.includes('Urgent') ? 1 : 0 });
        }
      });
      return notices;
    }
  },
  {
    name: 'National University (NU)',
    url: 'https://www.nu.ac.bd/recent-news-notice.php',
    category: 'academic',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      $('ul.notice-list li').each((i, el) => {
        const title = $(el).find('a').text().trim();
        let link = $(el).find('a').attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'https://www.nu.ac.bd/' + link;
          notices.push({ title, link, source: 'National University', is_urgent: 0 });
        }
      });
      return notices;
    }
  },
  {
    name: 'Dhaka University',
    url: 'https://www.du.ac.bd/notices',
    category: 'academic',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      $('.notice-list li').each((i, el) => {
        const title = $(el).find('a').text().trim();
        let link = $(el).find('a').attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'https://www.du.ac.bd' + link;
          notices.push({ title, link, source: 'Dhaka University', is_urgent: 0 });
        }
      });
      return notices;
    }
  },
  {
    name: 'BDJobs',
    url: 'https://jobs.bdjobs.com/jobsearch.asp?fcatId=8', // IT Jobs example
    category: 'career',
    scrape: async (html) => {
      const $ = cheerio.load(html);
      const notices = [];
      $('.job-title-text a').each((i, el) => {
        const title = $(el).text().trim();
        let link = $(el).attr('href');
        if (title && link) {
          if (!link.startsWith('http')) link = 'https://jobs.bdjobs.com/' + link;
          notices.push({ title, link, source: 'BDJobs', is_urgent: 0 });
        }
      });
      return notices;
    }
  }
];

// Helper to save notice to DB avoiding duplicates
async function saveNotice(notice, category) {
  try {
    // Check if the link already exists (to prevent duplicates)
    const [rows] = await db.execute('SELECT id FROM notices WHERE link = ?', [notice.link]);
    if (rows.length > 0) {
      return false; // Already exists
    }

    let title_en = notice.title;
    let title_bn = notice.title;

    // Auto-translate using Google Translate API
    try {
      const hasBengali = /[\u0980-\u09FF]/.test(notice.title);
      if (hasBengali) {
        const res = await translate(notice.title, { to: 'en' });
        title_en = res.text || notice.title;
      } else {
        const res = await translate(notice.title, { to: 'bn' });
        title_bn = res.text || notice.title;
      }
    } catch (err) {
      console.log('[Scraper] Translation failed for:', notice.title);
    }

    // Insert new notice
    await db.execute(
      `INSERT INTO notices (title, title_bn, category, source, link, is_urgent, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 1, NULL)`,
      [
        title_en, 
        title_bn, 
        category, 
        notice.source, 
        notice.link, 
        notice.is_urgent || 0
      ]
    );
    return true; // Successfully inserted
  } catch (error) {
    console.error(`[Scraper] Error saving notice "${notice.title}":`, error.message);
    return false;
  }
}

// Main execution function
async function runScrapers() {
  console.log('[Scraper] Starting automated notice fetch...');
  let newCount = 0;

  for (const site of scrapers) {
    try {
      console.log(`[Scraper] Fetching data from ${site.name}...`);
      
      const response = await axios.get(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10 seconds timeout
      });

      const notices = await site.scrape(response.data);
      console.log(`[Scraper] Extracted ${notices.length} notices from ${site.name}.`);

      for (const notice of notices) {
        const added = await saveNotice(notice, site.category);
        if (added) newCount++;
      }

    } catch (error) {
      console.error(`[Scraper] Failed to scrape ${site.name}:`, error.message);
    }
  }

  console.log(`[Scraper] Automated fetch complete. Added ${newCount} new notices.`);
  return newCount;
}

module.exports = {
  runScrapers
};
