document.getElementById("movieReset")?.addEventListener("click", () => {
  const editor = document.getElementById("screeningEditor");

  if (editor)
    editor.close();
  else
    window.location.href = "index.html" + window.location.search;
});

// Đọc bộ lọc suất chiếu từ đường dẫn.
const query = new URLSearchParams(window.location.search);

function fillOptions(select, items) {
  items.forEach(([value, label]) => select.add(new Option(label, value)));
}

function addCell(row, text) {
  const cell = row.insertCell();
  cell.textContent = text;
  return cell;
}

let editingScreeningId = null;
const screeningRows = document.getElementById("film");

if (screeningRows) {
  const date = document.getElementById("showDate");
  const movie = document.getElementById("movie");
  fillOptions(movie, cinemaState.movies.map(item => [String(item.id), item.title]));
  date.value = query.get("date") || "";
  movie.value = query.get("movieId") || "";

  // Lọc, hiển thị và gắn thao tác sửa, xóa suất chiếu.
  function renderScreenings() {
    screeningRows.replaceChildren();
    const shows = cinemaState.screenings.filter(show => (!date.value || show.date === date.value) && (!movie.value || show.movieId === movie.value));
    shows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    shows.forEach(show => {
      const film = cinemaState.movies.find(item => String(item.id) === show.movieId);
      const room = cinemaState.rooms.find(item => item.theaterId === show.theaterId && item.room === show.room);
      const row = screeningRows.insertRow();

      [
        film?.title || "Phim đã xóa",
        room?.name || "Phòng " + show.room,
        show.date.split("-").reverse().join("/"),
        show.time,
        show.price.toLocaleString("vi-VN") + " ₫",
        room?.seats || 0
      ].forEach(value => addCell(row, value));

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "edit";
      edit.title = "Sửa suất chiếu";
      edit.setAttribute("aria-label", "Sửa suất chiếu");
      edit.innerHTML = '<i class="bi bi-pencil"></i>';

      edit.onclick = () => {
        editingScreeningId = show.id;
        screeningForm.reset();
        document.getElementById("movieSelect").value = show.movieId;
        document.getElementById("roomSelect").value = `${show.theaterId}:${show.room}`;
        document.getElementById("screeningDate").value = show.date;
        document.getElementById("showTime").value = show.time;
        document.getElementById("ticketPrice").value = show.price;
        document.getElementById("screeningTitle").textContent = "Sửa suất chiếu";
        document.getElementById("movieSubmit").textContent = "Lưu thay đổi";
        document.getElementById("screeningEditor").showModal();
      };

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "delete";
      remove.title = "Xóa suất chiếu";
      remove.setAttribute("aria-label", "Xóa suất chiếu");
      remove.innerHTML = '<i class="bi bi-trash"></i>';

      remove.onclick = () => {
        if (!confirm("Xóa suất chiếu này?"))
          return;

        try {
          cinemaState.saveScreenings(cinemaState.screenings.filter(item => item.id !== show.id));
          renderScreenings();
        } catch {
          alert("Không lưu được dữ liệu. Suất chiếu chưa bị xóa.");
        }
      };

      const actionsCell = addCell(row, "");
      actionsCell.className = "actions";
      actionsCell.append(edit, remove);
    });

    if (!shows.length)
      addCell(screeningRows.insertRow(), "Chưa có suất chiếu phù hợp.").colSpan = 7;
  }

  [date, movie].forEach(input => input.addEventListener("change", renderScreenings));

  document.getElementById("resetFilter").onclick = () => {
    date.value = movie.value = "";
    renderScreenings();
  };

  document.getElementById("add").onclick = () => {
    editingScreeningId = null;
    document.getElementById("screeningTitle").textContent = "Thêm suất chiếu mới";
    document.getElementById("movieSubmit").textContent = "Tạo mới";
    screeningForm.reset();
    document.getElementById("movieSelect").value = movie.value;
    document.getElementById("screeningDate").value = date.value || cinemaState.today();
    document.getElementById("screeningEditor").showModal();
  };

  renderScreenings();
}

const screeningForm = document.getElementById("screeningForm");

if (screeningForm) {
  const editor = document.getElementById("screeningEditor");
  const formDate = document.getElementById("screeningDate") || document.getElementById("showDate");

  editor?.addEventListener("cancel", event => {
    event.preventDefault();
    editor.close();
  });

  const movie = document.getElementById("movieSelect");
  const room = document.getElementById("roomSelect");
  fillOptions(movie, cinemaState.movies.map(item => [String(item.id), item.title]));
  movie.value = query.get("movieId") || "";
  formDate.value = query.get("date") || cinemaState.today();
  fillOptions(room, cinemaState.rooms.map(item => [item.id, item.name + " (" + item.seats + " ghế)"]));

  screeningForm.onsubmit = event => {
    event.preventDefault();
    const selectedRoom = cinemaState.rooms.find(item => item.id === room.value);

    if (!selectedRoom) {
      alert("Vui lòng chọn phòng chiếu hợp lệ.");
      return;
    }

    const show = {
      id: editingScreeningId ?? ("show-" + Date.now() + "-" + Math.random().toString(16).slice(2)),
      movieId: movie.value,
      theaterId: selectedRoom.theaterId,
      room: selectedRoom.room,
      date: formDate.value,
      time: document.getElementById("showTime").value,
      price: Number(document.getElementById("ticketPrice").value)
    };

    const error = cinemaState.screeningError(show);

    if (error) {
      alert(error);
      return;
    }

    try {
      const updatedShows = editingScreeningId === null ? [...cinemaState.screenings, show] : cinemaState.screenings.map(item => item.id === editingScreeningId ? {
        ...item,
        ...show
      } : item);

      cinemaState.saveScreenings(updatedShows);
      editingScreeningId = null;
    } catch {
      alert("Không lưu được dữ liệu. Vui lòng thử lại.");
      return;
    }

    if (editor) {
      editor.close();
      document.getElementById("showDate").value = show.date;
      document.getElementById("showDate").dispatchEvent(new Event("change"));
    } else window.location.href = "index.html?" + new URLSearchParams({
      date: show.date
    });
  };
}
