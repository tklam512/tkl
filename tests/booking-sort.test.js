const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bookings = [
  ['old', '17/12/2021 · 09:30'],
  ['early', '25/09/2026 · 09:00'],
  ['other-month', '28/08/2026 · 19:45'],
  ['late', '25/09/2026 · 14:30'],
  ['other-year', '31/12/2024 · 20:00']
].map(([code, showtime]) => ({ code, showtime, customer: 'Test', movie: 'Test', location: 'Test', seats: 1, total: 10000, ticket: 'Đã xác nhận', payment: 'Đã thanh toán' }));
bookings[0].location = 'CGV Vincom · Phòng 3';
bookings[1].location = 'Phòng A <script>';
const elements = Object.fromEntries(['bookingSearch', 'bookingRows', 'bookingEmpty'].map(id => [id, {
  addEventListener(type, listener) { this[type] = listener; },
  removeEventListener() {}
}]));
const windowEvents = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../admin/booking/booking.js'), 'utf8'), {
  cinemaState: { bookings },
  window: {addEventListener:(type,listener)=>{windowEvents[type]=listener;},removeEventListener(){}},
  document: { getElementById: id => elements[id] },
  Intl
});
function renderedCodes() {
  return [...elements.bookingRows.innerHTML.matchAll(/data-booking-code="([^"]+)"/g)].map(match => match[1]);
}
assert.deepEqual(renderedCodes(), ['late', 'early', 'other-month', 'other-year', 'old']);
assert(!elements.bookingRows.innerHTML.includes('CGV Vincom'));
assert(elements.bookingRows.innerHTML.includes('<td>Phòng 3</td>'));
assert(elements.bookingRows.innerHTML.includes('Phòng A &lt;script&gt;'));
assert.equal(bookings[0].location, 'CGV Vincom · Phòng 3', 'Keep stored booking history unchanged');
assert.deepEqual(bookings.map(item => item.code), ['old', 'early', 'other-month', 'late', 'other-year']);
elements.bookingSearch.input({ target: { value: 'Test' } });
assert.deepEqual(renderedCodes(), ['late', 'early', 'other-month', 'other-year', 'old']);
elements.bookingSearch.input({ target: { value: 'missing' } });
assert.deepEqual(renderedCodes(), []);
assert.equal(elements.bookingEmpty.hidden, false);
console.log('Booking sort checks passed: dates, times, search and unchanged source data.');

bookings.push({...bookings[0],code:'live-booking',customer:'Live Customer',movie:'Live Film',showtime:'20/10/2026 · 19:30'});
elements.bookingSearch.value = '';
windowEvents.storage({key:'btl-bookings'});
assert.equal(renderedCodes()[0],'live-booking','Open admin tab must show new bookings');
elements.bookingSearch.value = 'Test';
windowEvents.storage({key:'btl-bookings'});
assert(!renderedCodes().includes('live-booking'),'Keep active search when storage changes');
elements.bookingSearch.value = 'Live';
windowEvents.storage({key:'btl-movies'});
assert(!renderedCodes().includes('live-booking'),'Ignore unrelated data changes');
windowEvents.storage({key:'btl-bookings'});
assert.deepEqual(renderedCodes(),['live-booking']);
console.log('Live booking checks passed: automatic refresh and preserved search.');
