# UCC — Quản lý bán vé xem phim

Ứng dụng bài tập lớn bằng HTML, CSS và JavaScript thuần, gồm website khách hàng và trang quản trị. Khách có thể đăng ký, xem lịch chiếu, chọn ghế, xác nhận thanh toán demo và xem lại vé. Admin quản lý phim, thể loại, suất chiếu, sản phẩm và danh sách vé.

Dữ liệu dùng chung qua `shared-state.js` và bộ nhớ trình duyệt. Dự án **chưa có backend, cơ sở dữ liệu máy chủ hoặc thanh toán thật**.

## Chạy trên máy

Không cần biên dịch hay cài thư viện để chạy ứng dụng. Tại thư mục gốc của dự án, khởi động máy chủ web cục bộ:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- Website khách hàng: [http://127.0.0.1:8000/](http://127.0.0.1:8000/).
- Trang quản trị: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).

| Tài khoản quản trị demo | Giá trị |
| --- | --- |
| Tên tài khoản | `utcadmin` |
| Mật khẩu | `12345678` |

Khách hàng tự tạo tài khoản tại [Đăng ký](http://127.0.0.1:8000/register/). Tài khoản khách không cấp quyền quản trị.

Không mở trực tiếp bằng `file://`. Dùng nhất quán cùng địa chỉ khi mở các tab: `localhost` và `127.0.0.1` có kho dữ liệu riêng, dù cùng trỏ tới máy này. Web Crypto cần localhost hoặc HTTPS để xử lý mật khẩu.

## Website khách hàng

| Đường dẫn | Chức năng |
| --- | --- |
| `/` | Trang chủ, banner chuyển thủ công, phim đang chiếu và sắp chiếu. |
| `/movies/` | Tìm phim, lọc trạng thái và xem lịch chiếu hôm nay. |
| `/movies/detail/?id=15` | Chi tiết phim, trailer khi có, nền ảnh phim và các giờ chiếu có thể đặt vé. |
| `/booking/?screening=...` | Chọn ghế, xem tổng tiền, chọn phương thức và xác nhận thanh toán demo. |
| `/my-tickets/` | Vé của tài khoản đang đăng nhập, mới nhất trước. |
| `/ticket-price/` | Bảng giá tham khảo bằng ảnh và bảng văn bản. |
| `/about/` | Giới thiệu, dịch vụ, liên hệ, hỏi đáp và thông tin sử dụng. |
| `/register/`, `/login/` | Đăng ký, đăng nhập và đăng xuất khách hàng. |

Menu có **Vé của tôi** sau khi đăng nhập. Trang này hiển thị phim, mã vé, ngày giờ, phòng, ghế, tổng tiền, trạng thái và phương thức thanh toán. Khi chưa có vé, trang hướng dẫn đặt vé; khi đăng xuất, tab và dữ liệu vé cá nhân được ẩn. Vé lọc theo mã tài khoản, không ghép theo tên và không đưa vé của khách mẫu vào tài khoản thật.

Form đăng ký dùng **một ô Họ và tên**, số điện thoại, email, mật khẩu 8–128 ký tự, xác nhận mật khẩu và điều khoản sử dụng. Email được kiểm tra định dạng, không xác minh hộp thư tồn tại. Các ô mật khẩu mặc định ẩn, có nút hiện/ẩn riêng. Email đăng nhập không phân biệt hoa thường; email đã đăng ký không được tạo trùng.

Đăng ký thành công tự đăng nhập. Nếu đang đặt vé, đăng nhập hoặc đăng ký xong sẽ quay lại bước thanh toán, giữ lựa chọn và thời gian còn lại; không tự xác nhận thanh toán. Trang đăng nhập có nút **Bạn thuộc UCC?** dẫn tới đăng nhập quản trị.

Các trang khách hàng dùng Lenis để cuộn mượt, giữ cuộn cảm ứng mặc định và tắt hiệu ứng khi bật chế độ giảm chuyển động. Không có popup quảng cáo, trang Tin tức, Khuyến mãi hay Liên hoan phim.

## Luồng đặt vé

1. Chọn giờ chiếu ở Lịch chiếu hoặc Chi tiết phim. Suất đã qua giờ bắt đầu không cho đặt.
2. Chọn ghế trên sơ đồ. Khách chưa đăng nhập vẫn dùng được bước này và xem thông tin thanh toán.
3. Chọn phương thức: **VNPay**, **MoMo** hoặc **thẻ quốc tế**. VNPay được chọn mặc định; phương thức đã đổi được giữ trong lượt đặt vé.
4. Xác nhận thông tin và điều khoản sử dụng, rồi bấm xác nhận thanh toán demo. Chỉ tại bước này mới yêu cầu đăng nhập.
5. Hệ thống kiểm tra lại suất, ghế, tổng tiền và thời gian chọn ghế, sau đó lưu vé. Biên nhận có mã vé và nút đi tới **Vé của tôi**; tab Danh sách vé của admin đang mở cũng tự cập nhật.

### Ghế và giá vé

- Có **15 phòng**, mỗi phòng **124 ghế**: hàng A–H mỗi hàng 14 ghế, hàng I có 12 ghế. Admin và sơ đồ khách hàng dùng cùng số lượng.
- Ghế VIP nằm ở hàng D–H, số 3–12. Hàng I là ghế đôi, chọn theo cặp.
- Ghế đã đặt tô xám, có dấu × và không chọn được; ghế đang chọn tô xanh.
- Giá ghế thường bằng giá suất chiếu. VIP cộng 10.000đ/ghế, ghế đôi cộng 15.000đ/ghế. Phí bằng 0; không có voucher, khuyến mãi hoặc giảm giá.
- Tổng tiền được tính lại trong `cinemaState.booking`, không tin tổng tiền gửi từ giao diện.

Thời gian chọn ghế là **10 phút**, được giữ khi tải lại hoặc đi đăng nhập. Đồng hồ không phải cơ chế giữ chỗ: trước khi lưu, hệ thống kiểm tra ghế đã bị đặt ở tab khác chưa. Ghế bị đặt trùng được bỏ khỏi lựa chọn để khách chọn lại. Web Locks tuần tự hóa thao tác xác nhận giữa các tab trên trình duyệt có hỗ trợ; mã yêu cầu giúp tránh tạo vé lặp khi gửi lại.

**Thanh toán chỉ mô phỏng:** không kết nối cổng VNPay/MoMo, không thu tiền và không yêu cầu thông tin thẻ. Trạng thái “Đã thanh toán” là trạng thái của vé demo.

### Lịch chiếu và chín khách mẫu

Mỗi ngày khi mở ứng dụng, hệ thống bổ sung suất mẫu **10:00** và **19:30** cho các phim trong danh sách gán phòng còn đang chiếu. Giá suất mặc định lần lượt là 75.000đ và 90.000đ. Mỗi ngày chỉ thêm một lần, bỏ qua phim/phòng không còn tồn tại hoặc giờ trùng suất của admin. Suất đã sửa, xóa trong ngày không tự khôi phục.

Chỉ dùng **9 khách mẫu gốc**, không tạo thêm “Khách demo” cho từng suất. Các vé mẫu còn tồn tại được gán vào một số suất trong ngày, ưu tiên phim đang ghi trên vé nếu có suất phù hợp; giữ tên và số lượng ghế, tính lại tổng tiền. Những suất khác có thể trống hoàn toàn. Qua ngày không nhân bản khách hoặc khôi phục vé đã xóa. Vé do tài khoản khách tự đặt được giữ riêng và không bị chuyển sang ngày mới.

Ghế của vé mẫu và vé khách đều đọc từ cùng `btl-bookings`, nên sơ đồ ghế và danh sách admin khớp nhau. Dữ liệu “Khách demo” thừa của bản cũ được dọn khi ứng dụng tải.

Mã vé theo mẫu **`UCC_DD_XXXXXXXXXX`**, ví dụ `UCC_20_9834YG89R3`: hai chữ số ngày tạo mã và chuỗi ngẫu nhiên 10 ký tự A–Z, 0–9. Mã cũ được đổi một lần; liên kết biên nhận cũ vẫn được giữ.

## Trang quản trị

| Đường dẫn | Chức năng |
| --- | --- |
| `/admin/` | Chuyển tới Tổng quan; yêu cầu đăng nhập quản trị. |
| `/admin/home/` | Đồng hồ, tổng số phim, phim đang chiếu và tổng lượt đặt vé. |
| `/admin/movies/` | Thêm, sửa, xóa, tìm kiếm, lọc phim và xem điểm IMDb đã lưu. |
| `/admin/genres/` | Thêm, sửa, xóa và tìm thể loại. |
| `/admin/showtimes/` | Lọc suất theo ngày/phim; thêm, sửa, xóa suất; chọn Phòng 1–15, kiểm tra thời gian trùng và ngày phát hành. |
| `/admin/products/` | Quản lý đồ ăn, nước uống, combo và ảnh sản phẩm. |
| `/admin/booking/` | Vé mẫu và vé khách tự đặt; tìm theo mã, khách, phim; sắp theo suất chiếu mới nhất, cập nhật từ tab khác và giữ bộ lọc đang dùng. |

Không còn màn hình quản lý Rạp chiếu riêng. Vé và suất chiếu hiển thị phòng. Nhấn ngày khởi chiếu trong bảng phim để mở trang suất chiếu tương ứng. Nhấn mã vé trong admin hiện chỉ mở thông báo, chưa có trang chi tiết vé quản trị.

Poster và ảnh sản phẩm hỗ trợ chọn tệp, kéo thả, xem trước; nhận JPG, PNG, GIF tối đa 5 MB. Ảnh được lưu dạng data URL trong trình duyệt, không tải lên máy chủ.

Sidebar dùng liên kết trang HTML, lưu trạng thái thu gọn và đồng bộ giữa các tab. Đăng nhập quản trị dùng `sessionStorage` riêng từng tab.

## Lưu trữ và giới hạn

| Dữ liệu | Nơi lưu |
| --- | --- |
| Phim, thể loại, suất chiếu, vé, sản phẩm, dữ liệu phòng | `localStorage`: các khóa `btl-movies`, `btl-genres`, `btl-screenings`, `btl-bookings`, `btl-products`, `btl-theaters`. |
| Tài khoản khách và phiên đăng nhập | `localStorage`: `btl-customers`, `btl-customer-session`. |
| Lựa chọn ghế, phương thức, hạn chọn ghế và biên nhận của lượt đặt | `sessionStorage`: `btl-booking-draft-...`. |
| Phiên quản trị | `sessionStorage`: `btl.loggedIn`. |
| Trạng thái sidebar | `localStorage`: `btl.sidebarCollapsed`. |

Dữ liệu được giữ khi tải lại trang, dùng chung trên cùng trình duyệt và cùng nguồn (giao thức, hostname, cổng). Tài khoản khách, Vé của tôi, ghế đã đặt và bảng vé admin đồng bộ giữa các tab; các màn hình quản lý khác có thể cần tải lại để đọc dữ liệu mới.

`shared-state.js` cung cấp `cinemaState` cho dữ liệu nghiệp vụ, `cinemaState.booking` cho kiểm tra và lưu vé, `customerAuth` cho tài khoản. Mật khẩu khách dùng PBKDF2 SHA-256, 600.000 vòng với salt riêng, không lưu nguyên văn. Tài khoản cũ tách họ/tên vẫn được đọc sau khi form chuyển sang một ô họ tên.

Chỉnh sửa dữ liệu mặc định trong `shared-state.js` không ghi đè các bản đã lưu. Các đợt cập nhật dữ liệu dùng dấu mốc để nhập một lần và giữ chỉnh sửa/xóa của người dùng. Danh mục mặc định hiện có 19 phim từ năm 2026; điểm IMDb là dữ liệu tra cứu cố định, không cập nhật tự động. Trạng thái đang chiếu dùng ngày khởi chiếu, khoảng 21 ngày và mốc `showingThrough` nếu có.

Chỉ dùng thông tin thử nghiệm. Xác thực và dữ liệu hoàn toàn ở phía trình duyệt, có thể bị sửa bằng công cụ phát triển; đây không phải phân quyền hoặc khóa ghế an toàn cho bán vé thật. Không đồng bộ giữa thiết bị, hồ sơ trình duyệt hoặc nguồn localhost khác nhau. Xóa dữ liệu website sẽ làm mất tài khoản và vé tại nguồn đó. Cần backend, cơ sở dữ liệu và cổng thanh toán trước khi triển khai thực tế.

## Cấu trúc dự án

```text
BTL/
├── index.html                 # Trang chủ
├── shared-state.js            # Dữ liệu, tài khoản và logic đặt vé dùng chung
├── public.js                  # Menu và tương tác các trang khách hàng
├── public.css                 # Giao diện khách hàng
├── public-scroll.js           # Cấu hình cuộn Lenis
├── movies/                    # Lịch chiếu và chi tiết phim
├── booking/                   # Chọn ghế, thanh toán demo, biên nhận
├── my-tickets/                # Vé của tài khoản đang đăng nhập
├── login/
├── register/
├── ticket-price/
├── about/
├── admin/                     # Tổng quan, phim, thể loại, suất, sản phẩm, vé
├── assets/
│   ├── ucc/                   # Logo, font, ảnh giới thiệu, banner và bảng giá
│   ├── booking/               # Màn chiếu và logo thanh toán
│   └── vendor/lenis/          # Lenis 1.3.27, kèm giấy phép MIT
├── docs/
└── tests/
```

Nguồn poster và điểm IMDb nằm tại [admin/movies/images/sources.md](admin/movies/images/sources.md); nguồn tài nguyên chung tại [assets/ucc/sources.md](assets/ucc/sources.md). Ảnh màn chiếu, VNPay, MoMo và ảnh giới thiệu do người dùng cung cấp. Font Montserrat và Lenis được lưu cục bộ; một số font/icon của admin và ảnh sản phẩm mẫu vẫn dùng nguồn ngoài, nên cần mạng để tải đủ các tài nguyên đó.

## Kiểm thử

Các kiểm thử logic dưới đây chỉ cần Node.js; không cần cài thư viện để chạy chúng:

```sh
node tests/shared-state.test.js
node tests/catalog-refresh.test.js
node tests/upcoming-movies.test.js
node tests/demo-screenings.test.js
node tests/imdb-ratings.test.js
node tests/public-auth.test.js
node tests/customer-booking.test.js
node tests/demo-booked-seats.test.js
node tests/my-tickets.test.js
node tests/booking-sort.test.js
node tests/sidebar-state.test.js
node tests/routes.test.js
node tests/public-routes.test.js
node tests/public-scroll.test.js
```

Kiểm thử giao diện cần **Playwright**, Chromium hoặc Chrome phù hợp và máy chủ ở trên đang chạy. Đây là công cụ kiểm thử tùy chọn, không phải điều kiện để chạy website:

```sh
node tests/public-ui.test.js
node tests/customer-booking-ui.test.js
node tests/form-dialog.test.js
node tests/image-upload.test.js
```

Mặc định các bài giao diện truy cập `http://127.0.0.1:8000/`. Dùng `BASE_URL` để đổi địa chỉ và `CHROME_PATH` để dùng tệp thực thi Chrome có sẵn thay cho Chromium của Playwright.
