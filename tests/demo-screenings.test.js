const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../shared-state.js'), 'utf8');
function load(values = new Map(), date = '2026-10-19') {
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [date + 'T12:00:00'])); }
  }
  const context = { Date: TestDate, window: {}, localStorage: {
    getItem: key => key.startsWith('btl-original-nine-seats-') || key === 'btl-booking-code-ucc-20261020' ? 'true' : values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  } };
  vm.runInNewContext(source, context);
  return context.window.cinemaState;
}
const values = new Map();
const state = load(values);
assert.equal(state.screenings.length, 26);
const showing = state.movies.filter(movie => state.movieStatus(movie, '2026-10-19') === 'showing');
for (const movie of showing) {
  assert.equal(state.screenings.filter(show => show.movieId === String(movie.id)).length, 2, movie.title);
}
for (const show of state.screenings) {
  assert.equal(show.date, '2026-10-19');
  assert.equal(state.screeningError(show), '', show.id);
}
assert.equal(load(values).screenings.length, 26, 'Reload must not duplicate demo screenings');
state.saveScreenings([]);
assert.equal(load(values).screenings.length, 0, 'Admin deletions must survive reload');

const first = load().screenings[0];
const custom = {...first, id: 'admin-show', time: '10:30', price: 90000};
const saved = new Map([['btl-screenings', JSON.stringify([custom])]]);
const merged = load(saved);
assert.deepEqual(JSON.parse(JSON.stringify(merged.screenings.find(show => show.id === custom.id))), custom);
assert(!merged.screenings.some(show => show.id === first.id), 'Skip slots overlapping an admin screening');
for (const show of merged.screenings) assert.equal(merged.screeningError(show), '', show.id);

const edited = {...first, price: 99000};
const existing = load(new Map([['btl-screenings', JSON.stringify([edited])]]));
assert.equal(existing.screenings.filter(show => show.id === first.id).length, 1);
assert.equal(existing.screenings.find(show => show.id === first.id).price, 99000);
assert.equal(load(new Map([['btl-movies', '[]'], ['btl-seed-upcoming-20261019', 'true'], ['btl-refresh-catalog-20261019', 'true']])).screenings.length, 0);
assert.equal(load(new Map([['btl-theaters', '[]']])).screenings.length, 0);
const longMovies = state.movies.map(movie => movie.id === 3 ? {...movie, duration: 600} : movie);
const longState = load(new Map([['btl-movies', JSON.stringify(longMovies)]]));
assert.equal(longState.screenings.filter(show => show.movieId === '3').length, 1, 'Seeded slots must respect edited movie durations');
for (const show of longState.screenings) assert.equal(longState.screeningError(show), '', show.id);
console.log('Demo screening checks passed: 26 valid slots, shared storage, no conflicts, duplicates or restored deletions.');

const dailyValues = new Map();
const yesterday = load(dailyValues);
const oldScreenings = JSON.stringify(yesterday.screenings);
const tomorrow = load(dailyValues, '2026-10-20');
assert.equal(JSON.stringify(tomorrow.screenings.filter(show => show.date === '2026-10-19')), oldScreenings, 'Keep past schedules');
const dailyShows = tomorrow.screenings.filter(show => show.date === '2026-10-20');
assert(dailyShows.length > 0, 'Fixed slots must appear on the next day');
for (const movie of tomorrow.movies.filter(movie => tomorrow.movieStatus(movie, '2026-10-20') === 'showing')) {
  assert.equal(dailyShows.filter(show => show.movieId === String(movie.id)).length, 2, movie.title);
}
for (const show of dailyShows) assert.equal(tomorrow.screeningError(show), '', show.id);
assert.equal(load(dailyValues, '2026-10-20').screenings.length, tomorrow.screenings.length, 'Daily reload must not duplicate slots');
tomorrow.saveScreenings(tomorrow.screenings.filter(show => show.id !== dailyShows[0].id));
assert(!load(dailyValues, '2026-10-20').screenings.some(show => show.id === dailyShows[0].id), 'Keep same-day admin deletion');
console.log('Daily screening checks passed: date rollover, current films, history and deletions.');
