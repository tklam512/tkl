# BẢN THUYẾT TRÌNH UCC TRONG 5 PHÚT

## Phân bổ thời gian

| Slide | Nội dung | Thời gian |
|---|---|---:|
| 1 | Giới thiệu đề tài | 20 giây |
| 2 | Kiến trúc chung | 35 giây |
| 3 | Trang chủ | 45 giây |
| 4 | Trang lịch chiếu | 55 giây |
| 5 | Trang đăng nhập | 45 giây |
| 6 | Trang đăng ký | 55 giây |
| 7 | Giao diện, lưu trữ và bảo mật | 35 giây |
| 8 | Kiểm thử, giới hạn và kết luận | 30 giây |
| **Tổng** | | **5 phút** |

---

## Slide 1 — Giới thiệu đề tài (20 giây)

### Nội dung chiếu

- Website UCC quản lý và đặt vé xem phim demo.
- Công nghệ: HTML5, CSS3 và JavaScript thuần.
- Trình bày bốn trang: Trang chủ, Lịch chiếu, Đăng nhập và Đăng ký.

### Lời thuyết trình

“Em xin trình bày bốn trang khách hàng chính của website UCC, gồm Trang chủ, Lịch chiếu, Đăng nhập và Đăng ký. Dự án sử dụng HTML, CSS và JavaScript thuần. Website cho phép khách xem phim, xem suất chiếu, tạo tài khoản và đăng nhập để tiếp tục luồng đặt vé demo.”

### Vị trí code

- `index.html:1–26`
- `movies/index.html:1–26`
- `login/index.html:1–26`
- `register/index.html:1–26`

---

## Slide 2 — Kiến trúc chung của bốn trang (35 giây)

### Nội dung chiếu

```text
HTML tạo khung
    ↓
shared-state.js cung cấp dữ liệu và xác thực
    ↓
public.js dựng giao diện và xử lý sự kiện
    ↓
public.css định dạng và responsive
```

- `data-page` quyết định nội dung cần dựng.
- Header, menu, tài khoản và footer được dùng chung.
- `localStorage` chia sẻ dữ liệu giữa các trang.

### Lời thuyết trình

“Bốn file HTML chỉ tạo khung gồm header, main và footer. Điểm khác nhau quan trọng nằm ở thuộc tính `data-page`: trang chủ là `home`, lịch chiếu là `movies`, đăng nhập là `login` và đăng ký là `register`. `shared-state.js` được tải trước để cung cấp dữ liệu phim, suất chiếu và tài khoản. Sau đó `public.js` đọc `data-page` và gọi đúng hàm dựng giao diện. Header, menu, trạng thái tài khoản và footer chỉ viết một lần nên các trang luôn thống nhất.”

### Vị trí code

- Khung và thứ tự script: dòng `15–24` của mỗi file HTML.
- Đọc `data-page`: `public.js:2–4`.
- Header và menu: `public.js:38–49`.
- Trạng thái tài khoản: `public.js:51–94`.
- Điều phối trang: `public.js:402–416`.

---

## Slide 3 — Trang chủ `index.html` (45 giây)

### Nội dung chiếu

- Hiển thị carousel phim nổi bật.
- Nút trước, sau và chấm chọn banner.
- Danh sách phim đang chiếu: tối đa 8 phim.
- Danh sách phim sắp chiếu: tối đa 4 phim.
- Mỗi thẻ có poster, thể loại, ngày, độ tuổi và liên kết chi tiết.
- Có thông báo khi danh sách trống.

### Lời thuyết trình

“Tại `index.html`, `data-page` bằng `home` nên chương trình gọi hàm `home`. Hàm này lấy toàn bộ phim, sắp xếp theo ngày rồi dùng `movieStatus` để tách phim đang chiếu và sắp chiếu. Banner chỉ được hiển thị nếu phim tương ứng vẫn tồn tại. Carousel cho phép bấm nút trước, sau hoặc chấm chọn; công thức modulo giúp quay vòng từ banner cuối về đầu. Bên dưới là tối đa tám phim đang chiếu và bốn phim sắp chiếu. Component `movieCard` tạo thống nhất poster, thể loại, ngày khởi chiếu, nhãn tuổi và liên kết sang trang chi tiết.”

### Vị trí code

- Kích hoạt trang chủ: `index.html:15`, `public.js:402–404`.
- Thẻ phim dùng chung: `public.js:130–137`.
- Lọc và dựng trang chủ: `public.js:139–158`.
- Điều khiển carousel: `public.js:160–183`.
- Xác định trạng thái phim: `shared-state.js:730–741`.
- CSS banner và lưới phim: `public.css:266–500`.

---

## Slide 4 — Trang lịch chiếu `movies/index.html` (55 giây)

### Nội dung chiếu

