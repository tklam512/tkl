// Khởi tạo trang quản lý phim và lấy các thành phần trên giao diện.
function initMoviesPage() {
  const tbody = document.getElementById("movies");
  const search = document.getElementById("search");
  const filter = document.getElementById("filter");
  const list = document.getElementById("movieList");
  const editor = document.getElementById("movieEditor");
  const form = document.getElementById("movie-form");
  const addButton = document.getElementById("add");
  const cancelButton = document.getElementById("cancel");
  const formTitle = document.getElementById("form-title");

  if (!tbody || !search || !filter || !list || !editor || !form || !addButton || !cancelButton || !formTitle) {
    return;
  }

  const statusLabels = {
    showing: "ĐANG CHIẾU",
    soon: "SẮP CHIẾU",
    ended: "NGỪNG CHIẾU"
  };

  let movies = cinemaState.movies;
  let editingId = null;

  function createElement(tag, text, className) {
    const element = document.createElement(tag);

    if (text !== undefined) {
      element.textContent = text;
    }

    if (className) {
      element.className = className;
    }

    return element;
  }

  function saveMovies() {
    cinemaState.saveMovies(movies);
    renderMovies();
  }

  // Lọc và hiển thị danh sách phim.
  function renderMovies() {
    tbody.replaceChildren();
    const keyword = search.value.trim().toLocaleLowerCase("vi");

    const results = movies.filter(movie => {
      const matchesSearch = movie.title.toLocaleLowerCase("vi").includes(keyword);
      const matchesStatus = filter.value === "" || cinemaState.movieStatus(movie) === filter.value;
      return matchesSearch && matchesStatus;
    });

    if (results.length === 0) {
      const row = createElement("tr");
      const cell = createElement("td", "Không tìm thấy phim.", "empty");
      cell.colSpan = 8;
      row.append(cell);
      tbody.append(row);
      return;
    }

    results.forEach(movie => {
      const row = createElement("tr");

      const cells = Array.from({
        length: 8
      }, () => createElement("td"));

      let poster;

      if (movie.poster) {
        poster = createElement("img", undefined, "poster");
        poster.src = movie.poster;
        poster.alt = movie.title;
      } else {
        poster = createElement("div", movie.title, "poster");
        poster.style.backgroundColor = movie.color || "#31465a";
      }

      cells[0].append(poster);
      cells[1].append(createElement("div", movie.title, "title"), createElement("div", movie.subtitle || "", "subtitle"));
      const tags = createElement("div", undefined, "tags");

      movie.genres.forEach(genre => {
        const tag = createElement("span", undefined, "tag");
        const icon = createElement("i", undefined, "bi bi-tag-fill");
        tag.append(icon, document.createTextNode(genre));
        tags.append(tag);
      });

      cells[2].append(tags);
      cells[3].textContent = `${movie.duration} phút`;
      const screeningLink = createElement("a", movie.date.split("-").reverse().join("/"));

      screeningLink.href = "/admin/showtimes/?" + new URLSearchParams({
        date: movie.date,
        movieId: String(movie.id)
      });

      screeningLink.target = "_top";
      cells[4].append(screeningLink);

      cells[5].append(
        createElement("span", statusLabels[cinemaState.movieStatus(movie)], `status ${cinemaState.movieStatus(movie)}`)
      );

      cells[6].className = "rating";

      cells[6].append(
        createElement("span", "★ ", "star"),
        document.createTextNode(movie.rating == null ? "Chưa có điểm" : `${movie.rating.toFixed(1)}/10`)
      );

      cells[7].className = "actions";
      const editButton = createElement("button", undefined, "edit");
      editButton.type = "button";
      editButton.title = "Sửa phim";
      editButton.setAttribute("aria-label", `Sửa ${movie.title}`);
      editButton.append(createElement("i", undefined, "bi bi-pencil"));
      editButton.onclick = () => openForm(movie);
      const deleteButton = createElement("button", undefined, "delete");
      deleteButton.type = "button";
      deleteButton.title = "Xóa phim";
      deleteButton.setAttribute("aria-label", `Xóa ${movie.title}`);
      deleteButton.append(createElement("i", undefined, "bi bi-trash"));

      deleteButton.onclick = () => {
        if (cinemaState.screenings.some(show => show.movieId === String(movie.id))) {
          alert("Phim đang có suất chiếu. Hãy xóa suất chiếu trước khi xóa phim.");
          return;
        }

        if (confirm(`Bạn muốn xóa phim "${movie.title}"?`)) {
          movies = movies.filter(item => item.id !== movie.id);
          saveMovies();
        }
      };

      cells[7].append(editButton, deleteButton);
      row.append(...cells);
      tbody.append(row);
    });
  }

  const posterFile = document.getElementById("posterFile");
  const previewBox = document.getElementById("posterPreviewBox");
  const preview = document.getElementById("posterPreview");
  const genreOptions = document.getElementById("movieGenreOptions");
  const saveButton = document.getElementById("saveMovie");
  let currentPoster = "";
  let posterLoading = false;
  let imageReadVersion = 0;

  // Tạo các lựa chọn thể loại cho form phim.
  function renderGenresOptions() {
    const availableGenres = cinemaState.genres.map(genre => genre.name);
    genreOptions.replaceChildren();

    availableGenres.forEach(genre => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "genres";
      input.value = genre;
      label.append(input, genre);
      genreOptions.append(label);
    });
  }

  function updateSelectedGenres() {
    const selected = Array.from(genreOptions.querySelectorAll("input:checked")).map(input => input.value);
    document.getElementById("selectedGenreCount").textContent = selected.length;
    const tags = document.getElementById("selectedGenreTags");
    tags.replaceChildren();

    selected.forEach(genre => {
      tags.append(createElement("span", genre, "tag"));
    });
  }

  genreOptions.onchange = updateSelectedGenres;

  // Cập nhật ảnh xem trước của poster.
  function updatePosterPreview() {
    previewBox.hidden = !currentPoster;

    if (currentPoster) {
      preview.src = currentPoster;
    } else {
      preview.removeAttribute("src");
    }
  }

  const posterDrop = document.getElementById("posterDrop");

  posterDrop.ondragover = event => {
    event.preventDefault();
    posterDrop.classList.add("is-dragging");
  };

  posterDrop.ondragleave = event => {
    if (!posterDrop.contains(event.relatedTarget))
      posterDrop.classList.remove("is-dragging");
  };

  posterDrop.ondrop = event => {
    event.preventDefault();
    posterDrop.classList.remove("is-dragging");

    if (event.dataTransfer.files.length !== 1) {
      alert("Chọn một ảnh mỗi lần.");
      return;
    }

    posterFile.files = event.dataTransfer.files;
    posterFile.onchange();
  };

  posterFile.onchange = () => {
    const version = ++imageReadVersion;
    posterLoading = false;
    const file = posterFile.files[0];

    if (!file)
      return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert("Chọn ảnh JPG, PNG hoặc GIF không quá 5MB.");
      posterFile.value = "";
      return;
    }

    posterLoading = true;
    const reader = new FileReader();

    reader.onload = () => {
      if (version !== imageReadVersion)
        return;

      currentPoster = reader.result;
      posterLoading = false;
      updatePosterPreview();
    };

    reader.onerror = () => {
      if (version !== imageReadVersion)
        return;

      posterLoading = false;
      posterFile.value = "";
      alert("Không đọc được ảnh, bạn hãy chọn lại.");
    };

    reader.readAsDataURL(file);
  };

  document.getElementById("removePoster").onclick = () => {
    imageReadVersion++;
    posterLoading = false;
    currentPoster = "";
    posterFile.value = "";
    updatePosterPreview();
  };

  // Điền dữ liệu khi thêm hoặc sửa phim.
  function openForm(movie = null) {
    imageReadVersion++;
    posterLoading = false;
    form.reset();
    renderGenresOptions();
    editingId = movie ? movie.id : null;
    currentPoster = movie?.poster || "";
    formTitle.textContent = movie ? "Sửa phim" : "Thêm phim mới";
    saveButton.textContent = movie ? "Cập nhật" : "Tạo mới";

    if (movie) {
      const names = ["title", "subtitle", "duration", "date", "endDate", "age", "language", "subtitles", "status"];

      names.forEach(name => {
        form.elements.namedItem(name).value = movie[name] ?? "";
      });

      form.elements.namedItem("status").value = cinemaState.movieStatus(movie);
    }

    genreOptions.querySelectorAll("input").forEach(input => {
      input.checked = movie ? movie.genres.includes(input.value) : false;
    });

    updatePosterPreview();
    updateSelectedGenres();
    editor.showModal();

    window.scrollTo({
      top: 0
    });
  }

  editor.addEventListener("cancel", event => {
    event.preventDefault();
    closeMovieEditor();
  });

  function closeMovieEditor() {
    imageReadVersion++;
    posterLoading = false;
    editor.close();

    window.scrollTo({
      top: 0
    });
  }

  form.onsubmit = event => {
    event.preventDefault();

    if (posterLoading) {
      alert("Ảnh đang được đọc, bạn đợi một chút rồi lưu nhé.");
      return;
    }

    const fields = new FormData(form);

    const movieData = {
      title: String(fields.get("title") || "").trim(),
      subtitle: String(fields.get("subtitle") || "").trim(),
      duration: Number(fields.get("duration")),
      date: String(fields.get("date") || ""),
      endDate: String(fields.get("endDate") || ""),
      age: String(fields.get("age") || ""),
      language: String(fields.get("language") || "").trim(),
      subtitles: String(fields.get("subtitles") || "").trim(),
      status: form.elements.namedItem("status").value,
      genres: fields.getAll("genres"),
      poster: currentPoster
    };

    if (!movieData.title || !movieData.genres.length || !Number.isFinite(movieData.duration) || movieData.duration < 1 || movieData.duration > 600 || !movieData.date || !(movieData.status in statusLabels)) {
      alert("Dữ liệu không hợp lệ!");
      return;
    }

    if (movieData.endDate && movieData.endDate < movieData.date) {
      alert("Ngày kết thúc phải từ ngày khởi chiếu trở đi.");
      return;
    }

    if (editingId !== null) {
      const updatedMovies = movies.map(movie => movie.id === editingId ? {
        ...movie,
        ...movieData
      } : movie);

      const invalidShow = cinemaState.screenings.find(show => cinemaState.screeningError(show, updatedMovies));

      if (invalidShow) {
        alert(
          "Thay đổi này không phù hợp với suất chiếu đã lưu: " + cinemaState.screeningError(invalidShow, updatedMovies)
        );

        return;
      }

      movies = updatedMovies;
    } else {
      movies.push({
        ...movieData,
        id: `movie-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        color: "#31465a"
      });
    }

    search.value = "";
    filter.value = "";
    saveMovies();
    closeMovieEditor();
  };

  addButton.onclick = () => openForm();
  cancelButton.onclick = closeMovieEditor;
  search.oninput = renderMovies;
  filter.onchange = renderMovies;
  renderMovies();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMoviesPage);
} else {
  initMoviesPage();
}

// Quản lý danh sách thể loại phim.
function initGenresPage() {
  const page = document.getElementById("genresPage");

  if (!page)
    return;

  const tbody = document.getElementById("genresTable");
  const search = document.getElementById("genreSearch");
  const list = document.getElementById("genresList");
  const editor = document.getElementById("genreEditor");
  const form = document.getElementById("genreForm");
  const nameInput = document.getElementById("genreName");
  const descriptionInput = document.getElementById("genreDescription");
  const formTitle = document.getElementById("genreFormTitle");
  const saveButton = document.getElementById("saveGenre");
  const notice = document.getElementById("genreNotice");
  let genres = cinemaState.genres;

  function saveGenres() {
    cinemaState.saveGenres(genres);
  }

  let editingId = null;
  let nextId = Math.max(8, ...genres.map(genre => genre.id)) + 1;

  function renderGenres() {
    tbody.replaceChildren();
    const keyword = search.value.trim().toLocaleLowerCase("vi");
    const results = genres.filter(genre => genre.name.toLocaleLowerCase("vi").includes(keyword));
    results.sort((a, b) => a.id - b.id);

    if (results.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.className = "empty";
      cell.textContent = "Không tìm thấy thể loại.";
      row.append(cell);
      tbody.append(row);
      return;
    }

    results.forEach(genre => {
      const row = document.createElement("tr");
      const idCell = document.createElement("td");
      idCell.textContent = genre.id;
      const nameCell = document.createElement("td");
      nameCell.className = "genre-name";
      nameCell.textContent = genre.name;
      const descriptionCell = document.createElement("td");
      descriptionCell.textContent = genre.description;
      const actionsCell = document.createElement("td");
      actionsCell.className = "actions";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit";
      editButton.setAttribute("aria-label", `Sửa ${genre.name}`);
      const editIcon = document.createElement("i");
      editIcon.className = "bi bi-pencil";
      editButton.append(editIcon);
      editButton.onclick = () => openEditor(genre);
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete";
      deleteButton.setAttribute("aria-label", `Xóa ${genre.name}`);
      const deleteIcon = document.createElement("i");
      deleteIcon.className = "bi bi-trash";
      deleteButton.append(deleteIcon);

      deleteButton.onclick = () => {
        if (!confirm(`Xóa thể loại "${genre.name}"?`))
          return;

        genres = genres.filter(item => item.id !== genre.id);
        saveGenres();
        renderGenres();
        notice.textContent = "Xóa thể loại thành công!";
      };

      actionsCell.append(editButton, deleteButton);
      row.append(idCell, nameCell, descriptionCell, actionsCell);
      tbody.append(row);
    });
  }

  function openEditor(genre = null) {
    form.reset();
    notice.textContent = "";
    editingId = genre ? genre.id : null;
    formTitle.textContent = genre ? "Sửa thể loại" : "Thêm thể loại";
    saveButton.textContent = genre ? "Cập nhật" : "Thêm mới";

    if (genre) {
      nameInput.value = genre.name;
      descriptionInput.value = genre.description;
    }

    editor.showModal();
    nameInput.focus();
  }

  editor.addEventListener("cancel", event => {
    event.preventDefault();
    closeEditor();
  });

  function closeEditor() {
    editor.close();
    editingId = null;
  }

  document.getElementById("addGenre").onclick = () => openEditor();

  document.getElementById("cancelGenre").onclick = () => {
    closeEditor();
    notice.textContent = "";
  };

  search.oninput = renderGenres;

  form.onsubmit = event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
      nameInput.setCustomValidity("Vui lòng nhập tên thể loại.");
      nameInput.reportValidity();
      return;
    }

    const duplicate = genres.some(
      genre => genre.id !== editingId && genre.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi")
    );

    if (duplicate) {
      nameInput.setCustomValidity("Tên thể loại đã tồn tại.");
      nameInput.reportValidity();
      return;
    }

    const isEditing = editingId !== null;

    if (isEditing) {
      genres = genres.map(genre => genre.id === editingId ? {
        ...genre,
        name,
        description
      } : genre);
    } else {
      genres.unshift({
        id: nextId++,
        name,
        description
      });
    }

    saveGenres();
    search.value = "";
    renderGenres();
    closeEditor();
    notice.textContent = isEditing ? "Cập nhật thể loại thành công!" : "Thêm thể loại thành công!";
  };

  nameInput.oninput = () => {
    nameInput.setCustomValidity("");
  };

  renderGenres();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGenresPage);
} else {
  initGenresPage();
}
