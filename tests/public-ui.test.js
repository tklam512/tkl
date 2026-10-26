const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Ho_Chi_Minh'});
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    const root = process.env.BASE_URL || 'http://127.0.0.1:8000';
    async function visit(route) {
      await page.goto(root+route);
      await page.locator(route.startsWith('/admin/') ? '#mainContent h2' : 'h1').first().waitFor();
      assert.equal(await page.locator('iframe').count(),0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `Horizontal overflow: ${route}`);
      if (!route.startsWith('/admin/')) {
        const footer = await page.locator('#site-footer').evaluate(element => {
          const logo = element.querySelector('.footer-platforms > img').getBoundingClientRect();
          const bounds = element.getBoundingClientRect();
          return {logoWidth:logo.width,logoHeight:logo.height,height:bounds.height,center:Math.abs((logo.left+logo.width/2)-innerWidth/2),bottom:bounds.bottom};
        });
        assert(footer.logoWidth <= 120 && footer.logoHeight <= 46, `Footer logo too large: ${route}`);
        assert(footer.center < 2, `Footer logo not centered: ${route}`);
        assert(footer.height < 330, `Footer too tall: ${route}`);
        assert(footer.bottom >= page.viewportSize().height - 1, `Footer floats above viewport bottom: ${route}`);
      }

    }
    await visit('/');
    assert.equal(await page.locator('.hero-slide:visible').count(),1);
    assert.equal(await page.locator('#main-nav a[href="/news/"], #main-nav a[href="/festivals/"], #main-nav a[href="/promotions/"], .footer-nav a[href="/news/"]').count(),0);
    assert.equal(await page.getByRole('heading',{name:'Tin tức',exact:true}).count(),0);
    assert.equal(await page.locator('.home-events, .home-sidebar').count(),0);
    assert.equal(await page.getByRole('heading',{name:'Khuyến mãi',exact:true}).count(),0);
    await page.locator('.hero-next').click();
    assert.equal(await page.locator('.hero-dots button[aria-pressed="true"]').getAttribute('aria-label'),'Người Mẹ Khác');
    await page.locator('.hero-prev').click();
    await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => { image.loading='eager'; return image.decode().catch(()=>{}); })); });
    const footerImage = page.locator('.footer-platforms > img');
    assert(await footerImage.evaluate(image => {
      const bounds = image.getBoundingClientRect();
      return Math.abs(bounds.width / bounds.height - image.naturalWidth / image.naturalHeight) < 0.01;
    }), 'Footer certification logo must preserve its original aspect ratio');
    await page.screenshot({path:'/tmp/btl-public-desktop.png',fullPage:true});
    for (const route of ['/movies/','/ticket-price/','/about/','/login/','/register/','/movies/detail/?id=15']) {
      await visit(route);
      await page.locator('img').evaluateAll(async images=>{ await Promise.all(images.map(image=>{ image.loading='eager'; return image.decode().catch(()=>{}); })); });
      const broken = await page.locator('img').evaluateAll(images=>images.filter(image=>!image.naturalWidth).map(image=>image.src));
      assert.deepEqual(broken,[], `Broken images: ${route}`);
      if (route === '/movies/') await page.screenshot({path:'/tmp/btl-public-'+route.split('/')[1]+'.png',fullPage:true});
    }
    await visit('/ticket-price/');
    const priceBackgrounds = await page.locator('.price-chart img').evaluateAll(images =>
      images.map(image => getComputedStyle(image).backgroundColor.match(/\d+/g).slice(0,3).map(Number)));
    assert(priceBackgrounds.every(rgb => rgb.every(channel => channel < 64)),
      'Transparent price charts need a dark background behind their white labels');
    await page.getByText('Xem bảng giá dạng văn bản',{exact:true}).first().click();
    assert(await page.getByRole('table').first().isVisible());
    assert.equal(await page.getByRole('table').first().locator('tbody tr').count(),4);
    await page.screenshot({path:'/tmp/btl-ticket-price-fixed.png',fullPage:true});
    await visit('/movies/?status=soon');
    assert.equal(await page.locator('.schedule-film').count(),4);
    assert(await page.getByRole('heading',{name:'Clayface',exact:true}).isVisible());
    await visit('/movies/detail/?id=11248');
    assert(await page.getByRole('heading',{name:'Clayface',exact:true}).isVisible());
    assert(await page.locator('.detail-poster').evaluate(async image => { await image.decode(); return image.naturalWidth>0; }));
    await visit('/movies/');
    assert.equal(await page.locator('[data-date], #theater-filter').count(),0);
    assert.match(await page.locator('.schedule-date').innerText(),/Lịch chiếu hôm nay/);
    assert.equal(await page.locator('.schedule-date time').getAttribute('datetime'),await page.evaluate(()=>cinemaState.today()));
    await page.getByRole('searchbox').fill('không tồn tại 123');
    assert(await page.getByText('Không tìm thấy phim phù hợp').isVisible());
    await page.getByRole('searchbox').fill('Street');
    assert.equal(await page.locator('.schedule-film').count(),1);
    assert.equal(await page.locator('.showtime-list li').count(),2);
    // Admin and user pages consume the same catalog and screenings, without resetting on navigation.
    await page.addInitScript(()=>sessionStorage.setItem('btl.loggedIn','true'));
    await visit('/admin/showtimes/');
    await page.evaluate(()=>{
      const date=cinemaState.today();
      cinemaState.saveScreenings([{id:'public-ui-test',movieId:'15',theaterId:'1',room:1,date,time:'19:30',price:75000}]);
    });
    await visit('/movies/detail/?id=15');
    assert.equal(await page.locator('.detail-backdrop').getAttribute('src'), '/assets/ucc/banner-412.webp');
    await page.getByRole('link',{name:'Xem lịch chiếu',exact:true}).click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#schedule').getBoundingClientRect().top - 110) < 4 || window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4);
    assert.equal(await page.locator('[data-date]').count(),0);
    assert.equal(await page.locator('.schedule-date time').getAttribute('datetime'),await page.evaluate(()=>cinemaState.today()));
    assert(await page.getByText('19:30',{exact:true}).isVisible());
    assert.equal(await page.getByText('Galaxy Cinema Hanoi Centre',{exact:false}).count(),0);
    assert(await page.getByText('Phòng 1',{exact:true}).isVisible());
    await visit('/movies/detail/?id=missing');
    assert(await page.getByText('Không tìm thấy phim',{exact:true}).isVisible());
    await visit('/register/');
    await page.getByLabel('Email',{exact:true}).fill('invalid@domain');
    await page.getByLabel('Mật khẩu',{exact:true}).fill('demoPass123');
    assert.match(await page.locator('#email-error').innerText(), /định dạng/);
    assert.equal(await page.getByLabel('Email',{exact:true}).getAttribute('aria-invalid'), 'true');
    assert.equal(await page.getByLabel('Mật khẩu',{exact:true}).getAttribute('type'), 'password');
    await page.getByRole('button',{name:'Hiện mật khẩu',exact:true}).click();
    assert.equal(await page.getByLabel('Mật khẩu',{exact:true}).getAttribute('type'), 'text');
    assert.equal(await page.getByLabel('Mật khẩu',{exact:true}).inputValue(), 'demoPass123');
    assert.equal(await page.getByLabel('Nhập lại mật khẩu',{exact:true}).getAttribute('type'), 'password');
    await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).click();
    assert.equal(await page.getByLabel('Mật khẩu',{exact:true}).getAttribute('type'), 'password');
    await page.getByLabel('Họ và tên',{exact:true}).fill('Kiểm Tra');
    await page.getByLabel('Số điện thoại').fill('0900000000');
    await page.getByLabel('Email',{exact:true}).fill('preview@example.com');
    await page.getByLabel('Mật khẩu',{exact:true}).fill('test12345');
    await page.getByLabel('Nhập lại mật khẩu',{exact:true}).fill('wrong123');
    await page.getByRole('checkbox').check();
    await page.getByRole('button',{name:'Đăng ký',exact:true}).click();
    assert.equal(await page.getByLabel('Nhập lại mật khẩu',{exact:true}).evaluate(e=>e.validity.customError),true);
    // Editing either password must clear a previous mismatch error.
    await page.getByLabel('Mật khẩu',{exact:true}).fill('wrong123');
    await page.getByRole('button',{name:'Đăng ký',exact:true}).click();
    await page.waitForURL(root + '/');
    assert(await page.getByText('Chào Tra', {exact:true}).isVisible());
    assert.equal(await page.evaluate(()=>localStorage.getItem('btl-customers').includes('wrong123')),false);
    await page.getByRole('button', {name:'Đăng xuất',exact:true}).click();
    await visit('/login/');
    await page.getByLabel('Email',{exact:true}).fill('preview@example.com');
    await page.getByLabel('Mật khẩu',{exact:true}).fill('test12345');
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
    await page.getByText('Email hoặc mật khẩu không đúng.', {exact:true}).waitFor();
    await page.getByLabel('Mật khẩu',{exact:true}).fill('wrong123');
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
    await page.waitForURL(root + '/');
    await page.reload();
    assert(await page.getByText('Chào Tra', {exact:true}).isVisible());
    await page.getByRole('button', {name:'Đăng xuất',exact:true}).click();
    const originalMovies = await page.evaluate(() => cinemaState.movies);
    await page.evaluate(() => cinemaState.saveMovies(cinemaState.movies.filter(movie => movie.id !== 15)));
    await visit('/');
    assert.equal(await page.locator('.hero-slide').count(),2);
    await page.evaluate(() => cinemaState.saveMovies(cinemaState.movies.filter(movie => ![9,11].includes(movie.id))));
    await visit('/');
    assert.equal(await page.locator('.hero').count(),0);
    await page.evaluate(movies => cinemaState.saveMovies(movies),originalMovies);
    for (const width of [768,390]) {
      await page.setViewportSize({width,height:900});
      await visit('/');
      await page.getByRole('button',{name:'Mở menu',exact:true}).click();
      assert(await page.locator('#main-nav').isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#main-nav').isVisible(),false);
      for (const route of ['/movies/','/movies/detail/?id=15','/ticket-price/','/register/']) await visit(route);
      await visit('/');
      await page.screenshot({path:`/tmp/btl-public-${width}.png`,fullPage:true});
      await page.screenshot({path:`/tmp/btl-public-${width}-viewport.png`});
    }
    await visit('/login/');
    await page.getByRole('link',{name:'Bạn thuộc UCC?',exact:true}).click();
    await page.locator('#username').waitFor();
    assert.match(page.url(),/\/admin\/login\//);
    assert.deepEqual(failed,[]);
    assert.deepEqual(errors,[]);
    await context.close();
    console.log('Public browser checks passed: routes/assets, search, carousel, shared admin data, empty states, form previews and 3 viewport sizes.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