- Ba tab: Đang chiếu, Sắp chiếu, Tất cả phim.
- Hỗ trợ URL `?status=soon` và `?status=all`.
- Tìm phim theo tên, không phân biệt hoa thường.
- Hiển thị poster, thể loại, thời lượng, xuất xứ, ngày và độ tuổi.
- Lịch hôm nay gồm giờ, phòng và giá vé.
- Suất còn hiệu lực dẫn tới trang đặt vé; suất đã qua bị vô hiệu hóa.

### Lời thuyết trình

“Trang lịch chiếu gọi hàm `movies`. Chương trình đọc tham số `status` trên URL để chọn một trong ba tab. Hàm `render` lấy nội dung ô tìm kiếm, chuyển cả từ khóa và tên phim về chữ thường tiếng Việt, kết hợp điều kiện tên với trạng thái rồi sắp xếp theo ngày. Với từng phim, hàm `showtimes` chỉ lấy các suất của ngày hôm nay và sắp xếp theo giờ. Mỗi suất hiển thị giờ, phòng và giá tiền. Nếu thời điểm chiếu đã qua thì không còn liên kết đặt vé; nếu còn hiệu lực thì chuyển sang `/booking` kèm mã suất chiếu. Khi không tìm thấy phim hoặc không có suất, trang hiển thị thông báo rõ ràng.”

### Vị trí code

- Kích hoạt trang: `movies/index.html:15`, `public.js:405–406`.
- Hiển thị giờ chiếu: `public.js:186–202`.
- Đọc query và tạo bộ lọc: `public.js:205–214`.
- Tìm kiếm, lọc và render: `public.js:216–240`.
- Dữ liệu suất chiếu demo: `shared-state.js:968–1015`.
- CSS lịch chiếu: `public.css:532–685`.

---

## Slide 5 — Trang đăng nhập `login/index.html` (45 giây)

### Nội dung chiếu

- Form gồm email và mật khẩu.
- Kiểm tra định dạng email bằng thông báo tiếng Việt.
- Nút Hiện/Ẩn mật khẩu.
- Khóa nút trong lúc xử lý để tránh gửi lặp.
- Đăng nhập đúng tạo phiên; đăng nhập sai báo lỗi chung.
- Có liên kết Đăng ký và đăng nhập dành cho nhân viên UCC.
- Chỉ cho chuyển về Trang đặt vé hoặc Vé của tôi qua tham số `next` an toàn.

### Lời thuyết trình

“Trang đăng nhập gọi `auth(false)`, vì vậy form chỉ tạo email và mật khẩu. Email được kiểm tra khi người dùng rời ô hoặc tiếp tục nhập. Nút Hiện/Ẩn thay đổi kiểu input nhưng giữ nguyên giá trị. Khi submit, form được kiểm tra, nút bị khóa rồi gọi `customerAuth.login`. Hàm này chuẩn hóa email, băm mật khẩu nhập vào với salt đã lưu và so sánh hash. Nếu đúng, chương trình chỉ lưu ID phiên và chuyển về trang phù hợp; nếu sai, nó dùng một thông báo chung để không tiết lộ email có tồn tại hay không.”

### Vị trí code

- Kích hoạt đăng nhập: `login/index.html:15`, `public.js:415–416`.
- Tạo form: `public.js:296–302`.
- Kiểm tra email: `public.js:307–332`.
- Hiện/ẩn mật khẩu: `public.js:334–348`.
- Submit và xử lý lỗi: `public.js:356–399`.
- Nghiệp vụ đăng nhập: `shared-state.js:1155–1163`.

---

## Slide 6 — Trang đăng ký `register/index.html` (55 giây)

### Nội dung chiếu

- Họ và tên, điện thoại, email.
- Mật khẩu và nhập lại mật khẩu.
- Bắt buộc đồng ý điều khoản sử dụng.
- Kiểm tra dữ liệu ở cả form và tầng nghiệp vụ.
- Chặn email trùng.
- Mật khẩu được băm bằng PBKDF2-SHA256, 600.000 vòng và salt riêng.
- Đăng ký thành công tự đăng nhập.

### Lời thuyết trình

“Trang đăng ký gọi cùng hàm `auth` nhưng truyền `true`, nên form có thêm họ tên, điện thoại, nhập lại mật khẩu và điều khoản. Giao diện kiểm tra email, độ dài mật khẩu từ 8 đến 128 ký tự và hai mật khẩu phải khớp. Ở tầng nghiệp vụ, `customerAuth.register` tiếp tục kiểm tra họ tên, số điện thoại, email, điều khoản và email trùng. Mỗi tài khoản có salt riêng; mật khẩu được băm bằng PBKDF2 với SHA-256 trong 600 nghìn vòng. Hệ thống chỉ lưu salt và password hash, không lưu mật khẩu gốc. Sau khi tạo tài khoản thành công, ID người dùng được lưu làm phiên nên khách được tự động đăng nhập.”

### Vị trí code

