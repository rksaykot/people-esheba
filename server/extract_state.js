const fs = require('fs');
const html = fs.readFileSync('bdjobs.html', 'utf8');
const match = html.match(/<script id="ng-state" type="application\/json">(.*?)<\/script>/s);
if (match) {
  const json = JSON.parse(match[1]);
  fs.writeFileSync('bdjobs_state.json', JSON.stringify(json, null, 2));
  console.log('Saved JSON');
} else {
  console.log('No match');
}
