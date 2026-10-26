(() => {
  // Chuyển ngày giờ hiển thị thành giá trị dùng để sắp xếp vé.
  const showtimeKey = (
    {
      showtime
    }
  ) => {
    const [date, time] = showtime.split(" · ");
    return date.split("/").reverse().join("-") + " " + time;
  };

  const money = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  });

  const statusClass = value => value.startsWith("Đã") ? "status-success" : value.startsWith("Chờ") ? "status-warning" : "status-muted";

  const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  function init() {
    const search = document.getElementById("bookingSearch");
    const rows = document.getElementById("bookingRows");
    const empty = document.getElementById("bookingEmpty");

    // Tìm kiếm và hiển thị danh sách vé mới nhất trước.
    function render(query = "") {
      const keyword = query.trim().toLocaleLowerCase("vi");

      const result = [...cinemaState.bookings].sort((a, b) => showtimeKey(b).localeCompare(showtimeKey(a))).filter(
        item => [item.code, item.customer, item.movie].some(value => value.toLocaleLowerCase("vi").includes(keyword))
      );

      rows.innerHTML = result.map(item => `
      <tr>
        <td><a class="booking-code" href="#booking" data-booking-code="${escapeHTML(item.code)}">${escapeHTML(item.code)}</a></td>
        <td><span class="customer-name">${escapeHTML(item.customer)}</span></td>
        <td><span class="movie-title">${escapeHTML(item.movie)}</span></td>
        <td>${escapeHTML(String(item.location || "").match(/Phòng\s+[^·]+/iu)?.[0].trim() || "—")}</td>
        <td class="showtime">${escapeHTML(item.showtime)}</td>
        <td>${escapeHTML(item.seats)} ghế</td>
        <td class="money">${money.format(item.total)}</td>
        <td><span class="status ${statusClass(item.ticket)}">${escapeHTML(item.ticket)}</span></td>
        <td><span class="status ${statusClass(item.payment)}">${escapeHTML(item.payment)}</span></td>
      </tr>`).join("");

      empty.hidden = result.length > 0;
    }

    const onSearch = event => render(event.target.value);

    const onCodeClick = event => {
      const link = event.target.closest("[data-booking-code]");

      if (!link)
        return;

      event.preventDefault();
      alert(`Chi tiết đặt vé ${link.dataset.bookingCode}`);
    };

    // Cập nhật danh sách khi dữ liệu vé thay đổi ở tab khác.
    const onStorage = event => {
      if (event.key === null || event.key === "btl-bookings")
        render(search.value || "");
    };

    window.addEventListener("storage", onStorage);
    search.addEventListener("input", onSearch);
    rows.addEventListener("click", onCodeClick);
    render();

    return () => {
      window.removeEventListener("storage", onStorage);
      search.removeEventListener("input", onSearch);
      rows.removeEventListener("click", onCodeClick);
    };
  }

  init();
})();
