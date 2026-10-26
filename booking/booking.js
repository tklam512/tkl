(() => {
  const main = document.getElementById("main");
  const api = cinemaState.booking;
  const screeningId = new URLSearchParams(location.search).get("screening");

  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => (({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]));

  const money = value => new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(value);

  const typeNames = {
    standard: "Ghế thường",
    vip: "Ghế VIP",
    couple: "Ghế đôi"
  };

  const methods = {
    vnpay: "VNPay",
    momo: "MoMo",
    card: "Thẻ quốc tế"
  };

  let details;
  let user;
  let draft;
  let selected;
  let timer;
  let stage = "seats";
  let busy = false;
  const storageKey = "btl-booking-draft-" + screeningId;

  function fail(message) {
    main.innerHTML = `<div class="container page-content booking-empty"><h1>Chưa thể đặt vé</h1><p>${escape(message)}</p><a class="button button-primary" href="/movies/">Chọn suất chiếu khác</a></div>`;
  }

  // Lưu tạm lựa chọn để tiếp tục khi tải lại trang.
  function persist() {
    draft.seatIds = [...selected];

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {}
  }

  function newDraft() {
    draft = {
      customerId: user?.id || null,
      seatIds: [],
      expiresAt: Date.now() + 600000,
      requestId: crypto.randomUUID()
    };

    selected = new Set();
    persist();
  }

  function message(text) {
    const output = document.getElementById("booking-error");

    if (output && output.textContent !== text) {
      output.textContent = text;

      if (text)
        output.focus();
    }
  }

  // Cập nhật thời gian còn lại của lượt chọn ghế.
  function tick() {
    const seconds = Math.max(0, Math.ceil((draft.expiresAt - Date.now()) / 1000));
    const clock = document.getElementById("booking-clock");

    if (clock)
      clock.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

    if (!seconds && stage !== "success") {
      document.querySelectorAll(".seat-button, #continue-booking, #confirm-payment").forEach(button => button.disabled = true);
      message("Hết thời gian chọn ghế. Bấm “Chọn lại ghế” để bắt đầu lại.");
      const restart = document.getElementById("restart-booking");

      if (restart)
        restart.hidden = false;
    }
  }

  // Tạo khung thông tin chung cho các bước đặt vé.
  function frame(content, checkout = false) {
    stage = checkout ? "checkout" : "seats";
    draft.stage = stage;
    persist();
    main.innerHTML = `<div class="container booking-page"><a class="back-link" href="/movies/detail/?id=${encodeURIComponent(details.movie.id)}">‹ Thông tin phim</a><div class="booking-heading"><div><h1>${escape(details.movie.title)}</h1><p>${escape(details.show.date.split("-").reverse().join("/"))} · Giờ chiếu: <strong>${escape(details.show.time)}</strong> · ${escape(details.room.name)}</p></div><p class="booking-timer">Thời gian chọn ghế: <strong id="booking-clock"></strong></p></div><ol class="booking-steps" aria-label="Các bước đặt vé"><li${checkout ? "" : ' aria-current="step"'}>1. Chọn ghế</li><li${checkout ? ' aria-current="step"' : ""}>2. Thanh toán</li></ol><p id="booking-error" class="booking-error" role="alert" tabindex="-1"></p><button type="button" class="button button-outline" id="restart-booking" hidden>Chọn lại ghế</button>${content}</div>`;

    document.getElementById("restart-booking").onclick = () => {
      newDraft();
      renderSeats();
    };

    tick();
  }

  function seatSummary() {
    if (!selected.size) return {
      items: [],
      total: 0
    };

    return api.quote(screeningId, [...selected]);
  }

  // Cập nhật ghế đang chọn và tổng tiền.
  function updateSelection() {
    document.querySelectorAll(".seat-button:not(:disabled)").forEach(button => {
      const active = selected.has(button.dataset.seat);
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });

    document.getElementById("selected-seats").textContent = [...selected].join(", ") || "Chưa chọn ghế";
    document.getElementById("seat-total").textContent = money(seatSummary().total);
    document.getElementById("continue-booking").disabled = !selected.size || draft.expiresAt <= Date.now();
    persist();
  }

  // Vẽ sơ đồ ghế và xử lý chọn ghế, kể cả ghế đôi.
  function renderSeats() {
    let plan;

    try {
      details = api.details(screeningId);
      plan = api.seatPlan(screeningId);
    } catch (error) {
      fail(error.message);
      return;
    }

    const booked = new Set(api.reservedSeats(screeningId));
    let removed = false;

    for (const seat of plan) {
      if (booked.has(seat.id) && selected.has(seat.id)) {
        selected.delete(seat.id);

        if (seat.pair)
          plan.filter(other => other.pair === seat.pair).forEach(other => selected.delete(other.id));

        removed = true;
      }
    }

    const rows = Array.from({
      length: 9
    }, (_, row) => `<div class="seat-row" role="group" aria-label="Hàng ${String.fromCharCode(65 + row)}">${plan.filter(seat => seat.row === row).reverse().map(seat => {
  const unavailable = booked.has(seat.id) || Boolean(seat.pair && plan.some(other => other.pair === seat.pair && booked.has(other.id)));
  return `<button type="button" class="seat-button seat-${seat.type}${unavailable ? " is-booked" : ""}" data-seat="${seat.id}" aria-label="Ghế ${seat.id}, ${unavailable ? "đã đặt" : typeNames[seat.type] + ", " + money(seat.price)}" aria-pressed="false"${unavailable ? " disabled" : ""}>${unavailable ? '<span aria-hidden="true">×</span>' : ""}${seat.id}</button>`;
}).join("")}</div>`).join("");

    frame(
      `<section class="seat-picker" aria-labelledby="seat-room"><img class="cinema-screen" src="/assets/booking/screen.webp" alt="Màn chiếu" width="898" height="110"><h2 id="seat-room">${escape(details.room.name)}</h2><div class="seat-scroll" tabindex="0" role="region" aria-label="Sơ đồ 124 ghế, có thể cuộn ngang trên màn hình nhỏ"><div class="seat-map">${rows}</div></div><ul class="seat-legend"><li><span class="seat-swatch is-booked">×</span>Đã đặt</li><li><span class="seat-swatch is-selected"></span>Ghế bạn chọn</li>${Object.entries(typeNames).map(
  ([type, label]) => `<li><span class="seat-swatch seat-${type}"></span>${label} · ${money(details.show.price + (type === "vip" ? 10000 : type === "couple" ? 15000 : 0))}/ghế</li>`
).join("")}</ul><p class="booking-hint">Ghế đôi được chọn theo cặp. Ghế được kiểm tra lại khi xác nhận đặt vé.</p><div class="seat-footer"><div><p>Ghế đã chọn: <strong id="selected-seats"></strong></p><p>Tổng tiền: <strong id="seat-total"></strong></p></div><div class="booking-actions"><a class="button button-outline" href="/movies/detail/?id=${encodeURIComponent(details.movie.id)}">Quay lại</a><button class="button button-primary" type="button" id="continue-booking" disabled>Thanh toán</button></div></div></section>`
    );

    document.querySelectorAll(".seat-button").forEach(button => button.onclick = () => {
      if (draft.expiresAt <= Date.now()) {
        tick();
        return;
      }

      const seat = plan.find(seat => seat.id === button.dataset.seat);
      const group = seat.pair ? plan.filter(other => other.pair === seat.pair) : [seat];
      const active = selected.has(seat.id);
      group.forEach(other => active ? selected.delete(other.id) : selected.add(other.id));

      try {
        updateSelection();
        message("");
      } catch (error) {
        renderSeats();
        message(error.message);
      }
    });

    document.getElementById("continue-booking").onclick = () => {
      try {
        seatSummary();
        renderCheckout();
        main.focus();
      } catch (error) {
        renderSeats();
        message(error.message);
      }
    };

    updateSelection();

    if (removed)
      message("Một số ghế vừa được đặt ở tab khác và đã được bỏ khỏi lựa chọn của bạn.");
  }

  // Hiển thị bước thanh toán và xử lý xác nhận đặt vé.
  function renderCheckout() {
    const quote = seatSummary();
    const cardIcon = '<svg viewBox="0 0 32 24" width="34" height="26" aria-hidden="true" fill="none"><rect x="1" y="1" width="30" height="22" rx="4" stroke="currentColor" stroke-width="2"/><path d="M2 8h28M6 17h6" stroke="currentColor" stroke-width="3"/></svg>';

    frame(
      `<div class="checkout-layout"><div><section class="checkout-panel"><h2>Thông tin phim</h2><dl class="booking-details"><div class="booking-wide"><dt>Phim</dt><dd>${escape(details.movie.title)}</dd></div><div><dt>Ngày giờ chiếu</dt><dd>${escape(details.show.time)} · ${escape(details.show.date.split("-").reverse().join("/"))}</dd></div><div><dt>Ghế</dt><dd>${escape([...selected].join(", "))}</dd></div><div><dt>Định dạng</dt><dd>2D</dd></div><div><dt>Phòng chiếu</dt><dd>${escape(details.room.name)}</dd></div></dl></section><section class="checkout-panel"><h2>Thông tin thanh toán</h2><div class="payment-table-wrap"><table class="payment-table"><thead><tr><th scope="col">Danh mục</th><th scope="col">Số lượng</th><th scope="col">Thành tiền</th></tr></thead><tbody>${Object.entries(typeNames).filter(([type]) => quote.items.some(seat => seat.type === type)).map(([type, label]) => {
  const items = quote.items.filter(seat => seat.type === type);
  return `<tr><td>${label} (${escape(items.map(seat => seat.id).join(", "))})</td><td>${items.length}</td><td>${money(items.reduce((sum, seat) => sum + seat.price, 0))}</td></tr>`;
}).join("")}</tbody></table></div></section></div><form class="checkout-panel checkout-payment" id="payment-form"><fieldset><legend>Phương thức thanh toán</legend>${Object.entries(methods).map(
  ([method, label]) => `<label class="payment-option"><input type="radio" name="paymentMethod" value="${method}" required${(draft.paymentMethod || "vnpay") === method ? " checked" : ""}>${method === "card" ? cardIcon : `<img src="/assets/booking/${method}.webp" alt="" width="${method === "vnpay" ? 92 : 32}" height="32">`}<span>${label}</span></label>`
).join("")}</fieldset><h2>Chi phí</h2><dl class="checkout-cost"><div><dt>Thanh toán</dt><dd>${money(quote.total)}</dd></div><div><dt>Phí</dt><dd>0 ₫</dd></div><div class="checkout-total"><dt>Tổng cộng</dt><dd>${money(quote.total)}</dd></div></dl><label class="payment-terms"><input type="checkbox" name="acceptedTerms" required${draft.acceptedTerms ? " checked" : ""}><span>Tôi xác nhận thông tin chính xác và đồng ý với <a class="text-link" href="/about/#policy" target="_blank" rel="noopener">điều khoản sử dụng</a>.</span></label><p class="booking-hint">Thanh toán mô phỏng, không thu tiền và không yêu cầu thông tin thẻ.</p><button class="button button-primary" id="confirm-payment" type="submit" disabled>Xác nhận thanh toán demo</button><button class="button button-outline" id="back-to-seats" type="button">Quay lại chọn ghế</button></form></div>`,
      true
    );

    const form = document.getElementById("payment-form");
    const submit = document.getElementById("confirm-payment");

    form.onchange = () => {
      draft.paymentMethod = form.elements.paymentMethod.value;
      draft.acceptedTerms = form.elements.acceptedTerms.checked;
      persist();
      submit.disabled = busy || !form.checkValidity() || draft.expiresAt <= Date.now();
    };

    document.getElementById("back-to-seats").onclick = () => {
      renderSeats();
      main.focus();
    };

    form.onsubmit = async event => {
      event.preventDefault();

      if (busy || !form.reportValidity())
        return;

      if (draft.expiresAt <= Date.now()) {
        tick();
        return;
      }

      if (!customerAuth.currentUser()) {
        draft.paymentMethod = form.elements.paymentMethod.value;
        draft.acceptedTerms = form.elements.acceptedTerms.checked;
        persist();
        location.assign("/login/?next=" + encodeURIComponent(location.pathname + location.search));
        return;
      }

      busy = true;
      submit.disabled = true;
      submit.textContent = "Đang xác nhận…";

      try {
        const receipt = await api.placeBooking({
          screeningId,
          seatIds: [...selected],
          paymentMethod: form.elements.paymentMethod.value,
          acceptedTerms: form.elements.acceptedTerms.checked,
          expiresAt: draft.expiresAt,
          requestId: draft.requestId
        });

        draft.bookingCode = receipt.code;
        persist();
        renderSuccess(receipt);
      } catch (error) {
        renderSeats();
        message(error.message);
      } finally {
        busy = false;
      }
    };

    form.onchange();
  }

  // Hiển thị biên nhận sau khi đặt vé thành công.
  function renderSuccess(receipt) {
    stage = "success";
    clearInterval(timer);
    main.innerHTML = `<div class="container booking-page"><section class="booking-success"><span class="booking-success-mark" aria-hidden="true">✓</span><h1>Đặt vé thành công</h1><p>Vé demo đã được lưu. Không có khoản tiền nào được thu.</p><dl class="booking-details"><div class="booking-wide"><dt>Mã đặt vé</dt><dd class="receipt-code">${escape(receipt.code)}</dd></div><div class="booking-wide"><dt>Phim</dt><dd>${escape(receipt.movie)}</dd></div><div><dt>Khách hàng</dt><dd>${escape(receipt.customer)}</dd></div><div><dt>Ngày giờ chiếu</dt><dd>${escape(receipt.showtime)}</dd></div><div><dt>Phòng chiếu</dt><dd>${escape(receipt.location)}</dd></div><div><dt>Ghế</dt><dd>${escape(receipt.seatLabels.join(", "))}</dd></div><div><dt>Phương thức</dt><dd>${escape(methods[receipt.paymentMethod])} · Demo</dd></div><div><dt>Tổng cộng</dt><dd>${money(receipt.total)}</dd></div></dl><div class="booking-actions"><a class="button button-primary" href="/my-tickets/">Vé của tôi</a><button class="button button-outline" id="book-again" type="button">Đặt thêm vé suất này</button></div></section></div>`;

    document.getElementById("book-again").onclick = () => {
      newDraft();
      renderSeats();
      timer = setInterval(tick, 1000);
    };

    main.focus();
  }

  try {
    details = api.details(screeningId);
    user = customerAuth.currentUser();

    try {
      draft = JSON.parse(sessionStorage.getItem(storageKey));
    } catch {
      draft = null;
    }

    if (!draft || (draft.customerId && draft.customerId !== user?.id) || !Array.isArray(draft.seatIds) || !Number.isFinite(draft.expiresAt) || typeof draft.requestId !== "string")
      newDraft();
    else {
      selected = new Set(draft.seatIds.filter(id => api.seatPlan(screeningId).some(seat => seat.id === id)));
      draft.customerId = user?.id || null;
      persist();
    }

    const receipt = user && draft.bookingCode && cinemaState.bookings.find(
      booking => (booking.code === draft.bookingCode || booking.previousCodes?.includes(draft.bookingCode)) && booking.customerId === user.id
    );

    if (receipt)
      renderSuccess(receipt);
    else {
      if (draft.stage === "checkout" && selected.size && draft.expiresAt > Date.now()) {
        try {
          renderCheckout();
        } catch (error) {
          renderSeats();
          message(error.message);
        }
      } else
        renderSeats();

      timer = setInterval(tick, 1000);
    }

    window.addEventListener("storage", event => {
      if (stage === "success")
        return;

      if (event.key === "btl-customer-session" || event.key === "btl-customers" || event.key === null) {
        location.reload();
        return;
      }

      if (["btl-bookings", "btl-screenings", "btl-movies", "btl-theaters"].includes(event.key)) {
        try {
          details = api.details(screeningId);

          if (stage === "checkout") {
            seatSummary();
            renderCheckout();
          } else
            renderSeats();
        } catch (error) {
          renderSeats();
          message(error.message);
        }
      }
    });
  } catch (error) {
    fail(error.message);
  }
})();
