const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../shared-state.js'), 'utf8');
function load(values = new Map(), storageError = false) {
  const context = {console: {warn() {}}, window: {}, crypto: webcrypto, TextEncoder, localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (storageError && key.startsWith('btl-customer')) throw Error('Storage blocked'); values.set(key, value); },
    removeItem: key => values.delete(key)
  }};
  vm.runInNewContext(source, context);
  return context.window.customerAuth;
}
(async () => {
  const values = new Map([['btl.loggedIn', 'true']]);
  const auth = load(values);
  for (const email of ['an@example.com', ' AN@Example.COM ', 'a+b@sub.example.vn']) assert(auth.isValidEmail(email));
  for (const email of ['', 'an', 'an@', 'an@domain', 'a b@example.com', 'a@@example.com']) assert(!auth.isValidEmail(email));
  const input = {fullName:'  Nguyễn   Văn An  ', phone:'0912345678', email:' An@Example.com ', password:'demoPass123', confirmPassword:'demoPass123', terms:true};
  assert.equal(auth.currentUser(), null);
  const user = await auth.register(input);
  assert.equal(user.email, 'an@example.com');
  assert.equal(user.fullName,'Nguyễn Văn An');
  assert.equal(auth.currentUser().givenName, 'An');
  assert.equal(load(values).currentUser().id, user.id, 'Login persists across pages');
  const saved = JSON.parse(values.get('btl-customers'));
  const legacyUser={...saved[0],surname:'Nguyễn Văn',givenName:'An'};
  delete legacyUser.fullName;
  const legacyValues=new Map([['btl-customers',JSON.stringify([legacyUser])],['btl-customer-session',legacyUser.id]]);
  assert.equal(load(legacyValues).currentUser().fullName,'Nguyễn Văn An');
  assert.equal((await load(legacyValues).login(input.email,input.password)).fullName,'Nguyễn Văn An');
  assert(!values.get('btl-customers').includes(input.password), 'Never persist plaintext password');
  assert(!('passwordHash' in user), 'Public account must exclude password material');
  await assert.rejects(auth.register(input), /Email đã được đăng ký/);
  auth.logout();
  assert.equal(auth.currentUser(), null);
  await assert.rejects(auth.login(input.email, 'wrongPass123'), /Email hoặc mật khẩu/);
  assert.equal(auth.currentUser(), null);
  assert.equal((await auth.login('AN@example.com', input.password)).id, user.id);
  const second = await auth.register({...input, email:'other@example.com'});
  assert.notEqual(second.id, user.id);
  const accounts = JSON.parse(values.get('btl-customers'));
  assert.notEqual(accounts[0].salt, accounts[1].salt, 'Every password has a distinct salt');
  for (const patch of [{fullName:' '}, {fullName:'A'.repeat(161)}, {phone:'abc'}, {email:'invalid'}, {password:'short'}, {confirmPassword:'different'}, {terms:false}]) {
    await assert.rejects(auth.register({...input, email:'new@example.com', ...patch}));
  }
  const before = values.get('btl-customers');
  await Promise.allSettled([auth.register({...input,email:'race@example.com'}), auth.register({...input,email:'race@example.com'})]);
  assert.equal(JSON.parse(values.get('btl-customers')).filter(user => user.email === 'race@example.com').length, 1);
  assert.equal(values.get('btl.loggedIn'), 'true', 'Customer logout never changes admin session');
  const corrupt = new Map([['btl-customers', '{broken']]);
  assert.equal(load(corrupt).currentUser(), null);
  await assert.rejects(load(corrupt).register(input), /Dữ liệu tài khoản/);
  assert.equal(corrupt.get('btl-customers'), '{broken', 'Corrupt data must not be overwritten');
  await assert.rejects(load(new Map(), true).register(input), /Storage blocked/);
  values.set('btl-customer-session', 'missing');
  assert.equal(load(values).currentUser(), null, 'Unknown sessions are signed out');
  assert(saved.length && before);
  console.log('Customer auth checks passed: register/login/logout, hashing, validation, duplicates, persistence and safe storage failures.');
})().catch(error => {console.error(error); process.exitCode = 1;});
