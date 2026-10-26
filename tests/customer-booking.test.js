const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../shared-state.js'), 'utf8');
function load(values = new Map()) {
  class TestDate extends Date {
    constructor(...args) {super(...(args.length ? args : ['2026-10-20T00:30:00']));}
    static now() {return new TestDate().getTime();}
  }
  const context = {window:{}, Date:TestDate, crypto:webcrypto, TextEncoder, localStorage:{
    getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,value), removeItem:key => values.delete(key)
  }};
  vm.runInNewContext(source, context);
  return context.window;
}
(async () => {
  const values = new Map();
  const win = load(values);
  const state = win.cinemaState;
  const api = state.booking;
  assert(state.rooms.every(room => room.seats === 124));
  const oldRooms = new Map([['btl-theaters',JSON.stringify([{id:'custom',name:'Tên giữ nguyên',seats:[100,300],rooms:[{code:'x',seats:100}]}])]]);
  const migrated = load(oldRooms).cinemaState.theaters[0];
  assert.equal(migrated.name,'Tên giữ nguyên');
  assert(migrated.seats.every(count=>count===124));
  assert.equal(migrated.rooms[0].seats,124);
  const show = state.screenings.find(show => show.movieId === '5' && show.date === '2026-10-20');
  assert(show);
  const seats = api.seatPlan(show.id);
  const room = api.details(show.id).room;
  assert.equal(seats.length, room.seats);
  assert.equal(new Set(seats.map(seat => seat.id)).size, room.seats);
  const regular = seats.find(seat => seat.type === 'standard');
  const vip = seats.find(seat => seat.type === 'vip');
  const couple = seats.filter(seat => seat.pair === seats.at(-1).pair);
  assert.equal(api.quote(show.id, [regular.id]).total, show.price);
  assert.equal(api.quote(show.id, [vip.id]).total, show.price + 10000);
  assert.equal(api.quote(show.id, couple.map(seat => seat.id)).total, (show.price + 15000) * 2);
  for (const ids of [[], ['Z999'], [regular.id,regular.id], [couple[0].id]]) assert.throws(() => api.quote(show.id, ids));
  const request = {screeningId:show.id, seatIds:[regular.id,vip.id], paymentMethod:'vnpay', acceptedTerms:true, expiresAt:Date.parse('2026-10-20T00:40:00'), requestId:'test-request-1'};
  await assert.rejects(api.placeBooking(request), /đăng nhập/);
  const account = await win.customerAuth.register({fullName:'Khách Thử',phone:'0900000000',email:'booking@example.com',password:'demoPass123',confirmPassword:'demoPass123',terms:true});
  for (const patch of [{paymentMethod:'fake'}, {acceptedTerms:false}, {expiresAt:Date.parse('2026-10-20T00:20:00')}, {seatIds:['Z999']}]) await assert.rejects(api.placeBooking({...request,...patch}));
  const before = state.bookings.length;
  const receipt = await api.placeBooking({...request,total:1});
  assert.equal(state.bookings.length, before + 1);
  assert.equal(receipt.total, show.price*2+10000, 'Compute prices, ignore caller total');
  assert.equal(receipt.customerId, account.id);
  assert.equal(receipt.seats, 2);
  assert.match(receipt.code,/^UCC_20_[A-Z0-9]{10}$/);
  assert.equal(receipt.paymentMode, 'demo');
  assert.deepEqual(Array.from(receipt.seatLabels), request.seatIds);
  assert.equal((await api.placeBooking(request)).code, receipt.code, 'Retry is idempotent');
  assert.equal(state.bookings.length, before+1);
  const other = load(values).cinemaState.booking;
  assert(other.reservedSeats(show.id).includes(regular.id));
  await assert.rejects(other.placeBooking({...request,requestId:'test-request-2'}), /đã được đặt/);
  const evening = state.screenings.find(item => item.movieId === '5' && item.date === '2026-10-20' && item.time === '19:30');
  assert(!other.reservedSeats(evening.id).includes(regular.id),'Different screenings do not share customer seats');
  assert.throws(() => api.details('missing'));
  const old = {...show,id:'past-show',date:'2026-10-19'};
  state.saveScreenings([...state.screenings,old]);
  assert.throws(() => api.details(old.id), /đã qua/);
  state.saveBookings(state.bookings.map(item => item.code === receipt.code ? {...item,ticket:'Đã hủy'} : item));
  assert(!api.reservedSeats(show.id).includes(regular.id), 'Cancelled tickets release customer seats');
  assert.equal(api.reservedSeats(show.id).length,0,'Cancelled customer seats are released');
  assert.equal(state.bookings.filter(item=>item.originalDemo).length,9,'Keep exactly nine original demo customers');
  for (const [index, paymentMethod] of ['momo','card'].entries()) {
    const ticket = await api.placeBooking({...request, seatIds:['A'+(index+2)], paymentMethod, requestId:'method-'+paymentMethod});
    assert.equal(ticket.paymentMethod,paymentMethod);
  }
  const attempted = await Promise.allSettled([
    api.placeBooking({...request,seatIds:['B1'],requestId:'parallel-1'}),
    api.placeBooking({...request,seatIds:['B1'],requestId:'parallel-2'})
  ]);
  assert.equal(attempted.filter(result=>result.status==='fulfilled').length,1,'Only one request can book the same seat');
  console.log('Customer booking checks passed: capacity, prices, pairs, auth, expiry, duplicate seats, retries and admin-compatible receipts.');
})().catch(error => {console.error(error);process.exitCode=1;});
