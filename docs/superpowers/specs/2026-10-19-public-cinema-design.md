# Giao diện user BTL

Phạm vi đã được người dùng xác nhận trong chat: dựng các trang giao diện trước, theo bản desktop https://chieuphimquocgia.com.vn/, bỏ popup quảng cáo. Giữ khu vực quản trị /admin/ và dữ liệu nghiệp vụ trong shared-state.js.

Tin tức, Khuyến mãi và Liên hoan phim đã được gỡ hoàn toàn cùng các ảnh liên quan.

## Trang và nội dung

- /: header, banner chuyển trang, phim đang chiếu/sắp chiếu, footer.
- /movies/: danh sách phim/lịch chiếu với ngày hôm nay cố định, tìm kiếm và thông tin suất chiếu dùng chung với admin.
- /movies/detail/?id=: poster, thông tin phim và lịch chiếu thực có trong dữ liệu.
- /ticket-price/, /about/: các phần tương ứng với website mẫu.
- /login/, /register/: giao diện tài khoản có validation và thông báo inline, chưa thực hiện xác thực hoặc lưu mật khẩu.

## Triển khai

Giữ HTML/CSS/JavaScript thuần, không thêm thư viện. Mỗi URL có index.html riêng. public.css và public.js dùng chung cho phía user, không dùng stylesheet hoặc shell admin. Dữ liệu nội dung mới nằm trong cinemaState.site, phim và suất chiếu đọc các API cinemaState hiện có. Ảnh/font lưu cục bộ có ghi nguồn. Ngày trên lịch tính theo giờ Việt Nam. Không sửa hoặc tự xóa dữ liệu localStorage đã có.

## Kiểm tra

Kiểm tra đường dẫn/tài nguyên, các API dữ liệu, phim không tồn tại, tìm kiếm rỗng, ngày không có suất, liên kết từ admin sang dữ liệu user, thao tác bàn phím và menu màn hình nhỏ. Kiểm tra trình duyệt ở desktop, laptop/tablet và mobile; không có lỗi console, tài nguyên 404 hoặc tràn ngang.

## Giới hạn đã chốt

Chưa xây dựng chọn ghế, tạo đơn/vé, thanh toán hoặc tài khoản thật. Không gọi API nghiệp vụ của website gốc. Không lấy cookie, tài khoản hoặc thông tin cá nhân từ trình duyệt của người dùng. Không bật video/audio tự chạy.