- Kích hoạt đăng ký: `register/index.html:15`, `public.js:415–416`.
- Các trường và ràng buộc form: `public.js:301–302`.
- Kiểm tra hai mật khẩu: `public.js:350–372`.
- Gọi nghiệp vụ đăng ký: `public.js:380–390`.
- Băm mật khẩu: `shared-state.js:1071–1086`.
- Validation và chống trùng: `shared-state.js:1102–1137`.
- Lưu tài khoản và phiên: `shared-state.js:1139–1152`.

---

## Slide 7 — Giao diện, lưu trữ và bảo mật (35 giây)

### Nội dung chiếu

- Responsive cho desktop, tablet và mobile.
- Menu hamburger, đóng bằng phím Escape.
- Hỗ trợ bàn phím và trình đọc màn hình bằng ARIA.
- Dữ liệu phim, suất chiếu và tài khoản dùng chung qua `localStorage`.
- `escape()` bảo vệ dữ liệu khi chèn vào HTML.
- Không lưu mật khẩu nguyên văn.

### Lời thuyết trình

“Giao diện đáp ứng ba nhóm màn hình. Ở tablet và điện thoại, menu chuyển thành hamburger; lưới phim, poster và form tự thu gọn. Các thuộc tính như `aria-current`, `aria-expanded`, `aria-pressed`, `aria-live` và focus outline hỗ trợ bàn phím cùng trình đọc màn hình. Dữ liệu được dùng chung giữa các trang bằng `localStorage`, còn sự kiện `storage` cập nhật tài khoản giữa nhiều tab. Dữ liệu trước khi chèn vào HTML được chạy qua hàm `escape`.”

### Vị trí code

- Thoát dữ liệu và kiểm tra poster: `public.js:6–32`.
- Menu mobile: `public.js:96–113`.
- Đồng bộ giữa tab: `public.js:81–94`.
- API dữ liệu dùng chung: `shared-state.js:865–938`.
- Responsive: `public.css:980–1430`.
- CSS form và mật khẩu: `public.css:830–913`, `public.css:1513–1605`.

---

## Slide 8 — Kiểm thử, giới hạn và kết luận (30 giây)

### Nội dung chiếu

- 14 bài kiểm thử logic đã đạt.
- Bốn trang đã chạy đạt trên Chromium desktop 1440 px và mobile 390 px.
- Đã kiểm tra carousel, tìm kiếm, lọc, đăng ký, đăng nhập và đăng xuất.
- Giới hạn: chưa có backend, database và thanh toán thật.
- `localStorage` phù hợp demo nhưng không phải xác thực production.

### Lời thuyết trình

“Em đã chạy 14 bài kiểm thử logic và kiểm thử trực tiếp bốn trang bằng Chromium ở desktop và mobile. Các chức năng carousel, lọc phim, lịch chiếu, đăng ký, đăng nhập sai, đăng nhập đúng và đăng xuất đều hoạt động. Điểm cần lưu ý là đây vẫn là bản demo frontend: dữ liệu nằm trong trình duyệt, chưa có backend, database hoặc thanh toán thật. Khi triển khai thực tế cần chuyển xác thực và đặt vé sang máy chủ. Như vậy, bốn trang đã hoàn thành đầy đủ chức năng trong phạm vi bài tập.”

### Vị trí kiểm thử

- Tuyến trang: `tests/public-routes.test.js:1–22`.
- Xác thực: `tests/public-auth.test.js:1–61`.
- Dữ liệu dùng chung: `tests/shared-state.test.js:1–137`.
- Suất chiếu: `tests/demo-screenings.test.js:1–66`.

---

# BẢNG TRA NHANH KHI GIẢNG VIÊN HỎI CODE

| Câu hỏi | Vị trí trả lời nhanh |
|---|---|
| Trang được chọn bằng cách nào? | `data-page` ở dòng 15 mỗi HTML; `public.js:402–416` |
| Trang chủ lọc phim ở đâu? | `public.js:140–145`; `shared-state.js:730–741` |
| Carousel hoạt động ở đâu? | `public.js:160–183` |
| Tìm kiếm phim ở đâu? | `public.js:216–221`, `public.js:238–239` |
| Suất đã qua bị khóa ở đâu? | `public.js:197–201` |
| Form đăng nhập/đăng ký ở đâu? | `public.js:296–400` |
| Mật khẩu được bảo vệ thế nào? | `shared-state.js:1071–1086` |
| Đăng ký tài khoản ở đâu? | `shared-state.js:1102–1152` |
| Đăng nhập ở đâu? | `shared-state.js:1155–1163` |
| Responsive ở đâu? | `public.css:980–1430` |

# GỢI Ý DEMO NẾU CÒN 30 GIÂY

1. Ở Trang chủ, bấm nút chuyển banner.
2. Sang Lịch chiếu, tìm từ khóa “Street”.
3. Mở Đăng ký, bấm Hiện mật khẩu.
4. Kết luận rằng cùng dữ liệu và cùng component được tái sử dụng trên bốn trang.
