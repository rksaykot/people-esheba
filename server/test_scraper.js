const axios = require('axios');
const cheerio = require('cheerio');

async function testJagoJobs() {
  try {
    const res = await axios.get('https://www.jagojobs.com/', { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const $ = cheerio.load(res.data);
    const jobs = [];
    $('.job-title').each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) jobs.push({title, link});
    });
    console.log('JagoJobs Title Class Count:', $('.job-title').length);
    console.log('JagoJobs links:', jobs.slice(0, 3));
    
    const allLinks = [];
    $('a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if(text.length > 5 && href && href.includes('jobs')) {
        allLinks.push({text, href});
      }
    });
    console.log('JagoJobs all links:', allLinks.slice(0, 5));
  } catch(e) {
    console.error('JagoJobs error:', e.message);
  }
}

async function testChakrirKhobor() {
  try {
    const res = await axios.get('https://chakrirkhobor.net/', { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const $ = cheerio.load(res.data);
    const links = [];
    $('h2.post-title a').each((i, el) => {
      links.push({ title: $(el).text().trim(), link: $(el).attr('href') });
    });
    console.log('ChakrirKhobor:', links.slice(0, 5));
  } catch(e) {
    console.error('ChakrirKhobor error:', e.message);
  }
}

testJagoJobs();
testChakrirKhobor();
