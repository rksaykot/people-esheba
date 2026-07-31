const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('bdjobs.html', 'utf8');
const $ = cheerio.load(html);
const jobs = [];
$('.job-title-text').each((i, el) => {
  const a = $(el).find('a');
  jobs.push({ title: a.text().trim(), link: a.attr('href') });
});
console.log('Title text count:', $('.job-title-text').length);
console.log('Jobs array:', jobs.slice(0, 5));

// let's try other selectors if that's 0
if (jobs.length === 0) {
  const backup = [];
  $('div.job-title').each((i, el) => {
     backup.push($(el).text().trim());
  });
  console.log('Job title div:', backup.slice(0, 5));
  
  const aTags = [];
  $('a').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 10 && $(el).attr('href') && $(el).attr('href').includes('jobdetails.asp')) {
      aTags.push({text, href: $(el).attr('href')});
    }
  });
  console.log('A tags with jobdetails:', aTags.slice(0, 5));
}
