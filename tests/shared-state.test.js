const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const values = new Map();
const context = {
  window: {},
  crypto: require('node:crypto').webcrypto,
  performance: { getEntriesByType: () => [{ type: 'navigate' }] },
  localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
};
vm.createContext(context);
const source = fs.readFileSync(require('node:path').join(__dirname, '../shared-state.js'), 'utf8');
vm.runInContext(source, context);
const state = context.window.cinemaState;
assert.equal(state.movies.length, 19);
assert.equal(state.bookings.filter(booking=>!booking.demoSeatSeed).length, 9);
assert(state.bookings.every(booking=>/^UCC_\d{2}_[A-Z0-9]{10}$/.test(booking.code)));
assert.equal(state.genres.length, 9);
assert.equal(state.products.length, 3);
assert.equal(state.theaters.length, 3);
assert.equal(state.theaters[0].rooms.length, 5);
assert.equal(state.rooms.length, 15);
assert.equal(new Set(state.rooms.map(room => room.name)).size, 15);
assert.equal(state.rooms.find(room => room.id === '2:1').name, 'Phòng 6');
assert.equal(state.rooms.find(room => room.id === '3:5').name, 'Phòng 15');
for (const name of ['Genres', 'Products', 'Theaters', 'Bookings']) {
  const key = name.toLowerCase();
  const original = state[key];
  state['save' + name]([]);
  assert.equal(state[key].length, 0);
  state['save' + name](original);
}
assert.equal(state.site.navigation.length, 4);
assert.ok(state.site.navigation.every(([href]) => !['/news/', '/promotions/', '/festivals/'].includes(href)));
for (const group of ['news', 'promotions', 'festivals']) assert.equal(state.site[group], undefined);
for (const group of ['banners', 'ticketPrices']) {
  assert.ok(state.site[group].length > 0, group);
  for (const item of state.site[group]) {
    assert.ok(fs.existsSync(require('node:path').join(__dirname, '..', item.image)), item.image);
  }
}
// Vietnam theatrical releases; showtimes remain demo data.
const releaseDates = new Map([
  ['Án Mạng Xém Hoàn Hảo', '2026-10-09'],
  ['Cá Voi Nuốt Chửng', '2026-10-16'],
  ['Chiikawa: Bí mật đảo người cá', '2026-08-28'],
  ['Người Mẹ Khác', '2026-10-09'],
  ['Pháo hoa lúc bình minh', '2026-09-25'],
  ['Vùng Đất Quỷ Dữ', '2026-09-18'],
  ['Verity: Bí Mật Bị Chôn Vùi', '2026-10-16'],
  ['Trái Tim Quái Thú', '2026-10-02']
]);
for (const booking of state.bookings.filter(booking=>!booking.demoSeatSeed && !booking.originalDemo)) {
  const [day, month, year] = booking.showtime.split(' · ')[0].split('/');
  const date = `${year}-${month}-${day}`;
  const release = releaseDates.get(booking.movie);
  const film = state.movies.find(movie => movie.title === booking.movie);
  assert.ok(film, `Booking movie missing from catalog: ${booking.movie}`);
  assert.equal(film.date, release);
  assert.ok(film.duration > 0 && film.genres.length > 0);
  assert.ok(fs.existsSync(require('node:path').join(__dirname, '../admin/movies', film.poster)));
  assert.ok(release, `Missing release date: ${booking.movie}`);
  assert.ok(date >= release, `${booking.movie}: booking precedes release`);
  assert.ok((Date.parse(date) - Date.parse(release)) / 86400000 <= 21,
    `${booking.movie}: demo booking outside release period`);
}
assert.ok(state.movies.every(movie => !movie.date.startsWith('2024-')));
for (const title of ['Người Mẹ Khác', 'Vùng Đất Quỷ Dữ', 'Verity: Bí Mật Bị Chôn Vùi', 'Quỷ Ăn Tạng 4: Hổ Tinh', 'Street Fighter']) {
  const film = state.movies.find(movie => movie.title === title);
  assert.ok(film, `Missing current movie: ${title}`);
  assert.ok(Number.isFinite(film.rating) && film.rating > 0 && film.rating <= 10, `Missing IMDb score: ${title}`);
  assert.equal(state.movieStatus(film, '2026-10-18'), 'showing');
  assert.ok(film.duration > 0 && film.genres.length > 0);
  assert.ok(fs.existsSync(require('node:path').join(__dirname, '../admin/movies', film.poster)));
  assert.equal(state.movieStatus(film, '2026-01-01'), 'soon');
}
assert.equal(state.movieStatus({ date: '2026-09-18', showingThrough: '2026-10-18' }, '2026-10-19'), 'ended');
const movie = { id: 'test', title: 'Test', duration: 120, date: '2026-10-01', endDate: '2026-11-01', status: 'showing' };
state.saveMovies([movie]);
const show = { id: 'show-test', movieId: 'test', theaterId: '1', room: 1, date: '2026-10-11', time: '23:00', price: 75000 };
assert.equal(state.movieStatus(movie, '2026-10-11'), 'showing');
assert.equal(state.screeningError(show), '');
state.saveScreenings([show]);
assert.equal(state.movieStatus(movie, '2026-09-30'), 'soon');
assert.equal(state.movieStatus(movie, '2026-10-01'), 'showing');
assert.equal(state.movieStatus(movie, '2026-10-22'), 'showing');
assert.equal(state.movieStatus(movie, '2026-10-23'), 'ended');
assert.equal(state.movieStatus({ ...movie, date: '2026-09-25' }, '2026-10-16'), 'showing');
assert.equal(state.movieStatus({ ...movie, date: '2026-09-25' }, '2026-10-17'), 'ended');
assert.equal(state.movieStatus(movie, '2026-10-11'), 'showing');
assert.equal(state.movieStatus(movie, '2026-10-12'), 'showing');
assert.equal(state.screeningError(show), '');
assert.ok(state.screeningError({ ...show, id: 'second', time: '23:30' }));
assert.ok(state.screeningError({ ...show, id: 'second', date: '2026-10-12', time: '00:30' }));
assert.equal(state.screeningError({ ...show, date: '2026-10-12', time: '01:00' }), '');
assert.equal(state.screeningError({ ...show, room: 2 }), '');
assert.ok(state.screeningError({ ...show, date: '2026-09-30' }));
assert.ok(state.screeningError({ ...show, date: '2026-11-02' }));
assert.ok(state.screeningError({ ...show, date: '2026-02-30' }));
assert.ok(state.screeningError({ ...show, time: '24:00' }));
assert.ok(state.screeningError({ ...show, price: -1 }));
assert.ok(state.screeningError({ ...show, movieId: 'missing' }));
assert.ok(state.screeningError({ ...show, room: 6 }));
assert.ok(state.screeningError(show, [{ ...movie, date: '2026-10-12' }]));
state.saveScreenings([show, { ...show, id: 'next', date: '2026-10-12', time: '01:00' }]);
assert.ok(state.screeningError(show, [{ ...movie, duration: 180 }]));
state.saveScreenings([show]);
vm.runInContext(source, context);
assert.equal(context.window.cinemaState.movies[0].title, 'Test');
assert.equal(context.window.cinemaState.screenings[0].id, 'show-test');
// Navigation and reload keep data shared across page contexts.
const persistedKeys = ['btl-movies', 'btl-screenings', 'btl-bookings', 'btl-genres'];
persistedKeys.forEach(key => values.set(key, '[]'));
context.performance.getEntriesByType = () => [{ type: 'reload' }];
context.window.top = context.window;
vm.runInContext(source, context);
persistedKeys.forEach(key => assert.equal(values.get(key), '[]'));
assert.equal(context.window.cinemaState.movies.length, 0);
assert.equal(context.window.cinemaState.bookings.length, 0);
const otherPage = { window: {}, localStorage: context.localStorage };
vm.runInNewContext(source, otherPage);
otherPage.window.cinemaState.saveMovies([movie]);
assert.equal(context.window.cinemaState.movies[0].title, 'Test');
const legacy = new Map([['btl-genres', '[{"id":99,"name":"Legacy"}]']]);
const fresh = new Map();
const storageFor = entries => ({ getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) });
const migrated = { window: {}, localStorage: storageFor(fresh), sessionStorage: storageFor(legacy) };
vm.runInNewContext(source, migrated);
assert.equal(migrated.window.cinemaState.genres[0].name, 'Legacy');
fresh.set('btl-genres', '[]');
vm.runInNewContext(source, migrated);
assert.equal(migrated.window.cinemaState.genres.length, 0);
console.log('Shared-state checks passed, including persistence and shared page contexts.');
