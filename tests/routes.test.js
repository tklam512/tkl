const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
assert.match(read('index.html'), /data-page="home"/);
const movieScripts = ['movies', 'genres'].map(route =>
  [...read(`admin/${route}/index.html`).matchAll(/src="([^"]+)"/g)]
    .map(([, src]) => new URL(src, `http://cinema.test/admin/${route}/`))
    .find(url => url.pathname === '/admin/movies/app.js').href);
assert.equal(movieScripts[0], movieScripts[1], 'Movies and Genres must load the same script version to avoid stale sidebar handlers');
const routes = ['home', 'login', 'movies', 'genres', 'showtimes', 'booking', 'products'];
for (const route of routes) {
  const file = `admin/${route}/index.html`;
  const html = read(file);
  assert(!html.includes('<iframe'), file);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(url)) continue;
    const local = decodeURI(url.split(/[?#]/)[0]);
    const target = local.startsWith('/') ? path.join(root, local) : path.resolve(root, path.dirname(file), local);
    assert(fs.existsSync(target), `${file}: missing ${url}`);
  }
}
assert(!fs.existsSync(path.join(root, 'admin/theaters')), 'Theater management route must be removed');
const values = new Map();
const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
let redirect;
vm.runInNewContext(read('admin/app.js'), {
  sessionStorage: storage,
  window: { location: { pathname: '/admin/showtimes/', search: '?movieId=1', replace: url => { redirect = url; } } }
});
assert.equal(redirect, '/admin/login/?next=%2Fadmin%2Fshowtimes%2F%3FmovieId%3D1');
function login(next, password = '12345678') {
  let submit;
  const error = { style: {} };
  redirect = undefined;
  vm.runInNewContext(read('admin/login/login.js'), {
    URL, URLSearchParams, sessionStorage: storage,
    document: { getElementById: id => ({
      loginForm: { addEventListener: (_, handler) => { submit = handler; } },
      username: { value: 'utcadmin' }, password: { value: password }, loginError: error
    })[id] },
    window: { location: { origin: 'http://localhost:8000', search: '?next=' + encodeURIComponent(next), assign: url => { redirect = url; } } }
  });
  submit({ preventDefault() {} });
  return error;
}
assert.equal(login('/admin/booking/', 'wrong').style.display, 'block');
assert.equal(redirect, undefined);
login('/admin/booking/?search=test');
assert.equal(redirect, 'http://localhost:8000/admin/booking/?search=test');
assert.equal(values.get('btl.loggedIn'), 'true');
login('https://example.com/admin/booking/');
assert.equal(redirect, '/admin/home/');
login('/');
assert.equal(redirect, '/admin/home/');
console.log('Route checks passed: public entry, page assets, login and safe return URLs.');
