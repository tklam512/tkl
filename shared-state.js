(() => {
  // Chuyển dữ liệu cũ từ phiên làm việc sang bộ nhớ trình duyệt.
  for (const key of ["btl-movies", "btl-screenings", "btl-bookings", "btl-genres"]) {
    if (localStorage.getItem(key) === null && typeof sessionStorage !== "undefined") {
      const previous = sessionStorage.getItem(key);

      if (previous !== null)
        localStorage.setItem(key, previous);
    }
  }

  // Thông tin rạp và dữ liệu mẫu khi chưa có dữ liệu đã lưu.
  const defaultSite = {
    "name": "Trung tâm Chiếu phim Giao thông vận tải",
    "owner": "Đại học Giao thông vận tải",
    "englishName": "UTC Cinema Center",
    "address": "3 Cầu Giấy, phường Láng, Hà Nội",
    "phone": "024 3766 3311",

    "navigation": [
      ["/", "Trang chủ"],
      ["/movies/", "Lịch chiếu"],
      ["/ticket-price/", "Giá vé"],
      ["/about/", "Giới thiệu"]
    ],

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
    }],

    "ticketPrices": [{
      "image": "/assets/ucc/price-2d.png",
      "title": "Bảng giá vé phim 2D",

      "rows": [
        ["Trước 12:00", 55000, 65000, 140000, 70000, 80000, 170000],
        ["Từ 12:00 đến trước 17:00", 70000, 75000, 160000, 80000, 85000, 180000],
        ["Từ 17:00 đến trước 23:00", 80000, 85000, 180000, 90000, 95000, 200000],
        ["Từ 23:00", 65000, 70000, 150000, 75000, 80000, 170000]
      ]
    }, {
      "image": "/assets/ucc/price-3d.png",
      "title": "Bảng giá vé phim 3D",

      "rows": [
        ["Trước 12:00", 60000, 80000, 160000, 80000, 100000, 200000],
        ["Từ 12:00 đến trước 17:00", 80000, 90000, 180000, 100000, 110000, 220000],
        ["Từ 17:00 đến trước 23:00", 100000, 110000, 220000, 130000, 140000, 280000],
        ["Từ 23:00", 100000, 110000, 220000, 120000, 130000, 260000]
      ]
    }],

    "about": {
      "image": "/assets/ucc/about-utc.png",

      "paragraphs": [
        "Trung tâm Chiếu phim Giao thông vận tải, UTC Cinema Center, là địa điểm chiếu phim tại 3 Cầu Giấy, phường Láng, Hà Nội",
        "UCC giới thiệu phim Việt Nam và quốc tế, tổ chức các tuần phim, liên hoan phim và hoạt động giao lưu dành cho người yêu điện ảnh.",
        "Bên cạnh hệ thống phòng chiếu 2D và 3D, Trung tâm có các dịch vụ tổ chức sự kiện, chương trình chiếu phim tập thể và không gian giải trí cho khán giả."
      ],

      "services": "Chiếu phim 2D và 3D, tổ chức liên hoan phim, tuần phim, giao lưu điện ảnh và các chương trình chiếu phim dành cho tập thể.",

      "faq": [[
        "Xem lịch chiếu phim ở đâu?",
        "Vào mục Lịch chiếu để xem các suất hôm nay, rồi chọn giờ chiếu để đặt vé demo."
      ], [
        "Tôi có thể mua vé trên bản giao diện này chưa?",
        "Bạn có thể chọn suất, chọn ghế và tạo vé demo. Chỉ cần đăng nhập khi xác nhận thanh toán; website không thu tiền thật."
      ]]
    },

    "priceColumns": [
      "Thứ 2–5: Ghế thường",
      "Thứ 2–5: Ghế VIP",
      "Thứ 2–5: Ghế đôi",
      "Thứ 6, 7, CN, Lễ: Ghế thường",
      "Thứ 6, 7, CN, Lễ: Ghế VIP",
      "Thứ 6, 7, CN, Lễ: Ghế đôi"
    ]
  };

  const defaultGenres = [{
    id: 1,
    name: "Hoạt hình",
    description: "Phim hoạt hình cho mọi lứa tuổi"
  }, {
    id: 2,
    name: "Chính kịch",
    description: "Phim chính kịch nghiêm túc"
  }, {
    id: 3,
    name: "Phiêu lưu",
    description: "Phim phiêu lưu mạo hiểm"
  }, {
    id: 4,
    name: "Khoa học viễn tưởng",
    description: "Phim khoa học viễn tưởng"
  }, {
    id: 5,
    name: "Kinh dị",
    description: "Phim kinh dị, giật gân"
  }, {
    id: 6,
    name: "Hài",
    description: "Phim hài kịch giải trí"
  }, {
    id: 7,
    name: "Tình cảm",
    description: "Phim tình cảm, lãng mạn"
  }, {
    id: 8,
    name: "Hành động",
    description: "Phim hành động"
  }, {
    id: 9,
    name: "Sinh tồn",
    description: "Phim sinh tồn, kịch tính"
  }];

  const defaultProducts = [{
    id: 1,
    name: "Bắp rang bơ (Vừa)",
    category: "Đồ ăn",
    price: 45000,
    stock: 100,
    status: "active",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvYAr3P0zz2NjVc6vGNKkO4EVw-TdlrHJdLWeikFyXnOnju3Q8aiZrVKU&s=10",
    desc: "Bắp rang bơ phô mai"
  }, {
    id: 2,
    name: "Coca Cola",
    category: "Nước uống",
    price: 30000,
    stock: 250,
    status: "active",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwAa7Fx-0Z1kRQ4Xtin2KegNgCW2KRHws759irIlETyA&s=10",
    desc: "Coca tươi"
  }, {
    id: 3,
    name: "Combo Solo",
    category: "Combo",
    price: 70000,
    stock: 50,
    status: "inactive",
    image: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/07/gia-bap-nuoc-cgv-3.jpg",
    desc: "1 Bắp + 1 Nước"
  }];

  // Danh sách phim dùng để bổ sung và cập nhật kho phim.
  const upcomingMovies = [{
    "id": 11248,
    "title": "Clayface",
    "poster": "images/clayface.webp",
    "genres": [],
    "duration": 100,
    "date": "2026-10-23",
    "status": "soon",
    "rating": null,
    "description": "Một diễn viên đang lên bị cuốn vào sự biến đổi đáng sợ, mở ra câu chuyện kinh dị trong thế giới Gotham.",
    "source": "https://chieuphimquocgia.com.vn/movies/11248",
    "director": "James Watkins",
    "actors": "Tom Rhys Harries, Naomi Ackie, David Dencik, Max Minghella, Eddie Marsan, Nancy Carroll, Joshua James,..."
  }, {
    "id": 11251,
    "title": "Klara và Mặt Trời",
    "poster": "images/klara-va-mat-troi.webp",
    "genres": [],
    "duration": 100,
    "date": "2026-10-23",
    "status": "soon",
    "rating": 6.0,
    "description": "Robot Klara đồng hành cùng một cô bé trong câu chuyện về tình yêu, hy vọng và sự sống.",
    "source": "https://chieuphimquocgia.com.vn/movies/11251",
    "trailer": "https://www.youtube.com/embed/YkvhZ9ve8NE"
  }, {
    "id": 11367,
    "title": "Huyết Thống",
    "poster": "images/huyet-thong.webp",
    "genres": [],
    "duration": 100,
    "date": "2026-10-30",
    "status": "soon",
    "rating": null,
    "description": "Một bác sĩ và một thầy pháp cùng tìm cách cứu một bé gái khỏi thế lực siêu nhiên.",
    "source": "https://chieuphimquocgia.com.vn/movies/11367",
    "director": "Đinh Đức Thiện",
    "actors": "Quách Ngọc Ngoan, Quang Tuấn, Lan Phương,"
  }, {
    "id": 11294,
    "title": "Án Mạng Karaoke",
    "poster": "images/an-mang-karaoke.webp",
    "genres": [],
    "duration": 100,
    "date": "2026-10-30",
    "status": "soon",
    "rating": null,
    "description": "Một vụ án tại homestay biệt lập biến chuyến đi của nhóm hàng xóm thành cuộc tìm kiếm hung thủ.",
    "source": "https://chieuphimquocgia.com.vn/movies/11294",
    "director": "Hoàng Lê",
    "actors": "Đoàn Thiên Ân, Đại Nghĩa, Vân Dung,...",
    "trailer": "https://www.youtube.com/embed/DE7vH0JkfBM"
  }];

  const refreshedMovies = [{
    "id": 11317,
    "title": "Án Mạng Xém Hoàn Hảo",
    "poster": "images/an-mang-xem-hoan-hao.jpg",
    "genres": ["Hài", "Hành động"],
    "duration": 124,
    "date": "2026-10-09",
    "showingThrough": "2026-10-19",
    "rating": null,
    "director": "Đức Nguyễn",
    "actors": "Anh Tú Atus, DJ Mie, Vũ Ngọc Anh, Huy Khánh, Thùy Giang, Long Đẹp Trai, Sỹ Toàn, Trịnh Tú Trung, Lương Gia Huy",
    "country": "Việt Nam",
    "age": "T18",
    "trailer": "https://www.youtube.com/embed/3r--EBolHSo",
    "description": "Một vụ án tại phim trường kéo cô gái mất trí nhớ và một thám tử vào những bí mật của giới giải trí.",
    "source": "https://chieuphimquocgia.com.vn/movies/11317"
  }, {
    "id": 11362,
    "title": "Cá Voi Nuốt Chửng",
    "poster": "images/ca-voi-nuot-chung.jpg",
    "genres": ["Kinh dị"],
    "duration": 105,
    "date": "2026-10-16",
    "showingThrough": "2026-10-19",
    "rating": 6.8,
    "director": "Brian Duffield",
    "actors": "Josh Brolin, Austin Abrams, Elisabeth Shue",
    "country": "Mỹ",
    "age": "T13",
    "trailer": ".",
    "description": "Một chàng trai bị cá nhà táng nuốt chửng khi lặn tìm hài cốt của cha.",
    "source": "https://chieuphimquocgia.com.vn/movies/11362"
  }, {
    "id": 11279,
    "title": "Trái Tim Quái Thú",
    "poster": "images/trai-tim-quai-thu.jpg",
    "genres": ["Tâm lý", "tình cảm", "Hành động"],
    "duration": 101,
    "date": "2026-10-02",
    "showingThrough": "2026-10-21",
    "rating": 7.2,
    "director": "David Ayer",
    "actors": "Brad Pitt, J.K. Simmons, Anna Lambe",
    "country": "Mỹ",
    "age": "T13",
    "trailer": "https://www.youtube.com/embed/LctdEyYVpbA",
    "description": "Một sĩ quan và chú chó chiến đấu tìm cách sống sót tại Alaska sau tai nạn máy bay.",
    "source": "https://chieuphimquocgia.com.vn/movies/11279"
  }, {
    "id": 11282,
    "title": "Lên Hương",
    "poster": "images/len-huong.jpg",
    "genres": ["Tâm lý", "tình cảm"],
    "duration": 121,
    "date": "2026-09-18",
    "showingThrough": "2026-10-20",
    "rating": 6.9,
    "director": "Khương Ngọc & Tấn Hoàng Thông",
    "actors": "Hồng Đào, Võ Tấn Phát, Tuyết Thu, NSND Hồng Vân, Hạ Anh, Quốc Khánh, Thiếu Lan",
    "country": "Việt Nam",
    "age": "T16",
    "trailer": "https://www.youtube.com/embed/bTa6-pedKGE",
    "description": "Bà chủ trại hòm và chàng trai cần tiền chữa bệnh cho mẹ vướng vào một giao kèo đầy bí mật.",
    "source": "https://chieuphimquocgia.com.vn/movies/11282"
  }, {
    "id": 11315,
    "title": "Út Lan 2",
    "poster": "images/ut-lan-2.jpg",
    "genres": ["Kinh dị"],
    "duration": 107,
    "date": "2026-09-25",
    "showingThrough": "2026-10-20",
    "rating": null,
    "director": "Trần Trọng Dần",
    "actors": "Phương Nam, Kiều Oanh, NSUT Kim Phương, Kiều Diễm, Gia Tuệ, Tạ Lâm, Ngọc Phước, Khánh Tiên, Tấn Thi, Huỳnh Nhựt.",
    "country": "Việt Nam",
    "age": "T18",
    "trailer": ".",
    "description": "Con rắn hai đầu xuất hiện cùng những cái chết bí ẩn tại một ngôi làng ven sông.",
    "source": "https://chieuphimquocgia.com.vn/movies/11315"
  }, {
    "id": 11330,
    "title": "Bát Tiên! Truy Tìm Lưu Ly Đăng",
    "poster": "images/bat-tien-truy-tim-luu-ly-dang.jpg",
    "genres": ["Hoạt hình"],
    "duration": 144,
    "date": "2026-09-11",
    "showingThrough": "2026-10-20",
    "rating": 8.0,
    "director": "Cheng Teng",
    "actors": "Chen Hao, Yuze Han, Yunqi Zhang, Li Shaozhe, and Li Dong",
    "country": "Trung Quốc",
    "age": "P",
    "trailer": "https://www.youtube.com/embed/rMzAA98zBRE",
    "description": "Hành trình phiêu lưu kỳ ảo đi tìm ngọn đèn Lưu Ly.",
    "source": "https://chieuphimquocgia.com.vn/movies/11330"
  }];

  const retiredMovieTitles = [
    "Mưa đỏ",
    "Dune",
    "Biệt Đội Siêu Anh Hùng: Hồi Kết - Phiên bản đặc biệt",
    "Spider-Man: No Way Home",
    "Khóa chặt cửa nào Suzume",
    "Marnie yêu dấu"
  ];

  const defaultMovies = [{
    id: 3,
    poster: "images/traibuonnguoi.jpg",
    title: "Trại Buôn Người",
    subtitle: "The Journey of Heroes",
    genres: ["Hành động", "Sinh Tồn"],
    duration: 135,
    date: "2026-09-25",
    showingThrough: "2026-10-20",
    status: "showing",
    rating: 6.9,
    color: "#554074"
  }, {
    id: 5,
    poster: "images/Shaunthesheep.jpg",
    title: "Shaun The Sheep",
    subtitle: "Quái lạ ghé nhà",
    genres: ["Hoạt hình", "Hài", "Phiêu lưu"],
    duration: 81,
    date: "2026-10-16",
    showingThrough: "2026-10-20",
    status: "soon",
    rating: 6.8,
    color: "#363636"
  }, {
    id: 8,
    poster: "images/chiikawa.jpg",
    title: "Chiikawa: Bí mật đảo người cá",
    subtitle: "Chiikawa the Movie: The Secret of Mermaid Island",
    genres: ["Hoạt hình"],
    duration: 99,
    date: "2026-08-28",
    rating: 7.4
  }, {
    id: 9,
    poster: "images/nguoi-me-khac.webp",
    title: "Người Mẹ Khác",
    subtitle: "Other Mommy",
    genres: ["Kinh dị"],
    duration: 93,
    date: "2026-10-09",
    showingThrough: "2026-10-19",
    rating: 5.4
  }, {
    id: 10,
    poster: "images/a-new-dawn.jpg",
    title: "Pháo hoa lúc bình minh",
    subtitle: "A New Dawn",
    genres: ["Hoạt hình"],
    duration: 76,
    date: "2026-09-25",
    rating: 6.2
  }, {
    id: 11,
    poster: "images/vung-dat-quy-du-2026.webp",
    title: "Vùng Đất Quỷ Dữ",
    subtitle: "Resident Evil (2026)",
    genres: ["Kinh dị", "Khoa học viễn tưởng"],
    duration: 94,
    date: "2026-09-18",
    showingThrough: "2026-10-21",
    rating: 7.6
  }, {
    id: 12,
    poster: "images/bi-mat-bi-chon-vui.webp",
    title: "Verity: Bí Mật Bị Chôn Vùi",
    subtitle: "Verity",
    genres: ["Chính kịch"],
    duration: 117,
    date: "2026-10-16",
    showingThrough: "2026-10-19",
    rating: 6.1
  }, {
    id: 14,
    poster: "images/quy-an-tang-4-ho-tinh.webp",
    title: "Quỷ Ăn Tạng 4: Hổ Tinh",
    subtitle: "Death Whisperer: Saming the Werebeast",
    genres: ["Hành động", "Kinh dị"],
    duration: 111,
    date: "2026-10-16",
    showingThrough: "2026-10-19",
    rating: 6.0
  }, {
    id: 15,
    poster: "images/street-fighter.webp",
    title: "Street Fighter",
    subtitle: "Street Fighter (2026)",
    genres: ["Hài", "Hành động", "Phiêu lưu"],
    duration: 119,
    date: "2026-10-16",
    showingThrough: "2026-10-19",
    rating: 6.2
  }];

  const movieDetails = {
    "9": {
      "director": "Rob Savage",
      "actors": " Jessica Chastain, Jay Duplass, Arabella Olivia Clark, Dichen Lachman, cùng Arian Moayed và Karen Allen",
      "country": "Mỹ",
      "description": "Mẹ có thể bước vào tim con không? Từ nhà sản xuất James Wan, một trong những người có tầm ảnh hưởng lớn nhất của dòng phim kinh dị hiện đại, cùng Blumhouse Atomic Monster, hãng phim đứng sau thành công của loạt phim kinh dị như Backrooms (tựa tiếng Việt: Backrooms: Thực Thể Quỷ Quyệt) và Obsession (tựa tiếng Việt: Ám Ảnh), bộ phim mới của đạo diễn Rob Savage sẽ đưa khán giả vào một hành trình rùng rợn, khám phá thế giới ngày càng u tối của cô bé Bela. Tại ngôi nhà của mình, Bela dần hình thành một mối liên kết kỳ lạ với một thực thể bí ẩn mang vẻ ngoài giống hệt mẹ cô bé đến đáng sợ.",
      "age": "T18",
      "trailer": "https://www.youtube.com/embed/GZjQyEMSKy0"
    },

    "11": {
      "director": "Zach Cregger",
      "actors": " Austin Abrams,Paul Walter Hauser, Zach Cherry, Kali Reis.",
      "country": "Mỹ",
      "description": "Một phiên bản Resident Evil mới trở lại đầy kịch tính và kinh hoàng từ bộ óc quái kiệt của đạo diễn Zach Cregger đứng sau “Weapons” & “Barbarian”. Với cốt truyện hoàn toàn mới, phim xoay quanh Bryan (Austin Abrams), một nhân viên vận chuyển vật tư y tế vô tình bị cuốn vào cuộc chạy đua sinh tồn nghẹt thở và dồn dập trong một đêm định mệnh. Liên tiếp chuyện kinh hoàng bất ngờ đẩy anh vào giữa vòng xoáy hỗn loạn.",
      "age": "T18",
      "trailer": "https://www.youtube.com/embed/O0WFEygXL2w"
    },

    "12": {
      "director": "Michael Showalter",
      "actors": "Anne Hathaway, Dakota Johnson, Josh Hartnett, Ismael Cruz Cordova, Brady Wagner",
      "country": "Mỹ",
      "description": "Được chuyển thể từ cuốn tiểu thuyết bán chạy nhất của Colleen Hoover, Bí Mật Bị Chôn Vùi( Verity) phim giật gân tâm lý đầy lôi cuốn này xoay quanh nữ nhà văn nổi tiếng Verity Crawford (Anne Hathaway) và Lowen Ashleigh (Dakota Johnson), một nhà văn đang chật vật với sự nghiệp, được mời đến dinh thự hẻo lánh Crawford để viết thay Verity. Tại đây, Lowen phát hiện những ghi chép ám ảnh, hé lộ những bí mật gây sốc về chồng Verity, Jeremy (Josh Hartnett), khiến cô dần lạc lối giữa hư cấu và thực tại, giữa thao túng và sức hút , cũng như giữa cơ hội và sự ám ảnh.",
      "age": "T18",
      "trailer": ""
    },

    "14": {
      "director": "Chalit Krileadmongkon, Thanadet Pradit, Narit Yuvaboon",
      "actors": "Nadech Kugimiya, Bow Maylada, Ongart Cheamcharoenpornkul, Bible Wichapas",
      "country": "Thái Lan",
      "description": "Cuộc gặp gỡ đầu tiên giữa Yak và Trung sĩ Paphan khi cả hai dấn thân vào một nhiệm vụ sinh tử: truy tìm một người đàn ông mất tích. Dẫn đầu toán quân tiến sâu vào vùng hiểm địa âm u, họ phải đối mặt với Hổ tinh ăn thịt người vùng Khao Khwang, kẻ sở hữu khả năng biến hóa khôn lường thành muôn hình vạn trạng. Bị bủa vây giữa ngàn trùng nguy hiểm của rừng thiêng, Yak và Trung sĩ Paphan chỉ còn một con đường duy nhất: sát cánh chiến đấu để sinh tồn và vạch trần sự thật tàn khốc trước khi chính họ trở thành mồi ngon tiếp theo của nó.",
      "age": "T18",
      "trailer": "https://www.youtube.com/embed/8n2-rj8y-Gs"
    },

    "15": {
      "director": "Kitao Sakurai",
      "actors": "Noah Centineo, Andrew Koji, Callina Liang, Joe “Roman Reigns” Anoai, David Dastmalchian, Cody Rhodes, Andrew Schulz",
      "country": "Mỹ",
      "description": "Lấy bối cảnh năm 1993, Ryu và Ken, hai đấu sĩ từng xa cách bị kéo trở lại chiến đấu khi Chun-Li chiêu mộ họ tham gia giải Chiến Binh Thế Giới đầy khốc liệt. Nhưng đằng sau đó là một âm mưu chết chóc, buộc họ phải đối đầu với nhau và quá khứ của chính mình, nếu không tất cả sẽ CHẤM HẾT! Dưới sự chỉ đạo của đạo diễn Kitao Sakurai, Street Fighter mang những trận chiến game thùng lên màn ảnh rộng với các đòn thế quen thuộc cùng dàn nhân vật được yêu thích.",
      "age": "T16",
      "trailer": "https://www.youtube.com/embed/gg3SVF28rk8"
    },

    "5": {
      "director": "Steve Cox & Matthew Walker",
      "actors": "Justin Fletcher, John Sparkes, Nina Sosanya,...",
      "country": "Mỹ",
      "description": "Ngôn ngữ: Be Be, Gâu Gâu, Éc Éc, Quạc Quạc.....\nTóm tắt: SHAUN THE SHEEP: “QUÁI LẠ” GHÉ NHÀ bắt đầu với sự cố Ông chủ vô tình phá hỏng vườn bí ngô mà đàn cừu đang chuẩn bị cho Halloween. Để cứu vãn tình hình, Shaun trổ tài làm “nhà khoa học”, nhưng thí nghiệm lại kéo theo hàng loạt rắc rối ngoài dự tính. Khi Ông chủ mất tích và một sinh vật bí ẩn xuất hiện trong rừng, cả đàn cừu lên đường tìm kiếm Ông chủ và đối mặt với một chuyến phiêu lưu vừa quái vừa nhộn.",
      "age": "P",
      "trailer": ""
    }
  };

  defaultMovies.forEach(movie => Object.assign(movie, movieDetails[movie.id] || {}));
  defaultMovies.push(...upcomingMovies, ...refreshedMovies);

  // Tạo mã vé ngẫu nhiên và tránh trùng với vé đã có.
  function bookingCode(bookings) {
    let code;

    do {
      const random = Array.from(
        crypto.getRandomValues(new Uint8Array(10)),
        byte => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[byte % 36]
      ).join("");

      code = `UCC_${today().slice(-2)}_${random}`;
    } while (bookings.some(booking => booking.code === code));

    return code;
  }

  const defaultBookings = [{
    code: "BKMIC7CT451HBDN",
    customer: "Đoàn Danh Thái",
    movie: "Án Mạng Xém Hoàn Hảo",
    location: "CGV Vincom · Phòng 1",
    showtime: "09/10/2026 · 09:30",
    seats: 3,
    total: 165000,
    ticket: "Đã sử dụng",
    payment: "Đã thanh toán"
  }, {
    code: "BKMIC7A2RO7IXAM",
    customer: "Phạm Ngọc Linh",
    movie: "Cá Voi Nuốt Chửng",
    location: "CGV Vincom · Phòng 1",
    showtime: "16/10/2026 · 09:30",
    seats: 2,
    total: 110000,
    ticket: "Đã xác nhận",
    payment: "Đã thanh toán"
  }, {
    code: "BKMIC8LP201QAHE",
    customer: "Phạm Nguyễn Minh Chi",
    movie: "Chiikawa: Bí mật đảo người cá",
    location: "CGV Vincom · Phòng 3",
    showtime: "28/08/2026 · 19:45",
    seats: 2,
    total: 180000,
    ticket: "Chờ xác nhận",
    payment: "Chờ thanh toán"
  }, {
    code: "BKMIC9DN302KFP4",
    customer: "Nguyễn Đức Nam",
    movie: "Người Mẹ Khác",
    location: "CGV Vincom · Phòng 2",
    showtime: "09/10/2026 · 10:00",
    seats: 2,
    total: 110000,
    ticket: "Đã xác nhận",
    payment: "Đã thanh toán"
  }, {
    code: "BKMIC9MH403KTM4",
    customer: "Trần Minh Hoàng",
    movie: "Pháo hoa lúc bình minh",
    location: "CGV Vincom · Phòng 3",
    showtime: "25/09/2026 · 14:30",
    seats: 3,
    total: 165000,
    ticket: "Đã xác nhận",
    payment: "Đã thanh toán"
  }, {
    code: "BKMICAQA504CX02",
    customer: "Hạ Quỳnh Như",
    movie: "Vùng Đất Quỷ Dữ",
    location: "CGV Vincom · Phòng 1",
    showtime: "18/09/2026 · 15:00",
    seats: 2,
    total: 140000,
    ticket: "Chờ xác nhận",
    payment: "Chờ thanh toán"
  }, {
    code: "BKMICATN605KFP4",
    customer: "Nguyễn Thảo Nhi",
    movie: "Người Mẹ Khác",
    location: "CGV Vincom · Phòng 2",
    showtime: "10/10/2026 · 17:15",
    seats: 4,
    total: 280000,
    ticket: "Đã xác nhận",
    payment: "Đã thanh toán"
  }, {
    code: "BKMICBHN706KTM4",
    customer: "Lê Yến Mai",
    movie: "Verity: Bí Mật Bị Chôn Vùi",
    location: "CGV Vincom · Phòng 3",
    showtime: "16/10/2026 · 09:45",
    seats: 2,
    total: 110000,
    ticket: "Chờ xác nhận",
    payment: "Chờ thanh toán"
  }, {
    code: "BKMICBML807CX02",
    customer: "Vũ Thị Minh Anh",
    movie: "Trái Tim Quái Thú",
    location: "CGV Vincom · Phòng 1",
    showtime: "02/10/2026 · 18:30",
    seats: 3,
    total: 270000,
    ticket: "Đã xác nhận",
    payment: "Đã thanh toán"
  }];

  const defaultTheaters = [{
    "id": "1",
    "name": "Galaxy Cinema Hanoi Centre",
    "prefix": "GL",
    "address": "Tầng 3, Tòa Nam, TTTM Hanoi Centre, 175 Nguyễn Thái Học",
    "city": "Hà Nội",
    "district": "Ba Đình",
    "phone": "1900 2224",
    "email": "support@galaxy.com.vn",
    "status": "active",
    "seats": [124, 124, 124, 124, 124],

    "rooms": [{
      "code": "GL_01",
      "name": "Phòng 1",
      "seats": 124,
      "format": "2D",
      "status": "active"
    }, {
      "code": "GL_02",
      "name": "Phòng 2",
      "seats": 124,
      "format": "3D",
      "status": "active"
    }, {
      "code": "GL_03",
      "name": "Phòng 3",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }, {
      "code": "GL_04",
      "name": "Phòng 4",
      "seats": 124,
      "format": "4DX",
      "status": "active"
    }, {
      "code": "GL_05",
      "name": "Phòng 5",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }]
  }, {
    "id": "2",
    "name": "Lotte Cinema Tây Hồ",
    "prefix": "LT",
    "address": "Tầng 4, Lotte Mall Tây Hồ, 272 Võ Chí Công, P. Phú Thượng",
    "city": "Hà Nội",
    "district": "Tây Hồ",
    "phone": "024 3710 0666",
    "email": "cs@lotte.vn",
    "status": "active",
    "seats": [124, 124, 124, 124, 124],

    "rooms": [{
      "code": "LT_01",
      "name": "Phòng 1",
      "seats": 124,
      "format": "2D",
      "status": "active"
    }, {
      "code": "LT_02",
      "name": "Phòng 2",
      "seats": 124,
      "format": "3D",
      "status": "active"
    }, {
      "code": "LT_03",
      "name": "Phòng 3",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }, {
      "code": "LT_04",
      "name": "Phòng 4",
      "seats": 124,
      "format": "4DX",
      "status": "active"
    }, {
      "code": "LT_05",
      "name": "Phòng 5",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }]
  }, {
    "id": "3",
    "name": "CGV Vincom Trần Duy Hưng",
    "prefix": "CGV",
    "address": "Tầng 5, Vincom Center, Đường Trần Duy Hưng, P. Trung Hòa",
    "city": "Hà Nội",
    "district": "Cầu Giấy",
    "phone": "1900 6017",
    "email": "hoidap@cgv.vn",
    "status": "active",
    "seats": [124, 124, 124, 124, 124],

    "rooms": [{
      "code": "CGV_01",
      "name": "Phòng 1",
      "seats": 124,
      "format": "2D",
      "status": "active"
    }, {
      "code": "CGV_02",
      "name": "Phòng 2",
      "seats": 124,
      "format": "3D",
      "status": "active"
    }, {
      "code": "CGV_03",
      "name": "Phòng 3",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }, {
      "code": "CGV_04",
      "name": "Phòng 4",
      "seats": 124,
      "format": "4DX",
      "status": "active"
    }, {
      "code": "CGV_05",
      "name": "Phòng 5",
      "seats": 124,
      "format": "IMAX",
      "status": "active"
    }]
  }];

  // Lấy ngày hiện tại và đọc dữ liệu đã lưu.
  const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  function read(key, fallback) {
    const saved = localStorage.getItem(key);
    const value = saved === null ? fallback : JSON.parse(saved);

    if (!Array.isArray(value))
      throw new Error("Dữ liệu lưu không hợp lệ: " + key);

    return value;
  }

  // Xác định trạng thái chiếu của phim.
  function movieStatus(movie, date = today()) {
    if (movie.date > date)
      return "soon";

    // shortcut: lịch đang chiếu được xác nhận thủ công, cập nhật mốc này khi làm mới danh sách phim.
    if (movie.showingThrough >= date)
      return "showing";

    const daysSinceRelease = (Date.parse(date) - Date.parse(movie.date)) / 86400000;
    return daysSinceRelease <= 21 ? "showing" : "ended";
  }

  // Bổ sung lô phim UCC một lần, giữ nguyên chỉnh sửa và các lần xóa sau đó của admin.
  try {
    const importKey = "btl-seed-upcoming-20261019";

    if (localStorage.getItem(importKey) === null) {
      if (localStorage.getItem("btl-movies") !== null) {
        const movies = read("btl-movies", []);

        const additions = upcomingMovies.filter(film => !movies.some(
          movie => String(movie.id) === String(film.id) || movie.title.toLocaleLowerCase("vi") === film.title.toLocaleLowerCase("vi")
        ));

        localStorage.setItem("btl-movies", JSON.stringify([...movies, ...additions]));
      }

      localStorage.setItem(importKey, "true");
    }
  } catch (error) {
    console.warn("Chưa bổ sung được phim sắp chiếu. Dữ liệu đang lưu được giữ nguyên.", error);
  }

  // Làm mới kho một lần; giữ lịch sử vé và các chỉnh sửa của admin trên phim còn lại.
  try {
    const refreshKey = "btl-refresh-catalog-20261019";

    if (localStorage.getItem(refreshKey) === null) {
      if (localStorage.getItem("btl-movies") !== null) {
        const movies = read("btl-movies", []);

        const retired = movies.filter(
          movie => retiredMovieTitles.includes(movie.title) || (/^\d{4}-\d{2}-\d{2}$/.test(movie.date) && movie.date < "2026-01-01")
        );

        const removedIds = new Set(retired.map(movie => String(movie.id)));

        const remaining = movies.filter(movie => !removedIds.has(String(movie.id))).map(movie => {
          const confirmed = defaultMovies.find(film => film.title === movie.title && film.date === movie.date);

          return confirmed?.showingThrough > (movie.showingThrough || "") ? {
            ...movie,
            showingThrough: confirmed.showingThrough
          } : movie;
        });

        const additions = refreshedMovies.filter(film => !remaining.some(
          movie => String(movie.id) === String(film.id) || movie.title.toLocaleLowerCase("vi") === film.title.toLocaleLowerCase("vi")
        ));

        const screenings = read("btl-screenings", []);
        localStorage.setItem("btl-movies", JSON.stringify([...remaining, ...additions]));

        if (localStorage.getItem("btl-screenings") !== null) {
          localStorage.setItem("btl-screenings", JSON.stringify(screenings.filter(show => !removedIds.has(String(show.movieId)))));
        }
      }

      localStorage.setItem(refreshKey, "true");
    }
  } catch (error) {
    console.warn("Chưa làm mới được kho phim. Hãy kiểm tra dữ liệu đang lưu.", error);
  }

  // Chỉ bổ sung điểm còn trống một lần, giữ nguyên phim đã xóa hoặc chỉnh sửa.
  try {
    const ratingsKey = "btl-imdb-ratings-20261019";

    if (localStorage.getItem(ratingsKey) === null) {
      if (localStorage.getItem("btl-movies") !== null) {
        const verified = [...upcomingMovies, ...refreshedMovies].filter(movie => Number.isFinite(movie.rating));
        const movies = read("btl-movies", []);
        let changed = false;

        const updated = movies.map(movie => {
          const match = verified.find(film => String(film.id) === String(movie.id) && film.title === movie.title);

          if (movie.rating != null || !match)
            return movie;

          changed = true;

          return {
            ...movie,
            rating: match.rating
          };
        });

        if (changed)
          localStorage.setItem("btl-movies", JSON.stringify(updated));
      }

      localStorage.setItem(ratingsKey, "true");
    }
  } catch (error) {
    console.warn("Chưa bổ sung được điểm IMDb. Dữ liệu đang lưu được giữ nguyên.", error);
  }

  try {
    const capacityKey = "btl-room-capacity-124-20261020";

    if (localStorage.getItem(capacityKey) === null) {
      if (localStorage.getItem("btl-theaters") !== null) {
        const theaters = read("btl-theaters", []).map(theater => ({
          ...theater,
          seats: theater.seats.map(() => 124),

          ...(Array.isArray(theater.rooms) ? {
            rooms: theater.rooms.map(room => ({
              ...room,
              seats: 124
            }))
          } : {})
        }));

        localStorage.setItem("btl-theaters", JSON.stringify(theaters));
      }

      localStorage.setItem(capacityKey, "true");
    }
  } catch (error) {
    console.warn("Chưa đồng bộ được số ghế phòng chiếu. Dữ liệu đang lưu được giữ nguyên.", error);
  }

  // Chia sẻ dữ liệu và các hàm lưu cho trang khách hàng và quản trị.
  window.cinemaState = {
    today,
    movieStatus,

    get site() {
      return defaultSite;
    },

    get theaters() {
      return read("btl-theaters", defaultTheaters);
    },

    get rooms() {
      let number = 0;

      return this.theaters.flatMap(theater => theater.seats.map((seats, index) => ({
        id: `${theater.id}:${index + 1}`,
        name: `Phòng ${++number}`,
        theaterId: theater.id,
        room: index + 1,
        seats
      })));
    },

    get genres() {
      return read("btl-genres", defaultGenres);
    },

    get products() {
      return read("btl-products", defaultProducts);
    },

    get movies() {
      return read("btl-movies", defaultMovies);
    },

    get screenings() {
      return read("btl-screenings", []);
    },

    get bookings() {
      return read("btl-bookings", defaultBookings);
    },

    get myBookings() {
      const user = window.customerAuth?.currentUser();
      return user ? this.bookings.filter(booking => booking.customerId === user.id).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) : [];
    },

    saveGenres(value) {
      localStorage.setItem("btl-genres", JSON.stringify(value));
    },

    saveProducts(value) {
      localStorage.setItem("btl-products", JSON.stringify(value));
    },

    saveTheaters(value) {
      localStorage.setItem("btl-theaters", JSON.stringify(value));
    },

    saveBookings(value) {
      localStorage.setItem("btl-bookings", JSON.stringify(value));
    },

    saveMovies(value) {
      localStorage.setItem("btl-movies", JSON.stringify(value));
    },

    saveScreenings(value) {
      localStorage.setItem("btl-screenings", JSON.stringify(value));
    }
  };

  // Kiểm tra thông tin suất chiếu và thời gian bị trùng.
  window.cinemaState.screeningError = (show, movies = window.cinemaState.movies, screenings = window.cinemaState.screenings) => {
    const movie = movies.find(item => String(item.id) === show.movieId);
    const theater = window.cinemaState.theaters.find(item => item.id === show.theaterId);

    if (!movie || !theater || !Number.isInteger(show.room) || !theater.seats[show.room - 1] || !Number.isFinite(show.price) || show.price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(show.date) || Number.isNaN(Date.parse(show.date)) || new Date(show.date).toISOString().slice(0, 10) !== show.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(show.time))
      return "Vui lòng nhập đầy đủ dữ liệu hợp lệ.";

    if (show.date < movie.date || (movie.endDate && show.date > movie.endDate)) {
      return "Ngày chiếu phải nằm trong thời gian khởi chiếu và kết thúc của phim.";
    }

    const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    const start = Date.parse(show.date + "T00:00:00") + minutes(show.time) * 60000;
    const end = start + movie.duration * 60000;

    const overlaps = screenings.some(other => {
      if (other.id === show.id || other.theaterId !== show.theaterId || other.room !== show.room)
        return false;

      const otherMovie = movies.find(item => String(item.id) === other.movieId);
      const otherStart = Date.parse(other.date + "T00:00:00") + minutes(other.time) * 60000;
      return start < otherStart + (otherMovie?.duration || 0) * 60000 && end > otherStart;
    });

    return overlaps ? "Phòng đã có suất chiếu trùng thời gian." : "";
  };

  // shortcut: phòng và giờ demo được gán thủ công, cập nhật khi thay kho phim.
  const screeningDate = today();

  const demoScreenings = [
    [3, "1", 1],
    [5, "1", 2],
    [9, "1", 3],
    [11, "1", 4],
    [12, "1", 5],
    [14, "2", 1],
    [15, "2", 2],
    [11317, "2", 3],
    [11362, "2", 4],
    [11279, "2", 5],
    [11282, "3", 1],
    [11315, "3", 2],
    [11330, "3", 3]
  ].flatMap(([movieId, theaterId, room]) => ["10:00", "19:30"].map(time => ({
    id: `demo-${screeningDate.replaceAll("-", "")}-${movieId}-${time.replace(":", "")}`,
    movieId: String(movieId),
    theaterId,
    room,
    date: screeningDate,
    time,
    price: time === "10:00" ? 75000 : 90000
  })));

  try {
    const seedKey = `btl-seed-screenings-${screeningDate.replaceAll("-", "")}`;

    if (localStorage.getItem(seedKey) === null) {
      const state = window.cinemaState;
      const movies = state.movies;
      const screenings = state.screenings;
      const originalLength = screenings.length;

      for (const show of demoScreenings) {
        if (!screenings.some(other => other.id === show.id) && movies.some(movie => String(movie.id) === show.movieId && movieStatus(movie, show.date) === "showing") && !state.screeningError(show, movies, screenings))
          screenings.push(show);
      }

      if (screenings.length > originalLength)
        state.saveScreenings(screenings);

      localStorage.setItem(seedKey, "true");
    }
  } catch (error) {
    console.warn("Chưa bổ sung được suất chiếu mẫu. Dữ liệu đang lưu được giữ nguyên.", error);
  }

  window.movieState = {
    get movies() {
      return window.cinemaState.movies;
    },

    getMovies() {
      return this.movies;
    },

    addMovie(movie) {
      if (!movie || typeof movie.title !== "string" || !movie.title.trim())
        return;

      window.cinemaState.saveMovies([...this.movies, movie]);
    }
  };

  // Đọc tài khoản và kiểm tra định dạng email.
  const accountsKey = "btl-customers";

  const sessionKey = "btl-customer-session";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizeEmail = value => String(value || "").trim().toLowerCase();
  const isValidEmail = value => emailPattern.test(normalizeEmail(value)) && normalizeEmail(value).length <= 254;

  function accounts() {
    const raw = localStorage.getItem(accountsKey);
    let saved;

    try {
      saved = raw === null ? [] : JSON.parse(raw);
    } catch {
      throw new Error("Dữ liệu tài khoản không hợp lệ. Vui lòng kiểm tra bộ nhớ trình duyệt.");
    }

    if (!Array.isArray(saved) || saved.some(
      user => !user || typeof user.id !== "string" || typeof user.email !== "string" || typeof user.salt !== "string" || typeof user.passwordHash !== "string"
    )) {
      throw new Error("Dữ liệu tài khoản không hợp lệ. Vui lòng kiểm tra bộ nhớ trình duyệt.");
    }

    return saved;
  }

  const profile = user => ({
    id: user.id,
    fullName: user.fullName || [user.surname, user.givenName].filter(Boolean).join(" "),
    surname: user.surname,
    givenName: user.givenName,
    phone: user.phone,
    email: user.email
  });

  // Băm mật khẩu kèm chuỗi ngẫu nhiên riêng cho mỗi tài khoản.
  async function hashPassword(password, salt) {
    if (!crypto.subtle)
      throw new Error("Vui lòng mở website bằng localhost hoặc HTTPS để đăng nhập.");

    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);

    const hash = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: 600000,
      salt: new TextEncoder().encode(salt)
    }, key, 256);

    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  // shortcut: xác thực demo bằng bộ nhớ trình duyệt, thay bằng phiên máy chủ trước khi triển khai thật.
  window.customerAuth = {
    isValidEmail,

    currentUser() {
      try {
        const id = localStorage.getItem(sessionKey);
        const user = id && accounts().find(user => user.id === id);
        return user ? profile(user) : null;
      } catch {
        return null;
      }
    },

    async register(input) {
      const fullName = String(input.fullName || "").trim().replace(/\s+/g, " ");
      const names = fullName.split(" ");
      const givenName = names.pop();
      const surname = names.join(" ");
      const phone = String(input.phone || "").trim();
      const email = normalizeEmail(input.email);
      const password = input.password;

      if (!fullName || fullName.length > 160)
        throw new Error("Vui lòng nhập họ và tên, tối đa 160 ký tự.");

      if (!/^[0-9+ ()-]{9,16}$/.test(phone) || phone.replace(/\D/g, "").length < 9)
        throw new Error("Số điện thoại không hợp lệ.");

      if (!isValidEmail(email))
        throw new Error("Email không hợp lệ.");

      if (typeof password !== "string" || password.length < 8 || password.length > 128)
        throw new Error("Mật khẩu cần từ 8 đến 128 ký tự.");

      if (password !== input.confirmPassword)
        throw new Error("Mật khẩu nhập lại chưa khớp.");

      if (input.terms !== true)
        throw new Error("Vui lòng đồng ý với điều kiện sử dụng.");

      if (accounts().some(user => user.email === email))
        throw new Error("Email đã được đăng ký. Vui lòng đăng nhập.");

      const salt = crypto.randomUUID();
      const passwordHash = await hashPassword(password, salt);
      const saved = accounts();

      if (saved.some(user => user.email === email))
        throw new Error("Email đã được đăng ký. Vui lòng đăng nhập.");

      const user = {
        id: crypto.randomUUID(),
        fullName,
        surname,
        givenName,
        phone,
        email,
        salt,
        passwordHash
      };

      localStorage.setItem(accountsKey, JSON.stringify([...saved, user]));
      localStorage.setItem(sessionKey, user.id);
      return profile(user);
    },

    async login(email, password) {
      const user = accounts().find(user => user.email === normalizeEmail(email));

      if (typeof password !== "string" || password.length < 8 || password.length > 128 || !user || (await hashPassword(password, user.salt)) !== user.passwordHash)
        throw new Error("Email hoặc mật khẩu không đúng.");

      localStorage.setItem(sessionKey, user.id);
      return profile(user);
    },

    logout() {
      localStorage.removeItem(sessionKey);
    }
  };

  try {
    const codeKey = "btl-booking-code-ucc-20261020";

    if (localStorage.getItem(codeKey) === null) {
      const bookings = window.cinemaState.bookings;
      let changed = false;
      const updated = [];

      for (const booking of bookings) {
        if (typeof booking.code === "string" && !/^UCC_\d{2}_[A-Z0-9]{10}$/.test(booking.code)) {
          changed = true;

          updated.push({
            ...booking,
            code: bookingCode([...bookings, ...updated]),
            previousCodes: [...(Array.isArray(booking.previousCodes) ? booking.previousCodes : []), booking.code]
          });
        } else
          updated.push(booking);
      }

      if (changed)
        window.cinemaState.saveBookings(updated);

      localStorage.setItem(codeKey, "true");
    }
  } catch (error) {
    console.warn("Chưa cập nhật được mã đặt vé. Dữ liệu đang lưu được giữ nguyên.", error);
  }

  // Xử lý sơ đồ ghế, tính tiền và xác nhận đặt vé.
  const bookingState = window.cinemaState;

  bookingState.booking = {
    details(screeningId) {
      const show = bookingState.screenings.find(show => show.id === screeningId);
      const movie = show && bookingState.movies.find(movie => String(movie.id) === String(show.movieId));
      const room = show && bookingState.rooms.find(room => room.theaterId === show.theaterId && room.room === show.room);

      if (!show || !movie || !room || room.seats !== 124 || !Number.isSafeInteger(show.price) || show.price < 0 || bookingState.screeningError(show, bookingState.movies, []))
        throw new Error("Suất chiếu không còn khả dụng. Vui lòng chọn suất khác.");

      if (Date.parse(show.date + "T" + show.time) <= Date.now())
        throw new Error("Suất chiếu đã qua giờ bắt đầu. Vui lòng chọn suất khác.");

      return {
        show,
        movie,
        room
      };
    },

    seatPlan(screeningId) {
      const {
        show
      } = this.details(screeningId);

      return Array.from({
        length: 9
      }, (_, row) => Array.from({
        length: row === 8 ? 12 : 14
      }, (_, column) => {
        const number = column + 1;
        const type = row === 8 ? "couple" : row >= 3 && number >= 3 && number <= 12 ? "vip" : "standard";

        return {
          id: String.fromCharCode(65 + row) + number,
          row,
          number,
          type,
          pair: type === "couple" ? "I-pair-" + Math.ceil(number / 2) : null,
          price: show.price + (type === "vip" ? 10000 : type === "couple" ? 15000 : 0)
        };
      })).flat();
    },

    reservedSeats(screeningId) {
      return bookingState.bookings.filter(booking => booking.screeningId === screeningId && booking.ticket !== "Đã hủy").flatMap(booking => Array.isArray(booking.seatLabels) ? booking.seatLabels : []);
    },

    quote(screeningId, seatIds) {
      if (!Array.isArray(seatIds) || !seatIds.length || new Set(seatIds).size !== seatIds.length)
        throw new Error("Vui lòng chọn ghế hợp lệ.");

      const plan = this.seatPlan(screeningId);
      const items = seatIds.map(id => plan.find(seat => seat.id === id));

      if (items.some(seat => !seat))
        throw new Error("Ghế đã chọn không hợp lệ.");

      if (items.some(seat => seat.pair && plan.some(other => other.pair === seat.pair && !seatIds.includes(other.id))))
        throw new Error("Ghế đôi phải được chọn theo cặp.");

      const reserved = this.reservedSeats(screeningId);

      if (seatIds.some(id => reserved.includes(id)))
        throw new Error("Một số ghế đã được đặt. Vui lòng chọn ghế khác.");

      const total = items.reduce((total, seat) => total + seat.price, 0);

      if (!Number.isSafeInteger(total))
        throw new Error("Giá vé không hợp lệ. Vui lòng chọn suất khác.");

      return {
        items,
        total
      };
    },

    async placeBooking(input) {
      const commit = () => {
        const user = window.customerAuth.currentUser();

        if (!user)
          throw new Error("Vui lòng đăng nhập để đặt vé.");

        if (typeof input.requestId !== "string" || !input.requestId || input.requestId.length > 100)
          throw new Error("Yêu cầu đặt vé không hợp lệ.");

        const previous = bookingState.bookings.find(booking => booking.requestId === input.requestId && booking.customerId === user.id);

        if (previous)
          return previous;

        if (input.acceptedTerms !== true)
          throw new Error("Vui lòng xác nhận thông tin và điều khoản sử dụng.");

        if (!["vnpay", "momo", "card"].includes(input.paymentMethod))
          throw new Error("Vui lòng chọn phương thức thanh toán.");

        if (!Number.isFinite(input.expiresAt) || input.expiresAt <= Date.now() || input.expiresAt > Date.now() + 600000)
          throw new Error("Hết thời gian chọn ghế. Vui lòng chọn lại.");

        const {
          show,
          movie,
          room
        } = this.details(input.screeningId);

        const quote = this.quote(show.id, input.seatIds);

        const receipt = {
          code: bookingCode(bookingState.bookings),
          requestId: input.requestId,
          customerId: user.id,
          customer: user.fullName,
          movieId: movie.id,
          movie: movie.title,
          screeningId: show.id,
          location: room.name,
          showtime: show.date.split("-").reverse().join("/") + " · " + show.time,
          seatLabels: quote.items.map(seat => seat.id),
          seats: quote.items.length,
          total: quote.total,
          ticket: "Đã xác nhận",
          payment: "Đã thanh toán",
          paymentMethod: input.paymentMethod,
          paymentMode: "demo",
          createdAt: new Date().toISOString()
        };

        // shortcut: xác nhận thanh toán demo; tích hợp cổng và phiên máy chủ trước khi thu tiền thật.
        bookingState.saveBookings([...bookingState.bookings, receipt]);

        return receipt;
      };

      return typeof navigator !== "undefined" && navigator.locks ? navigator.locks.request("btl-bookings", commit) : commit();
    }
  };

  try {
    const existing = bookingState.bookings;
    const remaining = existing.filter(booking => !booking.demoSeatSeed);

    if (remaining.length !== existing.length)
      bookingState.saveBookings(remaining);

    const sampleKey = "btl-original-nine-seats-20261020-" + today();

    if (localStorage.getItem(sampleKey) === null) {
      const originalIndex = booking => defaultBookings.findIndex(sample => sample.code === booking.code || booking.previousCodes?.includes(sample.code));

      const slots = bookingState.screenings.filter(
        show => show.date === today() && show.id.startsWith("demo-") && Date.parse(show.date + "T" + show.time) > Date.now()
      );

      const used = new Set();
      const updated = [];

      for (const booking of remaining) {
        if (originalIndex(booking) < 0 || booking.customerId || !Number.isInteger(booking.seats) || booking.seats < 1) {
          updated.push(booking);
          continue;
        }

        const show = slots.find(
          show => !used.has(show.id) && bookingState.movies.some(movie => String(movie.id) === show.movieId && movie.title === booking.movie)
        ) || slots.find(show => !used.has(show.id));

        if (!show) {
          updated.push(booking);
          continue;
        }

        let details;

        try {
          details = bookingState.booking.details(show.id);
        } catch {
          updated.push(booking);
          continue;
        }

        const taken = [...remaining.filter(other => originalIndex(other) < 0), ...updated].filter(other => other.screeningId === show.id && other.ticket !== "Đã hủy").flatMap(other => other.seatLabels || []);
        const seats = bookingState.booking.seatPlan(show.id).filter(seat => seat.type === "vip" && !taken.includes(seat.id)).slice(0, booking.seats);
        const total = seats.reduce((sum, seat) => sum + seat.price, 0);

        if (seats.length !== booking.seats || !Number.isSafeInteger(total)) {
          updated.push(booking);
          continue;
        }

        used.add(show.id);

        updated.push({
          ...booking,
          originalDemo: true,
          movieId: details.movie.id,
          movie: details.movie.title,
          screeningId: show.id,
          location: details.room.name,
          showtime: show.date.split("-").reverse().join("/") + " · " + show.time,
          seatLabels: seats.map(seat => seat.id),
          total,
          ticket: booking.ticket === "Đã sử dụng" ? "Đã xác nhận" : booking.ticket,
          paymentMode: "demo"
        });
      }

      if (JSON.stringify(updated) !== JSON.stringify(remaining))
        bookingState.saveBookings(updated);

      localStorage.setItem(sampleKey, "true");
    }
  } catch (error) {
    console.warn("Chưa đồng bộ được ghế cho chín vé mẫu gốc. Dữ liệu khách đặt được giữ nguyên.", error);
  }
})();
