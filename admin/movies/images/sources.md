# Nguồn poster và điểm IMDb

Kho hiện có 19 phim mặc định trong `shared-state.js`. Làm mới ngày **19/10/2026**.

## Poster và điểm đánh giá

Điểm và số lượt đánh giá được đối chiếu theo mã phim trong [bộ dữ liệu IMDb công khai](https://data.imdb.com/non-commercial-datasets/), tệp [`title.ratings.tsv.gz`](https://datasets.imdbws.com/title.ratings.tsv.gz) tải ngày 18/10/2026. Đây là điểm IMDb trên thang 10, lưu cố định trong ứng dụng, không tự cập nhật.

Các liên kết trong cột nguồn poster là nguồn đã ghi nhận khi bổ sung ảnh. Poster có sẵn chưa lưu nguồn gốc được đánh dấu rõ, không suy đoán nguồn.

| Phim trong ứng dụng | Tệp poster | Nguồn poster | IMDb / 10 | Lượt đánh giá | Trang IMDb |
| --- | --- | --- | ---: | ---: | --- |
| Trại Buôn Người | `traibuonnguoi.jpg` | Ảnh có sẵn; chưa ghi nguồn gốc | 6.9 | 105 | [IMDb](https://www.imdb.com/title/tt46658129/) |
| Shaun The Sheep | `Shaunthesheep.jpg` | Ảnh có sẵn; chưa ghi nguồn gốc | 6.8 | 17,790 | [IMDb](https://www.imdb.com/title/tt6193408/) |
| Chiikawa: Bí mật đảo người cá | `chiikawa.jpg` | [CGV](https://www.cgv.vn/default/chiikawa-the-movie.html) | 7.4 | 766 | [IMDb](https://www.imdb.com/title/tt39026173/) |
| Người Mẹ Khác | `nguoi-me-khac.webp` | [Moveek](https://moveek.com/phim/nguoi-me-khac/) | 5.4 | 9,544 | [IMDb](https://www.imdb.com/title/tt36586020/) |
| Pháo hoa lúc bình minh | `a-new-dawn.jpg` | [CGV](https://www.cgv.vn/default/a-new-dawn.html) | 6.2 | 343 | [IMDb](https://www.imdb.com/title/tt32192760/) |
| Vùng Đất Quỷ Dữ | `vung-dat-quy-du-2026.webp` | [Moveek](https://moveek.com/phim/vung-dat-quy-du-2026/) | 7.6 | 106,053 | [IMDb](https://www.imdb.com/title/tt35538033/) |
| Verity: Bí Mật Bị Chôn Vùi | `bi-mat-bi-chon-vui.webp` | [Moveek](https://moveek.com/phim/bi-mat-bi-chon-vui/) | 6.1 | 17,841 | [IMDb](https://www.imdb.com/title/tt32261958/) |
| Quỷ Ăn Tạng 4: Hổ Tinh | `quy-an-tang-4-ho-tinh.webp` | [Moveek](https://moveek.com/phim/quy-an-tang-4-ho-tinh/) | 6.0 | 49 | [IMDb](https://www.imdb.com/title/tt42680348/) |
| Street Fighter | `street-fighter.webp` | [Moveek](https://moveek.com/phim/street-fighter/) | 6.2 | 3,725 | [IMDb](https://www.imdb.com/title/tt27419420/) |

Điểm của các phim giữ lại là dữ liệu tra cứu trước đợt làm mới. Các điểm mới được bổ sung ở bảng dưới; phim chưa xác minh được điểm vẫn để trống.

## Thông tin năm phim vừa cập nhật

Ngày khởi chiếu tại Việt Nam và thời lượng được đối chiếu với các trang Moveek tương ứng ở bảng trên.

| Phim | Tên gốc | Khởi chiếu tại Việt Nam | Thời lượng |
| --- | --- | --- | ---: |
| Người Mẹ Khác | Other Mommy | 09/10/2026 | 93 phút |
| Vùng Đất Quỷ Dữ | Resident Evil (2026) | 18/09/2026 | 94 phút |
| Verity: Bí Mật Bị Chôn Vùi | Verity | 16/10/2026 | 117 phút |
| Quỷ Ăn Tạng 4: Hổ Tinh | Death Whisperer: Saming the Werebeast | 16/10/2026 | 111 phút |
| Street Fighter | Street Fighter (2026) | 16/10/2026 | 119 phút |

Vùng Đất Quỷ Dữ có trong [danh sách đang chiếu của Moveek](https://moveek.com/dang-chieu/) ngày 18/10/2026 dù đã qua 21 ngày từ khi phát hành. `showingThrough` ghi nhận mốc xác minh này, không phải ngày kết thúc chiếu thực tế.

## Phạm vi dữ liệu

- Phim có ngày trước 2026 và các bản tái chiếu Avengers, Suzume, Marnie đã được thay bằng phim mới; poster không dùng đã xóa.
- Vé đặt và giờ chiếu là dữ liệu demo, không lấy từ lịch rạp thực tế.
- Điểm IMDb có thể thay đổi sau ngày tra cứu, nhất là phim mới có ít lượt đánh giá.

## Phim sắp chiếu, cập nhật 19/10/2026

- `clayface.webp`: https://res.anvui.vn/dwi5f2bje/image/upload/v1782099194/attachments_ncc/admin/vn_clay_vert_tsr_2764x4096_intl-1782099192844.jpg
- `klara-va-mat-troi.webp`: https://res.anvui.vn/dwi5f2bje/image/upload/v1782201675/attachments_ncc/admin/maxresdefault-1782201673437.jpg
- `huyet-thong.webp`: https://res.anvui.vn/dwi5f2bje/image/upload/v1790928437/attachments_ncc/admin/350x495-ht-1790928436591.jpg
- `an-mang-karaoke.webp`: https://res.anvui.vn/dwi5f2bje/image/upload/v1785981275/attachments_ncc/admin/_n_m_ng_karaoke_-_dkkc_02102026-_kthuoc_chu_n-1785981273935.jpg
- CLAYFACE: https://chieuphimquocgia.com.vn/movies/11248, khởi chiếu 2026-10-23.
- KLARA VÀ MẶT TRỜI: https://chieuphimquocgia.com.vn/movies/11251, khởi chiếu 2026-10-23.
- HUYẾT THỐNG: https://chieuphimquocgia.com.vn/movies/11367, khởi chiếu 2026-10-30.
- ÁN MẠNG KARAOKE: https://chieuphimquocgia.com.vn/movies/11294, khởi chiếu 2026-10-30.

## Làm mới kho ngày 19/10/2026

Đối chiếu danh sách đang chiếu và các ngày chiếu `ProjectDate` trên https://chieuphimquocgia.com.vn/. Ngày phát hành, thời lượng, thể loại, đạo diễn, diễn viên và trailer lấy từ dữ liệu công khai của rạp. Tóm tắt được rút gọn. `showingThrough` là ngày lịch chiếu đã xác nhận, không phải ngày kết thúc thực tế.

- **Án Mạng Xém Hoàn Hảo**: https://chieuphimquocgia.com.vn/movies/11317; khởi chiếu 2026-10-09, 124 phút. Poster `an-mang-xem-hoan-hao.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1787123424/attachments_ncc/admin/350x495-amxhh_-1787123423424.jpg
- **Cá Voi Nuốt Chửng**: https://chieuphimquocgia.com.vn/movies/11362; khởi chiếu 2026-10-16, 105 phút. Poster `ca-voi-nuot-chung.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1790756690/attachments_ncc/admin/poster_ca_voi_nuot_chung_1-1790756689446.jpg
- **Trái Tim Quái Thú**: https://chieuphimquocgia.com.vn/movies/11279; khởi chiếu 2026-10-02, 101 phút. Poster `trai-tim-quai-thu.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1784519975/attachments_ncc/admin/HOB_TeaserGreen_400x633-1784519973609.jpg
- **Lên Hương**: https://chieuphimquocgia.com.vn/movies/11282; khởi chiếu 2026-09-18, 121 phút. Poster `len-huong.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1788769696/attachments_ncc/admin/470wx700h-lh_1-1788769694961.jpg
- **Út Lan 2**: https://chieuphimquocgia.com.vn/movies/11315; khởi chiếu 2026-09-25, 107 phút. Poster `ut-lan-2.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1787106528/attachments_ncc/admin/350x495-utlan-1787106527605.jpg
- **Bát Tiên! Truy Tìm Lưu Ly Đăng**: https://chieuphimquocgia.com.vn/movies/11330; khởi chiếu 2026-09-11, 144 phút. Poster `bat-tien-truy-tim-luu-ly-dang.jpg`: https://res.anvui.vn/dwi5f2bje/image/upload/v1788422590/attachments_ncc/admin/350x495-battien-1788422589233.jpg

## Bổ sung điểm IMDb ngày 19/10/2026

Đối chiếu mã phim trên IMDb rồi lấy điểm từ [`title.ratings.tsv.gz`](https://datasets.imdbws.com/title.ratings.tsv.gz) tải ngày 19/10/2026. Dữ liệu cố định, không tự cập nhật.

| Phim | IMDb / 10 | Lượt đánh giá | Trang IMDb |
| --- | ---: | ---: | --- |
| Klara và Mặt Trời | 6.0 | 185 | [IMDb](https://www.imdb.com/title/tt14371256/) |
| Cá Voi Nuốt Chửng | 6.8 | 3,094 | [IMDb](https://www.imdb.com/title/tt28535715/) |
| Trái Tim Quái Thú | 7.2 | 27,901 | [IMDb](https://www.imdb.com/title/tt7526136/) |
| Lên Hương | 6.9 | 27 | [IMDb](https://www.imdb.com/title/tt40907993/) |
| Bát Tiên! Truy Tìm Lưu Ly Đăng | 8.0 | 1,282 | [IMDb](https://www.imdb.com/title/tt43515101/) |

Clayface (`tt34890576`), Án Mạng Xém Hoàn Hảo (`tt39285411`) và Út Lan 2 (`tt46566661`) chưa có dòng điểm trong bộ dữ liệu vừa tải. Không dùng điểm Clayface từ bản trang web lưu cũ vì khác với dữ liệu hiện tại. Huyết Thống và Án Mạng Karaoke chưa xác minh được điểm IMDb công bố. Các phim này giữ `null`, hiển thị “Chưa có điểm”.

Kho đã lưu chỉ được bổ sung điểm trống cho phim trùng mã và tên; điểm admin đã nhập, phim đã đổi tên hoặc xóa được giữ nguyên.
