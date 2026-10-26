const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})}); const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root = process.env.BASE_URL || 'http://127.0.0.1:8000/';
 await page.addInitScript(() => sessionStorage.setItem('btl.loggedIn', 'true'));
 for(const [path,add,dialog,cancel] of [
 ['admin/movies/','#add','#movieEditor','#cancel'],
 ['admin/genres/','#addGenre','#genreEditor','#cancelGenre'],
 ['admin/showtimes/','#add','#screeningEditor','#movieReset'],
 ['admin/products/','#btn-add-product','#product-modal','.btn-secondary']]){
 await page.goto(root+path);await page.locator(add).click();assert(await page.locator(dialog).evaluate(e=>e.open));
 await page.mouse.click(2, 2);assert(!(await page.locator(dialog).evaluate(e=>e.open)));
 await page.locator(add).click();
 await page.keyboard.press('Escape');assert(!(await page.locator(dialog).evaluate(e=>e.open)));
 await page.locator(add).click();await page.locator(dialog).locator(cancel).click();assert(!(await page.locator(dialog).evaluate(e=>e.open)));
 }
 await page.goto(root+'admin/genres/');await page.locator('#addGenre').click();await page.locator('#genreName').fill('Test popup');await page.locator('#saveGenre').click();assert(!(await page.locator('#genreEditor').evaluate(e=>e.open)));assert(await page.locator('#genresTable').innerText().then(t=>t.includes('Test popup')));
 await page.goto(root+'admin/showtimes/');await page.locator('#add').click();await page.locator('#movieSelect').selectOption('9');await page.locator('#roomSelect').selectOption('1:1');await page.locator('#screeningDate').fill('2026-10-11');await page.locator('#showTime').fill('10:00');await page.locator('#ticketPrice').fill('75000');await page.locator('#movieSubmit').click();assert(!(await page.locator('#screeningEditor').evaluate(e=>e.open)));assert((await page.locator('#film').innerText()).includes('75.000'));
 await page.goto(root+'admin/booking/');assert.equal(await page.locator('#bookingAddBtn').count(),0);await page.locator('#bookingSearch').fill('nothing');assert(await page.locator('#bookingEmpty').isVisible());
 await page.goto(root+'admin/movies/');
 await page.locator('#add').click();
 const popup = page.locator('#movieEditor');
 await popup.evaluate(e => { e.scrollTop = e.scrollHeight; });
 const backgroundBefore = await page.evaluate(() => window.scrollY);
 await popup.hover();
 await page.mouse.wheel(0, 1500);
 await page.waitForTimeout(200);
 assert.equal(await page.evaluate(() => window.scrollY), backgroundBefore);
 assert.equal(await page.locator('html').evaluate(e => getComputedStyle(e).overflowY), 'hidden');
 await page.mouse.click(2, 2);
 assert(!(await popup.evaluate(e => e.open)));
 assert.equal(await page.locator('iframe').count(), 0);
 assert.deepEqual(errors,[]);await browser.close();console.log('Popup checks passed: open, Escape, cancel, save genre/screening, booking search.');
})().catch(e=>{console.error(e);process.exit(1)});
