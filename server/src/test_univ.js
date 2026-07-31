const axios = require('axios');
const cheerio = require('cheerio');

async function testUnivs() {
  try {
    const res = await axios.get('https://en.wikipedia.org/wiki/List_of_universities_in_Bangladesh', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(res.data);
    
    // Universities are in wikitable
    let count = 0;
    $('table.wikitable tbody tr').each((i, el) => {
      if (count >= 10) return;
      const tds = $(el).find('td');
      if (tds.length > 0) {
        console.log(tds.eq(0).text().trim(), '|', tds.eq(1).text().trim(), '|', tds.eq(2).text().trim(), '|', tds.eq(3).text().trim());
        count++;
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}

testUnivs();
