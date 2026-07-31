const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('ck.html', 'utf8');
const $ = cheerio.load(html);
const links = [];
$('h2.entry-title').each((i, el) => {
  const a = $(el).find('a');
  const title = a.text().trim();
  const link = a.attr('href');
  if(title && link) {
    links.push({ title, link });
  }
});
console.log(links.slice(0, 10));
