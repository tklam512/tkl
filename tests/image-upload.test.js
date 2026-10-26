const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => sessionStorage.setItem('btl.loggedIn', 'true'));
    const root = process.env.BASE_URL || 'http://127.0.0.1:8000/';
    const errors = [];
    const alerts = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.accept(); });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1sAAAAASUVORK5CYII=', 'base64');
    for (const [file, add, input, drop, preview] of [
      ['admin/products/', '#btn-add-product', '#product-image', '#product-image-drop', '#product-image-preview'],
      ['admin/movies/', '#add', '#posterFile', '#posterDrop', '#posterPreview']
    ]) {
      await page.goto(root + file);
      await page.locator(add).click();
      assert.equal(await page.locator(input).evaluate(e => getComputedStyle(e, '::file-selector-button').backgroundColor), 'rgb(215, 44, 44)');
      await page.locator(input).setInputFiles({ name: 'picked.png', mimeType: 'image/png', buffer: png });
      await page.waitForFunction(selector => document.querySelector(selector).src.startsWith('data:image/png'), preview);
      const picked = await page.locator(preview).getAttribute('src');
      await page.locator(input).setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
      assert.equal(await page.locator(preview).getAttribute('src'), picked);
      await page.locator(input).setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
      assert.equal(await page.locator(preview).getAttribute('src'), picked);
      await page.locator(drop).evaluate((element, bytes) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File([new Uint8Array(bytes)], 'dropped.png', { type: 'image/png' }));
        element.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: transfer }));
        element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
      }, [...png]);
      await page.waitForFunction(selector => document.querySelector(selector).files[0]?.name === 'dropped.png', input);
      await page.waitForFunction(selector => document.querySelector(selector).src.startsWith('data:image/png'), preview);
      if (file.startsWith('admin/products')) {
        await page.locator('#product-name').fill('Ảnh kiểm tra');
        await page.locator('#product-price').fill('10000');
        await page.locator('#product-stock').fill('2');
        await page.waitForFunction(() => !productPage.imageLoading);
        await page.locator('[type="submit"]').click();
        assert.equal(await page.evaluate(() => productPage.data.at(-1).image), picked);
        await page.evaluate(() => productPage.editProduct(productPage.data.at(-1).id));
        assert.equal(await page.locator(preview).getAttribute('src'), picked);
        await page.locator('[type="submit"]').click();
        assert.equal(await page.evaluate(() => productPage.data.at(-1).image), picked);
        await page.locator(add).click();
        assert(await page.locator(preview).isHidden());
        await page.evaluate(() => { productPage.imageLoading = true; productPage.saveProduct({ preventDefault() {} }); });
        assert(await page.locator('#product-modal').evaluate(e => e.open));
      } else {
        await page.locator('#removePoster').click();
        assert(await page.locator(preview).isHidden());
      }
    }
    assert.equal(alerts.filter(text => text.includes('không quá 5MB')).length, 4);
    assert(alerts.some(text => text.includes('đang được đọc')));
    assert.deepEqual(errors, []);
    console.log('Image upload checks passed: picker, drop, validation, preview, product save/edit/reset and movie removal.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
