const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../shared-state.js'), 'utf8');
function load(values = new Map()) {
  const context = { window: {}, localStorage: {
    getItem: key => key.startsWith('btl-original-nine-seats-') || key === 'btl-booking-code-ucc-20261020' ? 'true' : values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  } };
  vm.runInNewContext(source, context);
  return context.window.cinemaState;
}
const expected = new Map([[11251, 6.0], [11362, 6.8], [11279, 7.2], [11282, 6.9], [11330, 8.0]]);
const fresh = load();
for (const [id, rating] of expected) assert.equal(fresh.movies.find(movie => movie.id === id).rating, rating);
assert.equal(fresh.movies.find(movie => movie.id === 11317).rating, null, 'Unverified scores stay empty');
const saved = fresh.movies.filter(movie => movie.id !== 11279).map(movie => ({ ...movie, rating: null }));
saved.find(movie => movie.id === 11251).rating = 9.9;
saved.find(movie => movie.id === 11330).title = 'Tên admin tự sửa';
saved.find(movie => movie.id === 11362).duration = 123;
const values = new Map([
  ['btl-movies', JSON.stringify(saved)],
  ['btl-seed-upcoming-20261019', 'true'],
  ['btl-refresh-catalog-20261019', 'true'],
  ['btl-seed-screenings-20261019', 'true'],
  ['btl-bookings', '[{"movie":"Lịch sử"}]']
]);
const migrated = load(values);
assert.equal(migrated.movies.find(movie => movie.id === 11362).rating, 6.8);
assert.equal(migrated.movies.find(movie => movie.id === 11362).duration, 123);
assert.equal(migrated.movies.find(movie => movie.id === 11282).rating, 6.9);
assert.equal(migrated.movies.find(movie => movie.id === 11251).rating, 9.9);
assert.equal(migrated.movies.find(movie => movie.id === 11330).rating, null);
assert(!migrated.movies.some(movie => movie.id === 11279), 'Deleted movies must not return');
assert.equal(values.get('btl-bookings'), '[{"movie":"Lịch sử"}]');
migrated.saveMovies(migrated.movies.map(movie => ({ ...movie, rating: null })));
assert.equal(load(values).movies.find(movie => movie.id === 11362).rating, null, 'Migration runs only once');
console.log('IMDb checks passed: verified defaults, saved missing scores, admin edits and deletions preserved.');
