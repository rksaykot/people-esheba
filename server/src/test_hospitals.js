const axios = require('axios');
const cheerio = require('cheerio');

async function testHospitals() {
  try {
    const res = await axios.get('https://en.wikipedia.org/wiki/List_of_hospitals_in_Bangladesh', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    // Instead of table.wikitable, let's just find ul li under the sections
    $('div.mw-parser-output ul li').each((i, el) => {
      if (i < 20) {
        console.log($(el).text().trim());
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}

testHospitals();
