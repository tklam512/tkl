(() => {
  const main = document.getElementById("main");
  const page = document.body.dataset.page;
  const site = cinemaState.site;

  // Hàm hỗ trợ xử lý văn bản, ngày tháng và giá tiền.
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => (({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]));

  const dateText = value => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value.split("-").reverse().join("/") : "";

  const money = value => new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(value);

  const filmLink = movie => "/movies/detail/?id=" + encodeURIComponent(movie.id);

  function poster(movie) {
    const value = movie.poster || "";

    if (/^data:image\/(png|jpeg|gif|webp);base64,/i.test(value))
      return escape(value);

    const url = new URL(value || "/assets/ucc/logo.png", window.location.origin + "/admin/movies/");
    return ["http:", "https:"].includes(url.protocol) ? escape(url.href) : "/assets/ucc/logo.png";
  }

  function empty(title, detail = "", heading = "h2") {
    return `<div class="empty-state"><${heading}>${escape(title)}</${heading}>${detail ? `<p>${escape(detail)}</p>` : ""}</div>`;
  }

  // Tạo menu và đánh dấu trang đang xem.
  const activePath = page === "movie-detail" ? "/movies/" : window.location.pathname;

  document.getElementById("site-header").innerHTML = `
    <div class="header-inner">
      <a class="brand" href="/" aria-label="UCC, trang chủ"><img src="/assets/ucc/logo.png" alt="UTC Cinema" width="132" height="48"></a>
      <button class="menu-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Mở menu">☰</button>
      <nav id="main-nav" aria-label="Điều hướng chính">${site.navigation.map(
  ([href, label]) => `<a href="${href}"${activePath === href ? ' aria-current="page"' : ""}>${escape(label)}</a>`
).join("")}</nav>
      <div class="account-links"><a class="button button-outline" href="/register/">Đăng ký</a><a class="button button-primary" href="/login/">Đăng nhập</a></div>
    </div>`;

  // Cập nhật tài khoản và xử lý đăng xuất.
  function renderAccount() {
    const links = document.querySelector(".account-links");
    const user = customerAuth.currentUser();
    document.querySelector("[data-my-tickets]")?.remove();

    if (user) document.getElementById("main-nav").insertAdjacentHTML(
      "beforeend",
      `<a href="/my-tickets/" data-my-tickets${page === "my-tickets" ? ' aria-current="page"' : ""}>Vé của tôi</a>`
    );

    links.innerHTML = user ? `<span class="account-name" title="${escape(user.fullName)}">Chào ${escape(user.givenName)}</span><button type="button" class="button button-primary" id="customer-logout">Đăng xuất</button>` : '<a class="button button-outline" href="/register/">Đăng ký</a><a class="button button-primary" href="/login/">Đăng nhập</a>';

    document.getElementById("customer-logout")?.addEventListener("click", () => {
      try {
        customerAuth.logout();
        renderAccount();

        if (page === "booking")
          location.reload();
        else if (page === "my-tickets")
          myTickets();
      } catch {
        window.alert("Không thể đăng xuất. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.");
      }
    });
  }

  renderAccount();

  window.addEventListener("storage", event => {
    if (event.key === null || ["btl-customer-session", "btl-customers"].includes(event.key))
      renderAccount();

    if (page === "my-tickets" && (event.key === null || ["btl-customer-session", "btl-customers", "btl-bookings"].includes(event.key)))
      myTickets();
  });

  window.addEventListener("pageshow", () => {
    renderAccount();

    if (page === "my-tickets")
      myTickets();
  });

  const menuButton = document.querySelector(".menu-toggle");

  // Đóng, mở menu trên màn hình nhỏ.
  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    document.getElementById("main-nav").classList.remove("is-open");
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    document.getElementById("main-nav").classList.toggle("is-open", open);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape")
      closeMenu();
  });

  // Hiển thị thông tin liên hệ ở chân trang.
  document.getElementById("site-footer").innerHTML = `
    <div class="container footer-inner">
      <nav class="footer-nav" aria-label="Thông tin">${[
  ["/about/#policy", "Chính sách"],
  ["/movies/", "Lịch chiếu"],
  ["/ticket-price/", "Giá vé"],
  ["/about/#faq", "Hỏi đáp"],
  ["/about/#contact", "Liên hệ"]
].map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav>
      <div class="footer-platforms"><img src="/assets/ucc/certification.png" alt="Đã thông báo Bộ Công Thương" width="108" height="41" loading="lazy"></div>
      <p>Cơ quan chủ quản: ${escape(site.owner)}</p><p>Trung tâm Chiếu phim Giao thông vận tải · UTC Cinema Center</p><p>Địa chỉ: ${escape(site.address)} · Điện thoại: <a href="tel:02437663311">${escape(site.phone)}</a></p>
      <p class="footer-credit">Giao diện bài tập lớn tham khảo NCC. Hình ảnh thuộc các chủ sở hữu tương ứng.</p>
    </div>`;

  // Tạo thẻ phim và tiêu đề dùng chung cho các trang.
  function movieCard(movie) {
    return `<article class="movie-card"><a class="poster-link" href="${filmLink(movie)}"><img src="${poster(movie)}" alt="Poster ${escape(movie.title)}" width="300" height="450" loading="lazy"><span class="format-badge">2D</span>${movie.age ? `<span class="age-badge">${escape(movie.age)}</span>` : ""}<span class="poster-action">Xem chi tiết</span></a><div class="movie-meta"><span>${escape(movie.genres?.slice(0, 2).join(", "))}</span><time datetime="${escape(movie.date)}">${dateText(movie.date)}</time></div><h3><a href="${filmLink(movie)}">${escape(movie.title)}</a></h3></article>`;
  }

  function sectionHeading(title, href = "") {
    return `<div class="section-heading"><h2><span class="section-dot" aria-hidden="true"></span>${title}</h2>${href ? `<a href="${href}">Xem tất cả <span aria-hidden="true">→</span></a>` : ""}</div>`;
  }

  // Hiển thị trang chủ và chuyển banner phim.
  function home() {
    const movies = [...cinemaState.movies].sort((a, b) => b.date.localeCompare(a.date));
    const showing = movies.filter(movie => cinemaState.movieStatus(movie) === "showing");
    const soon = movies.filter(movie => cinemaState.movieStatus(movie) === "soon");
    const banners = site.banners.filter(banner => movies.some(movie => String(movie.id) === String(banner.movieId)));

    main.innerHTML = `<h1 class="sr-only">Trung tâm Chiếu phim Giao thông vận tải</h1>
      ${banners.length ? `<section class="hero" aria-label="Phim nổi bật" aria-roledescription="băng chuyền">
        <div class="hero-slides">${banners.map(
  (banner, index) => `<a class="hero-slide" href="/movies/detail/?id=${banner.movieId}"${index ? " hidden" : ""}><img src="${banner.image}" alt="${escape(banner.title)}" width="1920" height="1080" ${index ? 'loading="lazy"' : 'fetchpriority="high"'}></a>`
).join("")}</div>
        <button class="hero-prev" aria-label="Banner trước">‹</button><button class="hero-next" aria-label="Banner tiếp theo">›</button>
        <div class="hero-dots" role="group" aria-label="Chọn banner">${banners.map(
  (banner, index) => `<button aria-label="${escape(banner.title)}" aria-pressed="${index === 0}"></button>`
).join("")}</div>
        <p id="banner-status" class="sr-only" aria-live="polite"></p>
      </section>` : ""}
      <div class="container home-layout"><div class="home-films"><section>${sectionHeading("Phim đang chiếu", "/movies/")}<div class="poster-grid">${showing.length ? showing.slice(0, 8).map(movieCard).join("") : empty("Chưa có phim đang chiếu", "Hãy quay lại để xem danh sách phim mới.")}</div></section>
      <section>${sectionHeading("Phim sắp chiếu", "/movies/?status=soon")}<div class="poster-grid">${soon.length ? soon.slice(0, 4).map(movieCard).join("") : empty("Lịch phim sắp chiếu đang được cập nhật")}</div></section></div></div>`;

    if (!banners.length)
      return;

    let current = 0;
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dots button");

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.hidden = i !== current;
      });

      dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === current)));
      document.getElementById("banner-status").textContent = banners[current].title;
    }

    document.querySelector(".hero-prev").onclick = () => show(current - 1);
    document.querySelector(".hero-next").onclick = () => show(current + 1);

    dots.forEach((dot, index) => {
      dot.onclick = () => show(index);
    });
  }

  function todayLabel(date) {
    return `<p class="schedule-date">Lịch chiếu hôm nay · <time datetime="${date}">${dateText(date)}</time></p>`;
  }

  // Hiển thị giờ chiếu và đường dẫn đặt vé.
  function showtimes(movie, date) {
    const shows = cinemaState.screenings.filter(show => String(show.movieId) === String(movie.id) && show.date === date).sort((a, b) => a.time.localeCompare(b.time));

    if (!shows.length)
      return '<p class="schedule-empty">Chưa có suất chiếu cho ngày này.</p>';

    return `<ul class="showtime-list">${shows.map(
  show => `<li>${Date.parse(show.date + "T" + show.time) <= Date.now() ? '<span class="showtime-past">' : `<a class="showtime-link" href="/booking/?screening=${encodeURIComponent(show.id)}" aria-label="Đặt vé lúc ${escape(show.time)}">`}<strong>${escape(show.time)}</strong><span>${escape(
  cinemaState.rooms.find(room => room.theaterId === show.theaterId && room.room === show.room)?.name || "Phòng " + show.room
)}</span><span>${money(show.price)}</span>${Date.parse(show.date + "T" + show.time) <= Date.now() ? "<span>Đã qua giờ chiếu</span></span>" : "</a>"}</li>`
).join("")}</ul><p class="schedule-note">Chọn giờ chiếu để chọn ghế và đặt vé.</p>`;
  }

  // Lọc danh sách phim theo trạng thái và tên phim.
  function movies() {
    const query = new URLSearchParams(location.search);
    let status = ["soon", "all"].includes(query.get("status")) ? query.get("status") : "showing";
    const date = cinemaState.today();

    main.innerHTML = `<div class="container page-content"><h1 class="page-title">Phim đang chiếu</h1><div class="movie-tabs" aria-label="Trạng thái phim">${[["showing", "Đang chiếu"], ["soon", "Sắp chiếu"], ["all", "Tất cả phim"]].map(
  ([value, label]) => `<button data-status="${value}" aria-pressed="${status === value}">${label}</button>`
).join("")}</div>${todayLabel(date)}<div class="movie-filters"><label><span class="sr-only">Tìm tên phim</span><input type="search" id="movie-search" placeholder="Tìm tên phim…"></label></div><div id="movie-results" aria-live="polite"></div></div>`;

    const input = document.getElementById("movie-search");

    function render() {
      const keyword = input.value.trim().toLocaleLowerCase("vi");

      const selected = cinemaState.movies.filter(
        movie => (status === "all" || cinemaState.movieStatus(movie) === status) && movie.title.toLocaleLowerCase("vi").includes(keyword)
      ).sort((a, b) => b.date.localeCompare(a.date));

      document.querySelector("h1").textContent = status === "soon" ? "Phim sắp chiếu" : status === "all" ? "Tất cả phim" : "Phim đang chiếu";

      document.getElementById("movie-results").innerHTML = selected.length ? selected.map(
        movie => `<article class="schedule-film"><a class="schedule-poster" href="${filmLink(movie)}"><img src="${poster(movie)}" alt="Poster ${escape(movie.title)}" width="220" height="330" loading="lazy"></a><div class="schedule-info"><p class="film-label"><span class="outline-badge">2D</span>${escape(movie.genres?.join(", "))} <span>${escape(movie.duration)} phút</span></p><h2><a href="${filmLink(movie)}">${escape(movie.title)}</a></h2>${movie.country ? `<p>Xuất xứ: <span>${escape(movie.country)}</span></p>` : ""}<p>Khởi chiếu: <span>${dateText(movie.date)}</span></p>${movie.age ? `<p class="age-note">Phân loại: ${escape(movie.age)}</p>` : ""}<h3>Lịch chiếu</h3>${showtimes(movie, date)}</div></article>`
      ).join("") : empty("Không tìm thấy phim phù hợp", "Thử đổi tên phim hoặc chọn trạng thái khác.");
    }

    document.querySelectorAll("[data-status]").forEach(button => {
      button.onclick = () => {
        status = button.dataset.status;
        document.querySelectorAll("[data-status]").forEach(other => other.setAttribute("aria-pressed", String(other === button)));
        render();
      };
    });

    input.addEventListener("input", render);
    render();
  }

  // Hiển thị thông tin chi tiết của phim được chọn.
  function movieDetail() {
    const movie = cinemaState.movies.find(item => String(item.id) === new URLSearchParams(location.search).get("id"));

    if (!movie) {
      main.innerHTML = `<div class="container page-content">${empty("Không tìm thấy phim", "Phim có thể đã được gỡ khỏi danh sách.", "h1")}<a class="button button-outline" href="/movies/">Xem danh sách phim</a></div>`;
      return;
    }

    document.title = movie.title + " | UCC";
    const date = cinemaState.today();
    const backdrop = site.banners.find(banner => String(banner.movieId) === String(movie.id))?.image;
    main.innerHTML = `<section class="detail-hero" aria-label="Thông tin phim"><img class="detail-backdrop" src="${backdrop ? escape(backdrop) : poster(movie)}" alt="" aria-hidden="true" fetchpriority="high"><div class="container page-content"><a class="back-link" href="/movies/">‹ Lịch chiếu phim</a><article class="film-detail"><img class="detail-poster" src="${poster(movie)}" alt="Poster ${escape(movie.title)}" width="300" height="450"><div><h1>${escape(movie.title)}</h1><p class="film-label"><span class="outline-badge">2D</span>${escape(movie.genres?.join(", "))}<span>${escape(movie.duration)} phút</span></p>${movie.director ? `<p>Đạo diễn: ${escape(movie.director)}</p>` : ""}${movie.actors ? `<p>Diễn viên: ${escape(movie.actors)}</p>` : ""}<p>Khởi chiếu: ${dateText(movie.date)}</p>${movie.description ? `<p class="film-description">${escape(movie.description)}</p>` : ""}${movie.age ? `<p class="age-note">Phân loại phim: ${escape(movie.age)}</p>` : ""}<div class="detail-actions"><a class="button button-primary" href="#schedule">Xem lịch chiếu</a>${movie.trailer ? `<a class="button button-outline" href="https://www.youtube.com/watch?v=${encodeURIComponent(movie.trailer.split("/").at(-1).split("?")[0])}" target="_blank" rel="noopener noreferrer">▷ Xem trailer</a>` : ""}</div></div></article></div></section><div class="container detail-schedule-wrap"><section id="schedule"><h2 class="center-title">Lịch chiếu</h2>${todayLabel(date)}<div id="detail-schedule" aria-live="polite"></div></section></div>`;
    document.getElementById("detail-schedule").innerHTML = showtimes(movie, date);
  }

  // Hiển thị vé của khách hàng đang đăng nhập.
  function myTickets() {
    const user = customerAuth.currentUser();

    if (!user) {
      main.innerHTML = `<div class="container page-content"><h1 class="page-title">Vé của tôi</h1>${empty("Đăng nhập để xem vé", "Vé được lưu theo tài khoản đã dùng khi thanh toán.")}<div class="tickets-empty-action"><a class="button button-primary" href="/login/?next=%2Fmy-tickets%2F">Đăng nhập</a></div></div>`;
      return;
    }

    const bookings = cinemaState.myBookings;

    const methodNames = {
      vnpay: "VNPay",
      momo: "MoMo",
      card: "Thẻ quốc tế"
    };

    main.innerHTML = `<div class="container page-content my-tickets-page"><h1 class="page-title">Vé của tôi</h1><p class="page-subtitle">Xem lại mã vé, suất chiếu và ghế bạn đã đặt.</p>${bookings.length ? `<div class="my-ticket-list">${bookings.map(
  booking => `<article class="my-ticket"><div class="my-ticket-heading"><h2>${escape(booking.movie)}</h2><span class="my-ticket-status">${escape(booking.ticket)}</span></div><dl class="my-ticket-details"><div><dt>Mã đặt vé</dt><dd class="my-ticket-code">${escape(booking.code)}</dd></div><div><dt>Ngày giờ chiếu</dt><dd>${escape(booking.showtime)}</dd></div><div><dt>Phòng chiếu</dt><dd>${escape(booking.location)}</dd></div><div><dt>Ghế</dt><dd>${escape(booking.seatLabels?.join(", ") || booking.seats + " ghế")}</dd></div><div><dt>Tổng tiền</dt><dd>${money(booking.total)}</dd></div><div><dt>Thanh toán</dt><dd>${escape(booking.payment)}${booking.paymentMethod ? " · " + escape(methodNames[booking.paymentMethod] || booking.paymentMethod) : ""}</dd></div></dl>${booking.paymentMode === "demo" ? '<p class="my-ticket-note">Vé demo, không có giao dịch thu tiền.</p>' : ""}</article>`
).join("")}</div>` : `${empty("Bạn chưa có vé", "Chọn phim, chọn suất chiếu và hoàn tất đặt vé để vé xuất hiện tại đây.")}<div class="tickets-empty-action"><a class="button button-primary" href="/movies/">Đặt vé ngay</a></div>`}</div>`;
  }

  // Hiển thị bảng giá vé.
  function ticketPrice() {
    main.innerHTML = `<div class="container page-content price-page"><h1 class="page-title">Giá vé</h1><p class="page-subtitle">Bảng giá tham khảo từ Trung tâm Chiếu phim Giao thông vận tải</p>${site.ticketPrices.map(
  item => `<section class="price-chart"><h2>${item.title}</h2><a href="${item.image}" target="_blank" rel="noopener"><img src="${item.image}" alt="${item.title}. Mở hình để phóng to." width="1200" height="500" loading="lazy"></a><details class="price-text"><summary>Xem bảng giá dạng văn bản</summary><div class="price-table-wrap" tabindex="0" role="region" aria-label="${item.title}"><table><caption>${item.title}, đơn vị VNĐ</caption><thead><tr><th scope="col">Khung giờ</th>${site.priceColumns.map(label => `<th scope="col">${escape(label)}</th>`).join("")}</tr></thead><tbody>${item.rows.map(
  ([time, ...prices]) => `<tr><th scope="row">${escape(time)}</th>${prices.map(price => `<td>${money(price)}</td>`).join("")}</tr>`
).join("")}</tbody></table></div></details></section>`
).join("")}<div class="prose"><h2>Lưu ý khi mua vé</h2><p>Giá vé được tính theo định dạng phim, khung giờ chiếu và loại ghế. Giá cụ thể của từng suất được hiển thị tại trang lịch chiếu.</p><p>Các chương trình ưu đãi có điều kiện áp dụng riêng. Vui lòng xem thông tin chương trình hoặc liên hệ quầy vé để được hướng dẫn.</p><a class="button button-primary" href="/movies/">Xem lịch chiếu</a></div></div>`;
  }

  // Hiển thị thông tin giới thiệu rạp.
  function about() {
    main.innerHTML = `<div class="container page-content about-page"><h1 class="page-title">Giới thiệu</h1><nav class="about-nav" aria-label="Thông tin về trung tâm"><a href="#introduction">Giới thiệu</a><a href="#services">Dịch vụ</a><a href="#contact">Liên hệ</a></nav><section id="introduction" class="prose"><h2>Trung tâm Chiếu phim Giao thông vận tải</h2>${site.about.paragraphs.map(text => `<p>${escape(text)}</p>`).join("")}<img class="about-image" src="${site.about.image}" alt="Quầy vé và bắp nước UTC CineX" width="1448" height="1086" loading="lazy"></section><section id="services" class="prose"><h2>Dịch vụ</h2><p>${escape(site.about.services)}</p></section><section id="contact" class="prose"><h2>Liên hệ</h2><address>${escape(site.name)}<br>${escape(site.address)}<br>Điện thoại: <a class="text-link" href="tel:02437663311">${escape(site.phone)}</a></address></section><section id="faq" class="prose"><h2>Hỏi đáp</h2>${site.about.faq.map(
  ([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`
).join("")}</section><section id="policy" class="prose"><h2>Thông tin sử dụng</h2><p>Đây là bản giao diện bài tập lớn. Tài khoản demo được lưu trên trình duyệt này; website chưa thực hiện giao dịch. Bạn không cần nhập thông tin cá nhân thật.</p></section></div>`;
  }

  // Tạo form và xử lý đăng ký, đăng nhập khách hàng.
  function auth(register) {
    const title = register ? "Đăng ký" : "Đăng nhập";
    const next = new URL(new URLSearchParams(location.search).get("next") || "/", location.origin);
    const returnTo = next.origin === location.origin && ["/booking/", "/my-tickets/"].includes(next.pathname) ? next.pathname + next.search : "/";
    const passwordField = (name, label) => `<div class="auth-field"><label for="${name}">${label}</label><div class="password-input"><input id="${name}" name="${name}" type="password" autocomplete="${register ? "new-password" : "current-password"}" placeholder="${label}" minlength="8" maxlength="128" aria-describedby="password-help" required><button type="button" class="password-toggle" aria-controls="${name}" aria-label="Hiện ${label.toLocaleLowerCase("vi")}" aria-pressed="false">Hiện</button></div></div>`;
    main.innerHTML = `<div class="container auth-page"><section class="auth-panel"><h1>${title}</h1><p class="auth-intro">${register ? "Tạo tài khoản để đồng hành cùng UCC." : "Chào mừng bạn trở lại với UCC."}</p><form id="account-form">${register ? '<label>Họ và tên<input name="fullName" autocomplete="name" maxlength="160" placeholder="Nhập họ và tên" required></label><label>Số điện thoại<input name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{9,16}" required></label>' : ""}<div class="auth-field"><label for="email">Email</label><input id="email" name="email" maxlength="254" type="email" autocomplete="email" placeholder="ten@example.com" aria-describedby="email-error" required><span class="auth-field-error" id="email-error" aria-live="polite"></span></div>${passwordField("password", "Mật khẩu")}<p class="password-help" id="password-help">Mật khẩu từ 8 đến 128 ký tự.</p>${register ? passwordField("confirmPassword", "Nhập lại mật khẩu") + '<label class="checkbox-label"><input name="terms" type="checkbox" required> <span>Tôi đồng ý với <a class="text-link" href="/about/#policy">điều khoản sử dụng</a></span></label>' : ""}<p class="form-notice">Tài khoản demo chỉ được lưu trên trình duyệt này. Hãy dùng thông tin và mật khẩu thử nghiệm.</p><button type="submit" class="button button-primary">${title}</button><p id="account-feedback" role="status" tabindex="-1"></p></form><p class="auth-switch">${register ? 'Bạn đã có tài khoản? <a class="text-link" href="/login/">Đăng nhập</a>' : 'Bạn chưa có tài khoản? <a class="text-link" href="/register/">Đăng ký</a>'}</p>${register ? "" : '<p class="staff-login"><a class="button button-outline" href="/admin/login/">Bạn thuộc UCC?</a></p>'}</section></div>`;

    if (returnTo !== "/")
      document.querySelector(".auth-switch a").href += "?next=" + encodeURIComponent(returnTo);

    const form = document.getElementById("account-form");
    const email = form.elements.namedItem("email");
    const emailError = document.getElementById("email-error");
    let emailTouched = false;

    function validateEmail(showError) {
      const message = !email.value.trim() ? "Vui lòng nhập email." : customerAuth.isValidEmail(email.value) ? "" : "Email chưa đúng định dạng, ví dụ: ten@example.com.";
      email.setCustomValidity(message);

      if (showError) {
        emailError.textContent = message;
        email.setAttribute("aria-invalid", String(Boolean(message)));
      }
    }

    email.addEventListener("blur", () => {
      emailTouched = true;
      validateEmail(true);
    });

    email.addEventListener("input", () => validateEmail(emailTouched));

    email.addEventListener("invalid", () => {
      emailTouched = true;
      validateEmail(true);
    });

    form.querySelectorAll(".password-toggle").forEach(button => {
      const input = document.getElementById(button.getAttribute("aria-controls"));

      button.addEventListener("click", () => {
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        button.textContent = visible ? "Ẩn" : "Hiện";
        button.setAttribute("aria-pressed", String(visible));

        button.setAttribute(
          "aria-label",
          `${visible ? "Ẩn" : "Hiện"} ${input.name === "password" ? "mật khẩu" : "nhập lại mật khẩu"}`
        );
      });
    });

    const confirm = form.elements.namedItem("confirmPassword");

    if (confirm) [confirm, form.elements.namedItem("password")].forEach(input => {
      input.addEventListener("input", () => confirm.setCustomValidity(""));
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const submit = form.querySelector("button[type=submit]");

      if (submit.disabled)
        return;

      validateEmail(true);

      if (!form.reportValidity())
        return;

      if (confirm && confirm.value !== form.elements.namedItem("password").value) {
        confirm.setCustomValidity("Mật khẩu nhập lại chưa khớp.");
        confirm.reportValidity();
        return;
      }

      const feedback = document.getElementById("account-feedback");
      feedback.textContent = "";
      submit.disabled = true;
      submit.textContent = register ? "Đang tạo tài khoản…" : "Đang đăng nhập…";
      form.setAttribute("aria-busy", "true");

      try {
        const data = Object.fromEntries(new FormData(form));

        if (register) await customerAuth.register({
          ...data,
          terms: form.elements.namedItem("terms").checked
        });
        else
          await customerAuth.login(data.email, data.password);

        window.location.assign(returnTo);
      } catch (error) {
        feedback.textContent = error instanceof Error && !["QuotaExceededError", "SecurityError"].includes(error.name) ? error.message : "Không thể lưu tài khoản. Vui lòng kiểm tra dung lượng và quyền lưu trữ của trình duyệt.";
        feedback.focus();
      } finally {
        submit.disabled = false;
        submit.textContent = title;
        form.removeAttribute("aria-busy");
      }
    });
  }

  try {
    if (page === "home")
      home();
    else if (page === "movies")
      movies();
    else if (page === "movie-detail")
      movieDetail();
    else if (page === "my-tickets")
      myTickets();
    else if (page === "ticket-price")
      ticketPrice();
    else if (page === "about")
      about();
    else if (page === "login" || page === "register")
      auth(page === "register");
  } catch (error) {
    main.innerHTML = `<div class="container page-content">${empty(
  "Chưa tải được dữ liệu",
  "Dữ liệu trình duyệt có thể không hợp lệ hoặc bị chặn. Hãy thử tải lại trang.",
  "h1"
)}<a class="button button-outline" href="/">Về trang chủ</a></div>`;

    console.error(error);
  }
})();
