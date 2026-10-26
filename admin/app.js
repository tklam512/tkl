(() => {
  // Kiểm tra phiên đăng nhập quản trị.
  const loginKey = "btl.loggedIn";

  if (sessionStorage.getItem(loginKey) !== "true") {
    window.location.replace("/admin/login/?next=" + encodeURIComponent(window.location.pathname + window.location.search));
    return;
  }

  // Tạo thanh điều hướng của trang quản trị.
  document.body.insertAdjacentHTML("afterbegin", `<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon"><i class="bi bi-camera-reels-fill"></i></div>
    <span class="logo-text">Quản Trị</span>
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Thu gọn thanh điều hướng" aria-expanded="true">
      <i class="bi bi-list"></i>
    </button>
  </div>

  <nav class="sidebar-nav">
    <a class="nav-item" href="/admin/home/" data-page="home" id="nav-dashboard" aria-label="Tổng quan">
      <i class="bi bi-grid-1x2 nav-icon"></i>
      <span class="nav-label">Tổng quan</span>
    </a>
    <a class="nav-item" href="/admin/movies/" data-page="movies" id="nav-movies" aria-label="Phim">
      <i class="bi bi-film nav-icon"></i>
      <span class="nav-label">Phim</span>
    </a>
    <a class="nav-item" href="/admin/genres/" data-page="genres" id="nav-genres" aria-label="Thể loại">
      <i class="bi bi-tags nav-icon"></i>
      <span class="nav-label">Thể loại</span>
    </a>
    <a class="nav-item" href="/admin/showtimes/" data-page="showtimes" id="nav-showtimes" aria-label="Suất chiếu">
      <i class="bi bi-calendar-event nav-icon"></i>
      <span class="nav-label">Suất chiếu</span>
    </a>
    <a class="nav-item" href="/admin/products/" data-page="products" id="nav-products" aria-label="Sản phẩm">
      <i class="bi bi-bag nav-icon"></i>
      <span class="nav-label">Sản phẩm</span>
    </a>
    <a class="nav-item" href="/admin/booking/" data-page="booking" id="nav-bookings" aria-label="Danh sách vé">
      <i class="bi bi-ticket-perforated nav-icon"></i>
      <span class="nav-label">Danh sách vé</span>
    </a>
  </nav>

  <div class="sidebar-footer">
    <div class="user-info">
      <div class="user-avatar">QT</div>
      <span class="user-name">Quản trị viên</span>
    </div>
    <button class="btn-logout" id="btnLogout" title="Đăng xuất">
      <i class="bi bi-box-arrow-right"></i>
    </button>
  </div>
</aside>`);

  const page = window.location.pathname.split("/")[2];

  document.querySelectorAll(".nav-item").forEach(item => {
    const active = item.dataset.page === page;
    item.classList.toggle("active", active);

    if (active)
      item.setAttribute("aria-current", "page");
  });

  // Lưu và khôi phục trạng thái thu gọn thanh điều hướng.
  const sidebarKey = "btl.sidebarCollapsed";

  const toggle = document.getElementById("sidebarToggle");

  function setSidebarCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    toggle.querySelector("i").className = collapsed ? "bi bi-camera-reels-fill" : "bi bi-list";
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng");
  }

  setSidebarCollapsed(localStorage.getItem(sidebarKey) === "true");

  toggle.addEventListener("click", () => {
    const collapsed = toggle.getAttribute("aria-expanded") === "true";
    setSidebarCollapsed(collapsed);
    localStorage.setItem(sidebarKey, String(collapsed));
  });

  window.addEventListener("storage", event => {
    if (event.key === sidebarKey)
      setSidebarCollapsed(event.newValue === "true");
  });

  // Xóa phiên đăng nhập khi bấm đăng xuất.
  document.getElementById("btnLogout").addEventListener("click", () => {
    sessionStorage.removeItem(loginKey);
    window.location.assign("/admin/login/");
  });
})();
