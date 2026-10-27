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

[Quay lại mục lục](#muc-luc)
