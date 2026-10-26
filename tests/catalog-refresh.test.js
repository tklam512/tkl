const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../shared-state.js'), 'utf8');
function load(values = new Map()) {
  const context = { window: {}, localStorage: {
    getItem: key => key.startsWith('btl-original-nine-seats-') || key === 'btl-booking-code-ucc-20261020' ? 'true' : values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  } };
  vm.runInNewContext(source, context);
  return context.window.cinemaState;
}
const state = load();
assert.equal(state.movies.length, 19);
assert(state.movies.every(movie => movie.date >= '2026-01-01'));
for (const title of ['Mưa đỏ', 'Dune', 'Spider-Man: No Way Home', 'Khóa chặt cửa nào Suzume', 'Marnie yêu dấu']) {
  assert(!state.movies.some(movie => movie.title === title), title);
}
const added = [11317, 11362, 11279, 11282, 11315, 11330];
for (const id of added) {
  const movie = state.movies.find(movie => movie.id === id);
  assert(movie, `Missing replacement ${id}`);
  assert.equal(state.movieStatus(movie, '2026-10-19'), 'showing');
  assert(fs.existsSync(path.join(__dirname, '../admin/movies', movie.poster)));
}
assert.equal(state.movies.filter(movie => state.movieStatus(movie, '2026-10-19') === 'ended').length, 2);
const old = {id: 6, title: 'Spider-Man: No Way Home', date: '2021-12-17'};
const custom = {id: 'custom', title: 'Phim admin tự thêm', date: '2026-10-20'};
const edited = {id: 11, title: 'Vùng Đất Quỷ Dữ', date: '2026-09-18', showingThrough: '2026-11-30', duration: 120};
const booked = [{movie: old.title, total: 165000}];
const screenings = [{id: 'old-show', movieId: '6'}, {id: 'custom-show', movieId: 'custom'}];
const values = new Map([
  ['btl-movies', JSON.stringify([old, custom, edited])],
  ['btl-screenings', JSON.stringify(screenings)],
  ['btl-bookings', JSON.stringify(booked)],
  ['btl-seed-upcoming-20261019', 'true']
]);
const migrated = load(values);
assert(!migrated.movies.some(movie => movie.id === 6));
assert.deepEqual(JSON.parse(JSON.stringify(migrated.movies.find(movie => movie.id === 'custom'))), custom);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.movies.find(movie => movie.id === 11))), edited);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.screenings.find(show => show.id === 'custom-show'))), screenings[1]);
assert(!migrated.screenings.some(show => show.id === 'old-show'));
assert.equal(values.get('btl-bookings'), JSON.stringify(booked), 'Historical bookings must stay intact');
assert.equal(migrated.movies.filter(movie => added.includes(movie.id)).length, 6);
migrated.saveMovies(migrated.movies.filter(movie => movie.id !== 11317));
assert(!load(values).movies.some(movie => movie.id === 11317), 'Deleted replacements must not return');
assert.equal(load(values).movies.length, 7);
console.log('Catalog refresh checks passed: 2026 films, posters, stored catalog migration and historical bookings.');
