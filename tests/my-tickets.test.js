const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const values = new Map();
const context = {window:{},crypto:webcrypto,TextEncoder,localStorage:{
  getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)
}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../shared-state.js'),'utf8'),context);
(async () => {
  const {cinemaState:state,customerAuth:auth}=context.window;
  assert.deepEqual(Array.from(state.myBookings),[]);
  const input={fullName:'Khách Một',phone:'0900000000',email:'one@example.com',password:'demoPass123',confirmPassword:'demoPass123',terms:true};
  const one=await auth.register(input);
  const two=await auth.register({...input,fullName:'Khách Hai',email:'two@example.com'});
  const bookings=[
    {code:'first',customerId:one.id,createdAt:'2026-10-19T09:00:00Z'},
    {code:'other',customerId:two.id,createdAt:'2026-10-20T09:00:00Z'},
    {code:'latest',customerId:one.id,createdAt:'2026-10-20T10:00:00Z'},
    {code:'legacy',customer:'Khách Một',originalDemo:true}
  ];
  state.saveBookings(bookings);
  assert.deepEqual(Array.from(state.myBookings,booking=>booking.code),['other']);
  await auth.login(input.email,input.password);
  assert.deepEqual(Array.from(state.myBookings,booking=>booking.code),['latest','first']);
  assert.equal(values.get('btl-bookings'),JSON.stringify(bookings),'Do not rewrite stored order');
  auth.logout();
  assert.deepEqual(Array.from(state.myBookings),[],'No personal tickets while logged out');
  console.log('My tickets checks passed: current account only, latest first, no legacy-name matches and logout.');
})().catch(error=>{console.error(error);process.exitCode=1;});
