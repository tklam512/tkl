const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const routes = ['', 'movies', 'movies/detail', 'ticket-price', 'about', 'login', 'register', 'booking', 'my-tickets'];
for (const route of routes) {
  const file = path.join(root, route, 'index.html');
  assert(fs.existsSync(file), `Missing route: /${route}/`);
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /lang="vi"/);
  assert.match(html, /id="main"/);
  assert.match(html, /src="\/shared-state.js(?:\?[^\"]*)?"/);
  assert.match(html, /src="\/public\.js(?:\?[^"]*)?"/);
  assert(html.indexOf('/shared-state.js') < html.indexOf('/public.js'), 'Load shared state and auth before public UI');
  assert.match(html, /src="\/public-scroll\.js(?:\?[^\"]*)?"/);
  assert(html.indexOf('/lenis.min.js') < html.indexOf('/public-scroll.js'), 'Load Lenis before scroll setup');
  assert(!html.includes('iframe'));
}
for (const route of ['news', 'promotions', 'festivals']) {
  assert(!fs.existsSync(path.join(root, route)), `Removed route still exists: ${route}`);
}
console.log('Public route checks passed: all standalone Vietnamese pages use shared state.');
