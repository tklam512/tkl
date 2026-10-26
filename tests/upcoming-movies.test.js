const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'../shared-state.js'),'utf8');
const expected = new Map([['Clayface','2026-10-23'],['Klara và Mặt Trời','2026-10-23'],['Huyết Thống','2026-10-30'],['Án Mạng Karaoke','2026-10-30']]);
function load(values) {
  values.set('btl-refresh-catalog-20261019', 'true');
  const context = {window:{},console,localStorage:{getItem:key=>key.startsWith('btl-original-nine-seats-') || key==='btl-booking-code-ucc-20261020'?'true':values.get(key)??null,setItem:(key,value)=>values.set(key,value)}};
  vm.runInNewContext(source,context);
  return context.window.cinemaState;
}
const state = load(new Map());
for (const [title,date] of expected) {
  const movie = state.movies.find(movie=>movie.title===title);
  assert.ok(movie, `Missing upcoming movie: ${title}`);
  assert.equal(movie.date,date);
  assert.equal(state.movieStatus(movie,'2026-10-19'),'soon');
  assert.ok(fs.existsSync(path.join(__dirname,'../admin/movies',movie.poster)));
}
const custom = {id:'custom',title:'Phim tự thêm',duration:90,date:'2026-01-01',genres:[]};
const values = new Map([['btl-movies',JSON.stringify([custom])]]);
const imported = load(values);
assert.equal(imported.movies.length,5);
assert.equal(imported.movies[0].title,custom.title);
assert.equal(load(values).movies.length,5,'Reload must not import duplicates');
imported.saveMovies(imported.movies.filter(movie=>movie.title!=='Clayface'));
assert.equal(load(values).movies.some(movie=>movie.title==='Clayface'),false,'Admin deletions must survive reload');
const edited = {...state.movies.find(movie=>movie.title==='Clayface'),title:'Clayface đã sửa'};
const old = new Map([['btl-movies',JSON.stringify([edited])]]);
assert.equal(load(old).movies.find(movie=>movie.id===edited.id).title,edited.title);
assert.equal(load(old).movies.length,4);
const duplicate = new Map([['btl-movies',JSON.stringify([{...custom,title:'CLAYFACE'}])]]);
assert.equal(load(duplicate).movies.length,4,'Existing title must not be imported twice');
console.log('Upcoming movie checks passed: UCC data/posters, one-time import, existing edits and persistent deletion.');
