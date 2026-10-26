const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname,'../shared-state.js'),'utf8');
function load(values = new Map(), day = '2026-10-20') {
  class TestDate extends Date {
    constructor(...args) {super(...(args.length ? args : [day+'T00:30:00']));}
    static now() {return new TestDate().getTime();}
  }
  const context = {window:{},Date:TestDate,crypto:webcrypto,TextEncoder,localStorage:{
    getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)
  }};
  vm.runInNewContext(source,context);
  return context.window.cinemaState;
}
const values = new Map();
const state = load(values);
const names = ['Đoàn Danh Thái','Phạm Ngọc Linh','Phạm Nguyễn Minh Chi','Nguyễn Đức Nam','Trần Minh Hoàng','Hạ Quỳnh Như','Nguyễn Thảo Nhi','Lê Yến Mai','Vũ Thị Minh Anh'];
assert.equal(state.bookings.length,9);
assert.deepEqual(Array.from(state.bookings,booking=>booking.customer).sort(),names.sort());
assert(state.bookings.every(booking=>booking.originalDemo && !booking.demoSeatSeed));
assert(state.bookings.every(booking=>/^UCC_20_[A-Z0-9]{10}$/.test(booking.code)));
assert.equal(new Set(state.bookings.map(booking=>booking.code)).size,9);
for (const booking of state.bookings) {
  assert.equal(booking.seatLabels.length,booking.seats);
  assert.equal(booking.total,(state.booking.details(booking.screeningId).show.price+10000)*booking.seats);
  assert(state.booking.reservedSeats(booking.screeningId).includes(booking.seatLabels[0]));
  assert.throws(()=>state.booking.quote(booking.screeningId,[booking.seatLabels[0]]),/đã được đặt/);
}
assert(state.screenings.some(show=>state.booking.reservedSeats(show.id).length===0),'Some rooms and screenings should be empty');
const before=JSON.stringify(state.bookings);
assert.equal(JSON.stringify(load(values).bookings),before,'Reload must not add people or change seats');
const removed=state.bookings[0];
state.saveBookings(state.bookings.filter(booking=>booking.code!==removed.code));
assert.equal(load(values).bookings.length,8,'Deleted original customers must not reappear');
const tomorrow=load(values,'2026-10-21');
assert.equal(tomorrow.bookings.length,8,'New day must not multiply customers');
assert(tomorrow.bookings.every(booking=>booking.showtime.startsWith('21/10/2026')));
const fresh=load();
const real={code:'UCC_20_1234ABCDEF',customerId:'customer-real',customer:'Khách tự đặt',movie:'Phim giữ nguyên',screeningId:fresh.bookings[0].screeningId,seatLabels:['D3'],seats:1,total:85000,ticket:'Đã xác nhận'};
const excess={code:'UCC_20_ABC1234567',demoSeatSeed:true,customer:'Khách demo',screeningId:real.screeningId,seatLabels:['G7'],seats:1,total:85000};
const oldValues=new Map([['btl-bookings',JSON.stringify([...fresh.bookings,excess,real])]]);
const migrated=load(oldValues);
assert.equal(migrated.bookings.length,10,'Only nine original bookings plus the customer booking remain');
assert(!migrated.bookings.some(booking=>booking.demoSeatSeed));
assert.equal(JSON.stringify(migrated.bookings.find(booking=>booking.customerId==='customer-real')),JSON.stringify(real),'Keep real customer booking untouched');
const allTaken=migrated.bookings.filter(booking=>booking.screeningId===real.screeningId).flatMap(booking=>booking.seatLabels);
assert.equal(new Set(allTaken).size,allTaken.length,'Original samples must not overlap real customer seats');
console.log('Original demo-seat checks passed: only nine customers, empty screenings, daily mapping, excess cleanup and real bookings preserved.');
