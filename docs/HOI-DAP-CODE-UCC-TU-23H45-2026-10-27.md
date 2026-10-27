---
title: "Hỏi đáp code UCC từ 23:45 ngày 27/10/2026"
lang: vi-VN
---

# Hướng dẫn sử dụng tài liệu

Tài liệu tổng hợp các câu hỏi và câu trả lời kỹ thuật trong cuộc trao đổi từ 23:45 ngày 27/10/2026 đến thời điểm tạo tài liệu.

Trong Microsoft Word, giữ phím **Ctrl** rồi bấm vào tên câu hỏi trong mục lục dưới đây để chuyển thẳng tới câu hỏi tương ứng. Trên macOS, dùng **Command + click** nếu phiên bản Word yêu cầu.

# Mục lục câu hỏi {#muc-luc}

1. [Banner trang chủ được code và sử dụng như thế nào?](#cau-1-banner)
2. [Trang Lịch chiếu trong ảnh có bố cục và chức năng nào?](#cau-2-trang-lich-chieu)
3. [Thanh menu Trang chủ – Lịch chiếu – Giá vé – Giới thiệu dùng code nào?](#cau-3-menu)
4. [Thanh tìm kiếm phim sử dụng và hoạt động như thế nào?](#cau-4-tim-kiem)
5. [Vì sao suất đã qua giờ bị làm mờ và không bấm được?](#cau-5-suat-da-qua)
6. [Ba tab Đang chiếu, Sắp chiếu và Tất cả phim thay đổi nội dung thế nào?](#cau-6-tabs)
7. [Các điều kiện của form Register và Login được đặt ở đâu?](#cau-7-dieu-kien-auth)
8. [Hai khu phim trên trang chủ, khoảng cách và hiệu ứng hover được tạo thế nào?](#cau-8-home-sections)

---

# Câu hỏi 1 — Banner trang chủ được code và sử dụng như thế nào? {#cau-1-banner}

## Câu hỏi nguyên văn

> “Cái banner ở phần trang chủ của tôi được code như nào, sử dụng như nào, dòng nào, file code nào và cái nút để chuyển banner?”

## Trả lời

Banner trang chủ được chia thành bốn phần: kích hoạt trang chủ, dữ liệu banner, JavaScript tạo giao diện và JavaScript điều khiển các nút chuyển banner.

## 1. Kích hoạt trang chủ

Trong `index.html`, dòng 15:

```html
<body data-page="home">
```

`public.js` đọc `data-page="home"`, sau đó gọi hàm `home()` tại dòng 402–404:

```js
if (page === "home")
  home();
```

Hai file JavaScript được tải theo đúng thứ tự tại `index.html`, dòng 21–22:

```html
<script src="/shared-state.js?v=my-tickets-20261020"></script>
<script src="/public.js?v=my-tickets-20261020"></script>
```

- `shared-state.js` chứa dữ liệu banner.
- `public.js` tạo và điều khiển banner.

## 2. Dữ liệu banner

Dữ liệu nằm trong `shared-state.js`, dòng 27–39:

```js
"banners": [{
  "image": "/assets/ucc/banner-412.webp",
  "title": "Street Fighter",
  "movieId": 15
}, {
  "image": "/assets/ucc/banner-409.webp",
  "title": "Người Mẹ Khác",
  "movieId": 9
}, {
  "image": "/assets/ucc/banner-395.webp",
  "title": "Vùng Đất Quỷ Dữ",
  "movieId": 11
}]
```

Mỗi banner có:

- `image`: đường dẫn ảnh banner.
- `title`: tiêu đề dùng cho mô tả ảnh và nút chấm.
- `movieId`: ID phim; khi bấm banner sẽ mở chi tiết phim đó.

Ví dụ banner có `movieId: 15` sẽ dẫn tới:

```text
/movies/detail/?id=15
```

## 3. Lọc banner hợp lệ

Hàm `home()` bắt đầu tại `public.js`, dòng 140. Dòng 144 chỉ giữ banner có phim tương ứng còn tồn tại:

```js
const banners = site.banners.filter(
  banner => movies.some(
    movie => String(movie.id) === String(banner.movieId)
  )
);
```

Nếu `movieId` của banner không còn trong danh sách phim thì banner đó không xuất hiện.

## 4. Tạo HTML banner

Template nằm tại `public.js`, dòng 146–156:

```js
${banners.length ? `<section class="hero" aria-label="Phim nổi bật" aria-roledescription="băng chuyền">
  <div class="hero-slides">${banners.map(
    (banner, index) => `<a class="hero-slide"
      href="/movies/detail/?id=${banner.movieId}"
      ${index ? " hidden" : ""}>
      <img src="${banner.image}"
        alt="${escape(banner.title)}"
        width="1920" height="1080"
        ${index ? 'loading="lazy"' : 'fetchpriority="high"'}>
    </a>`
  ).join("")}</div>

  <button class="hero-prev" aria-label="Banner trước">‹</button>
  <button class="hero-next" aria-label="Banner tiếp theo">›</button>

  <div class="hero-dots" role="group" aria-label="Chọn banner">
    ${banners.map(
      (banner, index) => `<button
        aria-label="${escape(banner.title)}"
        aria-pressed="${index === 0}"></button>`
    ).join("")}
  </div>
</section>` : ""}
```

Banner đầu tiên có `index = 0` nên không có `hidden`. Các banner sau ban đầu bị ẩn. Mỗi banner là một thẻ `<a>` nên có thể bấm để mở chi tiết phim.

## 5. Hàm chuyển banner

Trạng thái và hàm `show()` nằm tại `public.js`, dòng 163–176:

```js
let current = 0;
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".hero-dots button");

function show(index) {
  current = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.hidden = i !== current;
  });

  dots.forEach((dot, i) =>
    dot.setAttribute("aria-pressed", String(i === current))
  );

  document.getElementById("banner-status").textContent =
    banners[current].title;
}
```

Công thức:

```js
current = (index + slides.length) % slides.length;
```

giúp carousel quay vòng:

- Từ banner cuối bấm tiếp sẽ quay về banner đầu.
- Từ banner đầu bấm lùi sẽ chuyển tới banner cuối.

## 6. Hai nút trước và sau

Nút được tạo tại `public.js`, dòng 151:

```html
<button class="hero-prev" aria-label="Banner trước">‹</button>
<button class="hero-next" aria-label="Banner tiếp theo">›</button>
```

Sự kiện được gắn tại dòng 178–179:

```js
document.querySelector(".hero-prev").onclick =
  () => show(current - 1);

document.querySelector(".hero-next").onclick =
  () => show(current + 1);
```

Các nút chấm được xử lý tại dòng 181–183:

```js
dots.forEach((dot, index) => {
  dot.onclick = () => show(index);
});
```

## 7. CSS banner

CSS nằm trong `public.css`, dòng 266–348.

Khung và ảnh banner:

```css
.hero {
  position: relative;
  margin: 24px 24px 0;
}

.hero-slides {
  overflow: hidden;
  border-radius: 22px;
}

.hero-slide img {
  width: 100%;
  height: min(42vw,640px);
  object-fit: cover;
  object-position: center;
}
```

Hai nút chuyển:

```css
.hero-prev,.hero-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.hero-prev { left: 20px; }
.hero-next { right: 20px; }
```

Chấm đang chọn:

```css
.hero-dots button[aria-pressed=true] {
  background: var(--accent);
  width: 24px;
  border-radius: 12px;
}
```

Banner hiện tại chỉ chuyển bằng nút mũi tên hoặc nút chấm; code không đặt bộ hẹn giờ tự động chạy.

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 2 — Trang Lịch chiếu trong ảnh có bố cục và chức năng nào? {#cau-2-trang-lich-chieu}

## Câu hỏi nguyên văn

> “Còn phần này trong code của tôi có những chức năng nào, bố cục như nào, dòng nào, file code nào?”

## Trả lời

Phần trong ảnh là trang Lịch chiếu tại đường dẫn `/movies/`. Bố cục gồm header và khu vực nội dung danh sách phim.

## 1. File HTML khởi tạo trang

Khung trang nằm trong `movies/index.html`, dòng 1–26. Dòng quan trọng là:

```html
<body data-page="movies">
```

Cuối `public.js`, dòng 405–406, giá trị này kích hoạt hàm `movies()`:

```js
else if (page === "movies")
  movies();
```

Ba vùng HTML ban đầu rỗng:

```html
<header id="site-header" class="site-header"></header>
<main id="main" tabindex="-1"></main>
<footer id="site-footer" class="site-footer"></footer>
```

## 2. Bố cục tổng thể

| Khu vực | Chức năng | File và dòng |
|---|---|---|
| Logo UCC | Quay về trang chủ | `public.js:43` |
| Đăng ký | Mở `/register/` | `public.js:48` |
| Đăng nhập | Mở `/login/` | `public.js:48` |
| Hamburger | Mở/đóng menu nhỏ | `public.js:44`, `96–113` |
| Tiêu đề | Thay đổi theo tab | `public.js:210`, `223` |
| Ba tab | Lọc trạng thái phim | `public.js:210–212` |
| Ngày hôm nay | Cho biết ngày lịch chiếu | `public.js:186–188` |
| Tìm kiếm | Lọc phim theo tên | `public.js:212`, `216–221` |
| Thẻ phim | Poster và thông tin | `public.js:225–227` |
| Suất chiếu | Giờ, phòng, giá, đặt vé | `public.js:190–202` |

## 3. Header và tài khoản

Header được tạo tại `public.js`, dòng 41–49:

```js
document.getElementById("site-header").innerHTML = `
  <div class="header-inner">
    <a class="brand" href="/" aria-label="UCC, trang chủ">
      <img src="/assets/ucc/logo.png" alt="UTC Cinema">
    </a>

    <button class="menu-toggle"
      aria-controls="main-nav"
      aria-expanded="false"
      aria-label="Mở menu">☰</button>

    <nav id="main-nav">...</nav>

    <div class="account-links">
      <a class="button button-outline" href="/register/">Đăng ký</a>
      <a class="button button-primary" href="/login/">Đăng nhập</a>
    </div>
  </div>`;
```

Nếu khách đã đăng nhập, hàm `renderAccount()` tại dòng 51–79 thay hai nút bằng lời chào và nút Đăng xuất.

## 4. Menu hamburger

Code mở/đóng nằm tại `public.js`, dòng 96–113:

```js
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  document.getElementById("main-nav").classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  document.getElementById("main-nav").classList.toggle("is-open", open);
});
```

Phím Escape gọi `closeMenu()`. CSS responsive nằm tại `public.css`, dòng 1036–1092.

## 5. Tiêu đề và ba tab

Template nằm tại `public.js`, dòng 210–212:

```js
<h1 class="page-title">Phim đang chiếu</h1>

<div class="movie-tabs" aria-label="Trạng thái phim">
  <button data-status="showing">Đang chiếu</button>
  <button data-status="soon">Sắp chiếu</button>
  <button data-status="all">Tất cả phim</button>
</div>
```

Khi bấm tab, code dòng 230–236 cập nhật `status`, đổi `aria-pressed` và gọi lại `render()`.

CSS tab tại `public.css`, dòng 532–551. Tab hiện tại có chữ sáng và gạch đỏ do:

```css
.movie-tabs button[aria-pressed=true] {
  color: var(--text);
  border-color: var(--accent);
}
```

## 6. Ngày lịch chiếu

Hàm tại `public.js`, dòng 186–188:

```js
function todayLabel(date) {
  return `<p class="schedule-date">
    Lịch chiếu hôm nay ·
    <time datetime="${date}">${dateText(date)}</time>
  </p>`;
}
```

Ngày được lấy bằng `cinemaState.today()` tại dòng 208. CSS nằm tại `public.css`, dòng 1513–1523.

## 7. Thẻ thông tin phim

Mỗi phim được tạo tại `public.js`, dòng 225–227:

```html
<article class="schedule-film">
  <a class="schedule-poster" href="...">
    <img src="..." alt="Poster ...">
  </a>

  <div class="schedule-info">
    <p class="film-label">
      <span class="outline-badge">2D</span>
      Thể loại
      <span>Thời lượng phút</span>
    </p>

    <h2><a href="...">Tên phim</a></h2>
    <p>Xuất xứ</p>
    <p>Khởi chiếu</p>
    <p class="age-note">Phân loại</p>
    <h3>Lịch chiếu</h3>
  </div>
</article>
```

CSS thẻ phim tại `public.css`, dòng 578–645. `.schedule-film` dùng flex để poster và thông tin nằm cạnh nhau.

## 8. Lịch chiếu

Hàm `showtimes()` tại `public.js`, dòng 190–202:

```js
const shows = cinemaState.screenings
  .filter(show =>
    String(show.movieId) === String(movie.id) &&
    show.date === date
  )
  .sort((a, b) => a.time.localeCompare(b.time));
```

Hàm chỉ lấy suất của phim đang hiển thị và đúng ngày hôm nay, sau đó sắp xếp theo giờ. Nếu còn hiệu lực, suất dẫn tới `/booking/?screening=...`; nếu đã qua, suất được vô hiệu hóa.

## 9. Responsive

- Header desktop: `public.css:155–259`.
- Menu tablet/mobile: `public.css:1036–1092`.
- Danh sách lịch chiếu desktop: `public.css:578–685`.
- Lịch chiếu mobile: `public.css:1261–1348`.

Ở mobile, poster giảm còn 100px, bộ lọc chuyển thành cột, chữ và khoảng cách nhỏ hơn.

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 3 — Thanh menu Trang chủ – Lịch chiếu – Giá vé – Giới thiệu dùng code nào? {#cau-3-menu}

## Câu hỏi nguyên văn

> “Thanh này sử dụng code nào, dòng nào, ở đâu, chỉ rõ cho tôi?”

## Trả lời

Thanh trong ảnh là menu điều hướng chính có ID `main-nav`. Nó gồm dữ liệu menu, JavaScript tạo các liên kết và CSS đánh dấu trang hiện tại.

## 1. Dữ liệu bốn mục menu

Nằm tại `shared-state.js`, dòng 20–25:

```js
"navigation": [
  ["/", "Trang chủ"],
  ["/movies/", "Lịch chiếu"],
  ["/ticket-price/", "Giá vé"],
  ["/about/", "Giới thiệu"]
]
```

Mỗi phần tử gồm đường dẫn và tên hiển thị.

## 2. Xác định mục đang mở

Nằm tại `public.js`, dòng 38–39:

```js
const activePath =
  page === "movie-detail"
    ? "/movies/"
    : window.location.pathname;
```

Nếu đang xem chi tiết phim, menu vẫn đánh dấu “Lịch chiếu”. Với các trang khác, đường dẫn hiện tại được lấy bằng `window.location.pathname`.

## 3. Tạo thanh menu

Nằm tại `public.js`, dòng 45–47:

```js
<nav id="main-nav" aria-label="Điều hướng chính">
  ${site.navigation.map(
    ([href, label]) => `<a
      href="${href}"
      ${activePath === href ? 'aria-current="page"' : ""}>
      ${escape(label)}
    </a>`
  ).join("")}
</nav>
```

`map()` biến từng phần tử dữ liệu thành thẻ `<a>`. `join("")` ghép bốn thẻ thành menu hoàn chỉnh.

Nếu đường dẫn của mục bằng đường dẫn hiện tại, code thêm:

```html
aria-current="page"
```

Ví dụ ở trang chủ:

```html
<a href="/" aria-current="page">Trang chủ</a>
```

## 4. CSS bố cục hàng ngang

Nằm tại `public.css`, dòng 183–189:

```css
#main-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  flex: 1;
}
```

- `display: flex`: xếp các mục theo hàng ngang.
- `justify-content: center`: căn menu vào giữa.
- `gap: 26px`: khoảng cách giữa các mục.
- `flex: 1`: menu chiếm vùng giữa logo và tài khoản.

Định dạng chữ nằm tại dòng 191–197:

```css
#main-nav a {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  position: relative;
  padding-block: 14px;
}
```

## 5. Màu đỏ và gạch chân

Màu đỏ của mục hiện tại tại `public.css`, dòng 199–201:

```css
#main-nav a[aria-current=page] {
  color: var(--accent);
}
```

Gạch đỏ tại dòng 203–211:

```css
#main-nav a[aria-current=page]::after {
  content: '';
  height: 2px;
  background: var(--accent);
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
}
```

Phần tử ảo `::after` tạo một đường cao 2px dưới mục hiện tại.

## 6. Menu trên màn hình nhỏ

Tại `public.css`, dòng 1036–1092:

```css
#main-nav {
  display: none;
}

#main-nav.is-open {
  display: flex;
  flex-direction: column;
  gap: 0;
}
```

Nút hamburger thêm hoặc xóa class `is-open`. Ở mobile, gạch chân bị ẩn để phù hợp bố cục dọc.

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 4 — Thanh tìm kiếm phim sử dụng và hoạt động như thế nào? {#cau-4-tim-kiem}

## Câu hỏi nguyên văn

> “Cái thanh tìm kiếm này sử dụng như nào, chức năng thế nào, dòng nào, file code nào?”

## Trả lời

Thanh tìm kiếm nằm trên trang `/movies/`. Nó tìm theo tên phim ngay khi người dùng gõ và kết hợp với tab Đang chiếu, Sắp chiếu hoặc Tất cả phim đang chọn.

## 1. Tạo input tìm kiếm

Nằm tại `public.js`, dòng 212:

```html
<div class="movie-filters">
  <label>
    <span class="sr-only">Tìm tên phim</span>
    <input
      type="search"
      id="movie-search"
      placeholder="Tìm tên phim…">
  </label>
</div>

<div id="movie-results" aria-live="polite"></div>
```

- `type="search"`: ô tìm kiếm; trình duyệt có thể cung cấp nút xóa.
- `id="movie-search"`: ID để JavaScript truy cập.
- `placeholder`: chữ hướng dẫn khi ô rỗng.
- `.sr-only`: nhãn dành cho trình đọc màn hình.
- `#movie-results`: vùng chứa kết quả động.
- `aria-live="polite"`: thông báo thay đổi kết quả cho công nghệ hỗ trợ.

## 2. Lấy phần tử input

Tại `public.js`, dòng 214:

```js
const input = document.getElementById("movie-search");
```

## 3. Tìm ngay khi nhập

Tại dòng 238:

```js
input.addEventListener("input", render);
```

Mỗi lần nhập hoặc xóa một ký tự, sự kiện `input` gọi lại `render()`. Người dùng không cần nhấn Enter và không cần nút Tìm kiếm.

## 4. Chuẩn hóa từ khóa

Tại dòng 216–217:

```js
function render() {
  const keyword =
    input.value.trim().toLocaleLowerCase("vi");
```

- `input.value`: nội dung ô.
- `trim()`: bỏ khoảng trắng đầu và cuối.
- `toLocaleLowerCase("vi")`: chuyển thành chữ thường tiếng Việt.

Vì vậy các từ `Clayface`, `CLAYFACE`, `clayface` và `clay` đều có thể tìm phim CLAYFACE.

## 5. Lọc phim

Tại `public.js`, dòng 219–221:

```js
const selected = cinemaState.movies.filter(
  movie =>
    (
      status === "all" ||
      cinemaState.movieStatus(movie) === status
    ) &&
    movie.title
      .toLocaleLowerCase("vi")
      .includes(keyword)
).sort(
  (a, b) => b.date.localeCompare(a.date)
);
```

Điều kiện gồm:

1. Phim đúng trạng thái của tab hiện tại, hoặc tab là `all`.
2. Tên phim chứa từ khóa.

Sau đó kết quả được sắp xếp theo ngày khởi chiếu giảm dần.

Ví dụ:

```js
"street fighter".includes("street")
// true
```

## 6. Kết hợp với ba tab

Biến `status` được tạo tại dòng 206–208 và có thể là:

| Tab | Giá trị |
|---|---|
| Đang chiếu | `showing` |
| Sắp chiếu | `soon` |
| Tất cả phim | `all` |

Khi đổi tab, code dòng 230–236 cập nhật `status` và gọi lại `render()`. Vì vậy tìm kiếm luôn chỉ áp dụng trong nhóm đang chọn, trừ tab Tất cả phim.

## 7. Hiển thị kết quả hoặc trạng thái rỗng

Tại dòng 225–227:

```js
document.getElementById("movie-results").innerHTML =
  selected.length
    ? selected.map(movie => `
        <article class="schedule-film">...</article>
      `).join("")
    : empty(
        "Không tìm thấy phim phù hợp",
        "Thử đổi tên phim hoặc chọn trạng thái khác."
      );
```

Nếu ô rỗng, `keyword` là chuỗi rỗng. Mọi tên phim đều `includes("")`, nên danh sách của tab hiện tại được hiển thị lại.

## 8. Nguồn dữ liệu phim

Getter nằm tại `shared-state.js`, dòng 898–900:

```js
get movies() {
  return read("btl-movies", defaultMovies);
}
```

Nếu `localStorage` có `btl-movies`, hệ thống dùng dữ liệu đã lưu; nếu không, nó dùng danh sách mặc định. Tìm kiếm chạy hoàn toàn trên trình duyệt.

## 9. CSS

Tại `public.css`, dòng 553–572:

```css
.movie-filters {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 30px;
}

.movie-filters label:first-child {
  width: 340px;
}

.movie-filters input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  height: 44px;
  padding: 8px 14px;
}
```

Mobile tại `public.css`, dòng 1279–1292:

```css
.movie-filters {
  flex-direction: column;
}

.movie-filters label:first-child {
  width: 100%;
}

.movie-filters input {
  font-size: 12px;
  height: 42px;
}
```

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 5 — Vì sao suất đã qua giờ bị làm mờ và không bấm được? {#cau-5-suat-da-qua}

## Câu hỏi nguyên văn

> “Ví dụ như phim này đã qua giờ chiếu trong ngày thì tại sao không ấn được vào suất chiếu, làm thế nào để làm mờ suất chiếu đó và loại bỏ thao tác cho suất chiếu đó, ở phần code nào, chức năng như nào?”

## Trả lời

Suất đã qua không bấm được vì code thực hiện ba việc: so sánh thời gian, thay liên kết `<a>` bằng `<span>` và áp dụng CSS làm mờ. Trang đặt vé còn kiểm tra lại để ngăn truy cập bằng URL thủ công.

## 1. So sánh thời gian

Điều kiện tại `public.js`, dòng 198 và 200:

```js
Date.parse(show.date + "T" + show.time) <= Date.now()
```

Ví dụ:

```js
show.date = "2026-10-28";
show.time = "10:00";
```

Code ghép thành:

```text
2026-10-28T10:00
```

- `Date.parse(...)` chuyển ngày giờ suất thành timestamp.
- `Date.now()` trả timestamp hiện tại.
- Nếu thời điểm suất nhỏ hơn hoặc bằng hiện tại thì suất đã qua.

## 2. Đổi phần tử tương tác

Hàm `showtimes()` nằm tại `public.js`, dòng 190–202. Phần mở thẻ dùng điều kiện:

```js
Date.parse(show.date + "T" + show.time) <= Date.now()
  ? '<span class="showtime-past">'
  : `<a class="showtime-link"
        href="/booking/?screening=${encodeURIComponent(show.id)}"
        aria-label="Đặt vé lúc ${escape(show.time)}">`
```

Nếu đã qua, HTML là:

```html
<span class="showtime-past">
  <strong>10:00</strong>
  <span>Phòng 2</span>
  <span>75.000 ₫</span>
  <span>Đã qua giờ chiếu</span>
</span>
```

Thẻ `<span>` không có `href` và không có sự kiện click nên không thể mở trang đặt vé.

Nếu còn hiệu lực, HTML là:

```html
<a class="showtime-link"
   href="/booking/?screening=ma-suat">
  <strong>19:30</strong>
  <span>Phòng 2</span>
  <span>90.000 ₫</span>
</a>
```

Đây là liên kết hợp lệ và có thể bấm.

## 3. Thông báo đã qua giờ

Phần đóng thẻ tại `public.js`, dòng 200:

```js
Date.parse(show.date + "T" + show.time) <= Date.now()
  ? "<span>Đã qua giờ chiếu</span></span>"
  : "</a>"
```

Suất cũ được thêm dòng “Đã qua giờ chiếu”; suất còn hiệu lực chỉ đóng thẻ liên kết.

## 4. CSS làm mờ

Tại `public.css`, dòng 1684–1686:

```css
.showtime-past {
  opacity: .55;
}
```

`opacity: .55` làm toàn bộ giờ, phòng, giá và thông báo còn 55% độ rõ. Muốn mờ hơn có thể giảm thành `.35`; muốn sáng hơn có thể tăng thành `.7`.

Cả hai trạng thái dùng chung bố cục tại dòng 1667–1671:

```css
.showtime-link,
.showtime-past {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

Chỉ suất còn hiệu lực có hover tại dòng 1673–1682:

```css
.showtime-link {
  margin: -12px -14px;
  padding: 12px 14px;
  border-radius: 7px;
}

.showtime-link:hover {
  background: var(--surface);
  color: var(--text);
}
```

## 5. Lớp kiểm tra nghiệp vụ

Người dùng có thể thử nhập URL `/booking/?screening=...` thủ công. Vì vậy `shared-state.js`, dòng 1203–1219, kiểm tra lại trong `bookingState.booking.details()`:

```js
if (Date.parse(show.date + "T" + show.time) <= Date.now())
  throw new Error(
    "Suất chiếu đã qua giờ bắt đầu. Vui lòng chọn suất khác."
  );
```

Trang booking gọi hàm này tại `booking/booking.js`, dòng 300–302:

```js
try {
  details = api.details(screeningId);
  user = customerAuth.currentUser();
```

Nếu hàm ném lỗi, code dòng 362–364 xử lý:

```js
} catch (error) {
  fail(error.message);
}
```

Hàm `fail()` tại dòng 40–42 hiển thị “Chưa thể đặt vé” và liên kết “Chọn suất chiếu khác”.

Như vậy có hai lớp bảo vệ:

```text
Giao diện: <a> đổi thành <span>
→ Không bấm được

Nghiệp vụ: api.details() kiểm tra Date.now()
→ Không thể đặt bằng URL thủ công
```

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 6 — Ba tab Đang chiếu, Sắp chiếu và Tất cả phim thay đổi nội dung thế nào? {#cau-6-tabs}

## Câu hỏi nguyên văn

> “Trong phần này các phần phim đang chiếu, sắp chiếu và tất cả phim nó có thể ấn được và thay đổi nội dung từng phần đó, vậy làm thế nào để ra được như thế?”

## Trả lời

Ba phần này là ba nút tab. Khi người dùng bấm một tab, JavaScript cập nhật biến `status`, đánh dấu nút đang chọn, gọi lại hàm `render()`, lọc danh sách phim và thay nội dung vùng kết quả mà không tải lại trang.

## 1. Hàm quản lý trang phim

Toàn bộ logic nằm trong hàm `movies()` tại `public.js`, dòng 204–240:

```js
function movies() {
  const query = new URLSearchParams(location.search);
  let status = ["soon", "all"].includes(query.get("status"))
    ? query.get("status")
    : "showing";

  // Tạo ba tab và vùng kết quả
  // ...

  function render() {
    // Lọc và dựng lại danh sách
  }

  // Gắn sự kiện click
  // ...

  render();
}
```

## 2. Dữ liệu ba tab

Tại `public.js`, dòng 210–212:

```js
[
  ["showing", "Đang chiếu"],
  ["soon", "Sắp chiếu"],
  ["all", "Tất cả phim"]
]
```

| `data-status` | Tên tab | Chức năng |
|---|---|---|
| `showing` | Đang chiếu | Chỉ phim đang chiếu |
| `soon` | Sắp chiếu | Chỉ phim chưa đến ngày khởi chiếu |
| `all` | Tất cả phim | Toàn bộ phim, kể cả phim đã kết thúc |

Mảng được chuyển thành nút bằng `map()`:

```js
.map(
  ([value, label]) => `<button
    data-status="${value}"
    aria-pressed="${status === value}">
    ${label}
  </button>`
).join("")
```

Khi tab Tất cả phim được chọn, HTML có dạng:

```html
<button data-status="showing" aria-pressed="false">Đang chiếu</button>
<button data-status="soon" aria-pressed="false">Sắp chiếu</button>
<button data-status="all" aria-pressed="true">Tất cả phim</button>
```

## 3. Tab được chọn khi mở trang

Tại `public.js`, dòng 206–207:

```js
const query = new URLSearchParams(location.search);

let status = ["soon", "all"].includes(query.get("status"))
  ? query.get("status")
  : "showing";
```

- `/movies/` → mặc định `showing`.
- `/movies/?status=soon` → mở `soon`.
- `/movies/?status=all` → mở `all`.
- Giá trị không hợp lệ → trở về `showing`.

## 4. Sự kiện khi bấm tab

Tại `public.js`, dòng 230–236:

```js
document.querySelectorAll("[data-status]").forEach(button => {
  button.onclick = () => {
    status = button.dataset.status;

    document.querySelectorAll("[data-status]").forEach(
      other => other.setAttribute(
        "aria-pressed",
        String(other === button)
      )
    );

    render();
  };
});
```

Khi bấm Sắp chiếu:

```js
button.dataset.status // "soon"
status = "soon";
```

Nút vừa bấm nhận `aria-pressed="true"`; hai nút còn lại nhận `false`. Sau đó `render()` chạy lại.

## 5. Thuật toán phân loại phim

Hàm nằm tại `shared-state.js`, dòng 730–741:

```js
function movieStatus(movie, date = today()) {
  if (movie.date > date)
    return "soon";

  if (movie.showingThrough >= date)
    return "showing";

  const daysSinceRelease =
    (Date.parse(date) - Date.parse(movie.date)) / 86400000;

  return daysSinceRelease <= 21 ? "showing" : "ended";
}
```

Luồng xử lý:

```text
Ngày khởi chiếu > hôm nay → soon
showingThrough chưa qua     → showing
Khởi chiếu chưa quá 21 ngày → showing
Quá 21 ngày                 → ended
```

Phim `ended` chỉ xuất hiện khi chọn Tất cả phim.

## 6. Lọc theo tab và ô tìm kiếm

Trong `render()`, tại `public.js`, dòng 216–221:

```js
const keyword = input.value
  .trim()
  .toLocaleLowerCase("vi");

const selected = cinemaState.movies.filter(
  movie =>
    (
      status === "all" ||
      cinemaState.movieStatus(movie) === status
    ) &&
    movie.title
      .toLocaleLowerCase("vi")
      .includes(keyword)
).sort((a, b) => b.date.localeCompare(a.date));
```

Phim phải đồng thời đúng tab và chứa từ khóa tìm kiếm. Khi `status === "all"`, điều kiện trạng thái luôn đúng nên toàn bộ phim được giữ lại.

## 7. Thay tiêu đề

Tại `public.js`, dòng 223:

```js
document.querySelector("h1").textContent =
  status === "soon"
    ? "Phim sắp chiếu"
    : status === "all"
      ? "Tất cả phim"
      : "Phim đang chiếu";
```

## 8. Thay danh sách mà không tải lại trang

Tại dòng 225–227:

```js
document.getElementById("movie-results").innerHTML =
  selected.length
    ? selected.map(
        movie => `<article class="schedule-film">...</article>`
      ).join("")
    : empty(
        "Không tìm thấy phim phù hợp",
        "Thử đổi tên phim hoặc chọn trạng thái khác."
      );
```

Code chỉ thay `innerHTML` của `#movie-results`, nên trình duyệt không tải lại toàn bộ trang.

## 9. CSS tab và gạch đỏ

Tại `public.css`, dòng 532–551:

```css
.movie-tabs {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: -16px 0 26px;
}

.movie-tabs button {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 8px 4px;
  font-size: 15px;
  color: var(--muted);
}

.movie-tabs button[aria-pressed=true] {
  color: var(--text);
  border-color: var(--accent);
}
```

`aria-pressed="true"` làm chữ sáng và đường viền dưới chuyển thành màu đỏ.

## 10. Lần render đầu tiên

Cuối hàm tại `public.js`, dòng 238–239:

```js
input.addEventListener("input", render);
render();
```

`render()` được gọi ngay khi trang mở, sau đó được gọi lại khi người dùng bấm tab hoặc nhập từ khóa.

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 7 — Các điều kiện của form Register và Login được đặt ở đâu? {#cau-7-dieu-kien-auth}

## Câu hỏi nguyên văn

> “Vậy các điều kiện ở phần đăng ký, đăng nhập, register và login đó thì điều kiện của các dòng được tạo ở đâu? Ví dụ như phần email phải có @gmail.com thì các điều kiện đó được đặt ở đâu?”

## Trả lời

Điều kiện của form được chia thành ba lớp: thuộc tính HTML được tạo trong `public.js`, validation JavaScript trước khi submit và kiểm tra nghiệp vụ trong `shared-state.js`.

Code hiện tại **không bắt buộc email phải là `@gmail.com`**. Nó chấp nhận các tên miền email hợp lệ như Gmail, Outlook hoặc tên miền trường học.

## 1. Hai trang dùng chung một hàm

- `register/index.html`, dòng 15: `data-page="register"`.
- `login/index.html`, dòng 15: `data-page="login"`.

Tại `public.js`, dòng 415–416:

```js
else if (page === "login" || page === "register")
  auth(page === "register");
```

Kết quả:

```text
Register → auth(true)
Login    → auth(false)
```

## 2. Các trường của hai form

Hàm `auth(register)` nằm tại `public.js`, dòng 296–400.

| Trường | Register | Login |
|---|---:|---:|
| Họ và tên | Có | Không |
| Số điện thoại | Có | Không |
| Email | Có | Có |
| Mật khẩu | Có | Có |
| Nhập lại mật khẩu | Có | Không |
| Điều khoản | Có | Không |

## 3. Điều kiện họ và tên

HTML được tạo tại `public.js`, dòng 302:

```html
<input name="fullName"
  autocomplete="name"
  maxlength="160"
  placeholder="Nhập họ và tên"
  required>
```

Tầng nghiệp vụ tại `shared-state.js`, dòng 1102–1112:

```js
const fullName = String(input.fullName || "")
  .trim()
  .replace(/\s+/g, " ");

if (!fullName || fullName.length > 160)
  throw new Error(
    "Vui lòng nhập họ và tên, tối đa 160 ký tự."
  );
```

## 4. Điều kiện số điện thoại

HTML:

```html
<input name="phone"
  type="tel"
  autocomplete="tel"
  pattern="[0-9+ ()-]{9,16}"
  required>
```

Pattern cho phép chữ số, dấu `+`, khoảng trắng, ngoặc và gạch ngang; tổng chiều dài từ 9 đến 16 ký tự.

Kiểm tra lại tại `shared-state.js`, dòng 1114–1115:

```js
if (
  !/^[0-9+ ()-]{9,16}$/.test(phone) ||
  phone.replace(/\D/g, "").length < 9
)
  throw new Error("Số điện thoại không hợp lệ.");
```

## 5. Điều kiện email trong HTML

Tại `public.js`, dòng 302:

```html
<input id="email"
  name="email"
  maxlength="254"
  type="email"
  autocomplete="email"
  placeholder="ten@example.com"
  aria-describedby="email-error"
  required>
```

- `required`: không được bỏ trống.
- `type="email"`: trình duyệt kiểm tra định dạng email cơ bản.
- `maxlength="254"`: tối đa 254 ký tự.
- Không có điều kiện bắt buộc Gmail.

## 6. Regex email

Nằm tại `shared-state.js`, dòng 1035–1041:

```js
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = value =>
  String(value || "").trim().toLowerCase();

const isValidEmail = value =>
  emailPattern.test(normalizeEmail(value)) &&
  normalizeEmail(value).length <= 254;
```

Email phải có phần trước `@`, ký tự `@`, tên miền, dấu chấm và đuôi tên miền.

Hợp lệ:

```text
an@gmail.com
an@outlook.com
an@utc.edu.vn
a+b@sub.example.vn
```

Không hợp lệ:

```text
an
an@
an@gmail
an gmail.com
an@@gmail.com
```

Nếu muốn chỉ nhận Gmail, có thể đổi regex tại `shared-state.js:1039` thành:

```js
const emailPattern = /^[a-z0-9._%+-]+@gmail\.com$/i;
```

## 7. Hiển thị lỗi email

Tại `public.js`, dòng 312–320:

```js
function validateEmail(showError) {
  const message = !email.value.trim()
    ? "Vui lòng nhập email."
    : customerAuth.isValidEmail(email.value)
      ? ""
      : "Email chưa đúng định dạng, ví dụ: ten@example.com.";

  email.setCustomValidity(message);

  if (showError) {
    emailError.textContent = message;
    email.setAttribute(
      "aria-invalid",
      String(Boolean(message))
    );
  }
}
```

Email được kiểm tra khi blur, khi nhập tiếp và khi phát sinh sự kiện `invalid` tại dòng 322–332.

## 8. Điều kiện mật khẩu

Hàm tạo input tại `public.js`, dòng 301:

```html
<input type="password"
  minlength="8"
  maxlength="128"
  required>
```

Code hiện tại chỉ bắt buộc độ dài 8–128 ký tự; không bắt buộc chữ hoa, chữ số hoặc ký tự đặc biệt.

Tầng nghiệp vụ tại `shared-state.js`, dòng 1120–1121:

```js
if (
  typeof password !== "string" ||
  password.length < 8 ||
  password.length > 128
)
  throw new Error("Mật khẩu cần từ 8 đến 128 ký tự.");
```

## 9. Mật khẩu nhập lại

Kiểm tra trên giao diện tại `public.js`, dòng 368–372:

```js
if (
  confirm &&
  confirm.value !== form.elements.namedItem("password").value
) {
  confirm.setCustomValidity("Mật khẩu nhập lại chưa khớp.");
  confirm.reportValidity();
  return;
}
```

Tầng nghiệp vụ kiểm tra lại tại `shared-state.js`, dòng 1123–1124.

## 10. Điều khoản sử dụng

HTML:

```html
<input name="terms" type="checkbox" required>
```

Khi submit, code chuyển trạng thái checkbox thành boolean tại `public.js`, dòng 383–386. `shared-state.js`, dòng 1126–1127, yêu cầu giá trị phải đúng bằng `true`.

## 11. Email không được trùng

Tại `shared-state.js`, dòng 1129–1137:

```js
if (accounts().some(user => user.email === email))
  throw new Error(
    "Email đã được đăng ký. Vui lòng đăng nhập."
  );
```

Email được `trim()` và chuyển thành chữ thường, nên `AN@GMAIL.COM` và `an@gmail.com` được xem là một email.

## 12. Kiểm tra toàn form

Tại `public.js`, dòng 356–372:

```js
event.preventDefault();
validateEmail(true);

if (!form.reportValidity())
  return;
```

`reportValidity()` kiểm tra `required`, `maxlength`, `minlength`, `pattern`, `type="email"` và lỗi tùy chỉnh từ `setCustomValidity()`.

## 13. Đăng ký và đăng nhập

Tại `public.js`, dòng 380–390:

```js
const data = Object.fromEntries(new FormData(form));

if (register)
  await customerAuth.register({
    ...data,
    terms: form.elements.namedItem("terms").checked
  });
else
  await customerAuth.login(data.email, data.password);
```

Nghiệp vụ đăng ký nằm tại `shared-state.js:1102–1152`; đăng nhập tại `shared-state.js:1155–1163`.

## 14. Bảo vệ mật khẩu

Hàm `hashPassword()` tại `shared-state.js`, dòng 1071–1086, dùng PBKDF2-SHA256 với 600.000 vòng và salt riêng. Hệ thống lưu `salt` và `passwordHash`, không lưu mật khẩu gốc.

[Quay lại mục lục](#muc-luc)

---

# Câu hỏi 8 — Hai khu phim trên trang chủ, khoảng cách và hiệu ứng hover được tạo thế nào? {#cau-8-home-sections}

## Câu hỏi nguyên văn

> “Ở phần trang chủ đầu tiên, những cái này được làm như thế nào, nó được chia ra thành 2 phần như này kiểu gì, khoảng cách của các phim hay hiệu ứng khi trỏ chuột vào hình ảnh hay những phần hiện ra làm ở đâu, chỉ rõ chức năng và cách làm, chỉ rõ các dòng code.”

## Trả lời

Khu vực này gồm hai `<section>`: Phim đang chiếu và Phim sắp chiếu. JavaScript phân loại dữ liệu rồi dùng `movieCard()` tạo từng thẻ; CSS Grid tạo các cột và khoảng cách; CSS hover phóng ảnh và hiện nút Xem chi tiết.

## 1. Lấy và phân loại phim

Trong `public.js`, dòng 140–143:

```js
const movies = [...cinemaState.movies]
  .sort((a, b) => b.date.localeCompare(a.date));

const showing = movies.filter(
  movie => cinemaState.movieStatus(movie) === "showing"
);

const soon = movies.filter(
  movie => cinemaState.movieStatus(movie) === "soon"
);
```

`showing` chứa phim đang chiếu; `soon` chứa phim chưa tới ngày khởi chiếu.

## 2. Tạo hai section

Tại `public.js`, dòng 157–158:

```js
<div class="container home-layout">
  <div class="home-films">
    <section>
      ${sectionHeading("Phim đang chiếu", "/movies/")}
      <div class="poster-grid">
        ${showing.length
          ? showing.slice(0, 8).map(movieCard).join("")
          : empty("Chưa có phim đang chiếu", "Hãy quay lại để xem danh sách phim mới.")}
      </div>
    </section>

    <section>
      ${sectionHeading("Phim sắp chiếu", "/movies/?status=soon")}
      <div class="poster-grid">
        ${soon.length
          ? soon.slice(0, 4).map(movieCard).join("")
          : empty("Lịch phim sắp chiếu đang được cập nhật")}
      </div>
    </section>
  </div>
</div>
```

Phim đang chiếu lấy tối đa 8 phim; phim sắp chiếu lấy tối đa 4 phim.

## 3. Xếp hai phần theo chiều dọc

Tại `public.css`, dòng 350–355:

```css
.home-layout {
  display: grid;
  grid-template-columns: minmax(0,1fr);
  padding-top: 54px;
  padding-bottom: 64px;
}
```

Lưới một cột làm hai section nằm lần lượt từ trên xuống dưới.

Khoảng cách giữa chúng tại dòng 357–359:

```css
.home-films section + section {
  margin-top: 50px;
}
```

## 4. Tiêu đề và Xem tất cả

Hàm `sectionHeading()` tại `public.js`, dòng 135–137:

```js
function sectionHeading(title, href = "") {
  return `<div class="section-heading">
    <h2>
      <span class="section-dot" aria-hidden="true"></span>
      ${title}
    </h2>
    ${href
      ? `<a href="${href}">Xem tất cả <span aria-hidden="true">→</span></a>`
      : ""}
  </div>`;
}
```

Phần Đang chiếu liên kết tới `/movies/`; phần Sắp chiếu liên kết tới `/movies/?status=soon`.

CSS tiêu đề tại `public.css`, dòng 361–395:

```css
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 28px;
}

.section-dot {
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 50%;
}
```

`justify-content: space-between` đẩy tiêu đề sang trái và Xem tất cả sang phải. Liên kết đổi sang màu đỏ khi hover tại dòng 385–387.

## 5. Lưới và khoảng cách giữa các phim

Tại `public.css`, dòng 397–401:

```css
.poster-grid {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 32px 22px;
}
```

- `repeat(4, ...)`: bốn phim mỗi hàng.
- `32px`: khoảng cách giữa các hàng.
- `22px`: khoảng cách giữa các cột.

Nếu phần Sắp chiếu chỉ có hai phim, hai cột còn lại để trống nên xuất hiện vùng trống bên phải.

## 6. Cấu trúc một thẻ phim

Hàm `movieCard()` tại `public.js`, dòng 130–133:

```js
<article class="movie-card">
  <a class="poster-link" href="${filmLink(movie)}">
    <img src="${poster(movie)}" alt="Poster ${escape(movie.title)}">
    <span class="format-badge">2D</span>
    ${movie.age ? `<span class="age-badge">${escape(movie.age)}</span>` : ""}
    <span class="poster-action">Xem chi tiết</span>
  </a>

  <div class="movie-meta">
    <span>${escape(movie.genres?.slice(0, 2).join(", "))}</span>
    <time datetime="${escape(movie.date)}">${dateText(movie.date)}</time>
  </div>

  <h3>
    <a href="${filmLink(movie)}">${escape(movie.title)}</a>
  </h3>
</article>
```

Poster và tên phim đều dẫn tới `/movies/detail/?id=...`.

## 7. Khung poster

Tại `public.css`, dòng 407–421:

```css
.poster-link {
  display: block;
  position: relative;
  overflow: hidden;
  border-radius: 11px;
  aspect-ratio: 2/3;
  background: var(--surface);
}

.poster-link > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s ease;
}
```

`aspect-ratio: 2/3` giữ tỉ lệ poster; `object-fit: cover` phủ kín khung; `overflow: hidden` cắt phần ảnh phóng ra ngoài.

## 8. Hiệu ứng phóng ảnh

Tại dòng 423–425:

```css
.poster-link:hover > img {
  transform: scale(1.035);
}
```

Khi rê chuột, ảnh tăng lên 103,5%. `transition: transform .3s ease` làm chuyển động mềm trong 0,3 giây.

## 9. Nút Xem chi tiết xuất hiện khi hover

Trạng thái ẩn tại `public.css`, dòng 447–460:

```css
.poster-action {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translate(-50%,8px);
  opacity: 0;
  white-space: nowrap;
  background: var(--accent);
  border-radius: 50px;
  padding: 8px 16px;
  transition: opacity .2s, transform .2s;
}
```

Khi hover hoặc focus bàn phím, tại dòng 462–465:

```css
.poster-link:hover .poster-action,
.poster-link:focus-visible .poster-action {
  opacity: 1;
  transform: translate(-50%,0);
}
```

Nút vừa hiện dần từ `opacity: 0` lên `1`, vừa trượt lên 8px.

## 10. Nhãn 2D và độ tuổi

CSS chung tại `public.css`, dòng 427–445:

```css
.format-badge,.age-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 5px;
  padding: 1px 6px;
}

.age-badge {
  left: 10px;
  right: auto;
  background: #cf3535;
}
```

Nhãn 2D ở góc trên phải; nhãn P/T18 ở góc trên trái và chỉ xuất hiện khi `movie.age` có dữ liệu.

## 11. Thể loại, ngày và tên phim

Tại `public.css`, dòng 467–492:

```css
.movie-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--muted);
  font-size: 10px;
  margin: 12px 0 7px;
}

.movie-card h3 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}
```

`slice(0, 2)` chỉ lấy tối đa hai thể loại. Ngày được đổi từ `YYYY-MM-DD` sang `DD/MM/YYYY` bằng `dateText()` tại `public.js:15`.

## 12. Responsive

- Mặc định: bốn cột, `public.css:397–401`.
- Tối đa 1280px: ba cột, `public.css:1026–1028`.
- Tối đa 1023px: code hiện tại ghi đè thành bốn cột nhỏ, `public.css:1109–1111`.
- Tối đa 640px: hai cột và `gap: 26px 16px`, `public.css:1244–1247`.

## 13. Không có dữ liệu

Hàm `empty()` tại `public.js`, dòng 34–36, tạo thông báo. CSS `public.css`, dòng 494–510, dùng `grid-column: 1/-1` để thông báo chiếm toàn bộ chiều rộng lưới.

[Quay lại mục lục](#muc-luc)

---

# Bảng tra nhanh file và dòng code {#bang-tra-nhanh}

| Nội dung | File và dòng |
|---|---|
| Dữ liệu banner | `shared-state.js:27–39` |
| Tạo banner | `public.js:140–158` |
| Nút chuyển banner | `public.js:163–183` |
| CSS banner | `public.css:266–348` |
| Khung trang Lịch chiếu | `movies/index.html:1–26` |
| Header | `public.js:38–49` |
| Tài khoản header | `public.js:51–94` |
| Menu hamburger | `public.js:96–113` |
| Dữ liệu menu | `shared-state.js:20–25` |
| CSS menu | `public.css:183–211` |
| Tạo ô tìm kiếm | `public.js:210–214` |
| Lọc tên phim | `public.js:216–221` |
| Cập nhật kết quả | `public.js:225–239` |
| CSS tìm kiếm | `public.css:553–572` |
| Kiểm tra suất đã qua | `public.js:190–202` |
| CSS làm mờ | `public.css:1667–1686` |
| Chặn URL suất cũ | `shared-state.js:1203–1219` |
| Tạo ba tab trạng thái phim | `public.js:205–212` |
| Sự kiện bấm tab | `public.js:230–236` |
| Phân loại showing/soon/ended | `shared-state.js:730–741` |
| Tạo form Register/Login | `public.js:296–302` |
| Validation email trên giao diện | `public.js:307–332` |
| Regex email | `shared-state.js:1039–1041` |
| Điều kiện đăng ký | `shared-state.js:1102–1152` |
| Điều kiện đăng nhập | `shared-state.js:1155–1163` |
| Tạo hai khu phim trang chủ | `public.js:140–158` |
| Tạo một thẻ phim | `public.js:130–133` |
| Lưới và khoảng cách poster | `public.css:397–401` |
| Hover phóng ảnh | `public.css:416–425` |
| Hover hiện Xem chi tiết | `public.css:447–465` |

[Quay lại mục lục](#muc-luc)
