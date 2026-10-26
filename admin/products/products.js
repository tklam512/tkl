window.productPage = {
  // Khởi tạo danh sách sản phẩm và xử lý chọn, kéo thả ảnh.
  init: function() {
    this.data = cinemaState.products;
    this.imageReadVersion = 0;
    const imageInput = document.getElementById("product-image");
    const drop = document.getElementById("product-image-drop");
    imageInput.onchange = () => this.readImage(imageInput.files[0]);

    drop.ondragover = event => {
      event.preventDefault();
      drop.classList.add("is-dragging");
    };

    drop.ondragleave = event => {
      if (!drop.contains(event.relatedTarget))
        drop.classList.remove("is-dragging");
    };

    drop.ondrop = event => {
      event.preventDefault();
      drop.classList.remove("is-dragging");

      if (event.dataTransfer.files.length !== 1) {
        alert("Chọn một ảnh mỗi lần.");
        return;
      }

      imageInput.files = event.dataTransfer.files;
      imageInput.onchange();
    };

    document.getElementById("product-modal").addEventListener("close", () => {
      this.imageReadVersion++;
      this.imageLoading = false;
    });

    this.renderTable(this.data);
  },

  // Hiển thị sản phẩm trong bảng.
  renderTable: function(dataToRender) {
    const tbody = document.getElementById("product-table-body");

    if (!tbody)
      return;

    tbody.innerHTML = "";

    if (dataToRender.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Không tìm thấy sản phẩm nào.</td></tr>';
      return;
    }

    dataToRender.forEach(p => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td><img src="${p.image}" class="product-img" alt="${p.name}"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${p.price.toLocaleString("vi-VN")} đ</td>
                <td>${p.stock}</td>
                <td>
                    <span class="status-badge ${p.status === "active" ? "status-active" : "status-inactive"}">
                        ${p.status === "active" ? "Đang bán" : "Ngừng bán"}
                    </span>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn-icon" title="Sửa" onclick="productPage.editProduct(${p.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn-icon delete" title="Xóa" onclick="productPage.deleteProduct(${p.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            `;

      tbody.appendChild(tr);
    });
  },

  // Lọc sản phẩm theo từ khóa tìm kiếm.
  search: function() {
    const keyword = document.getElementById("search-product").value.toLowerCase();
    const statusFilter = document.getElementById("filter-status").value;

    const filtered = this.data.filter(p => {
      const matchName = p.name.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" ? true : p.status === statusFilter;
      return matchName && matchStatus;
    });

    this.renderTable(filtered);
  },

  // Mở form thêm hoặc sửa sản phẩm.
  openModal: function(id = null) {
    const modal = document.getElementById("product-modal");
    const title = document.getElementById("modal-title");
    const form = document.getElementById("product-form");
    form.reset();
    this.imageReadVersion++;
    this.imageLoading = false;
    this.currentImage = "";

    if (id) {
      title.textContent = "Cập nhật Sản phẩm";
      const p = this.data.find(item => item.id === id);

      if (p) {
        document.getElementById("product-id").value = p.id;
        document.getElementById("product-name").value = p.name;
        document.getElementById("product-category").value = p.category;
        document.getElementById("product-desc").value = p.desc;
        document.getElementById("product-price").value = p.price;
        document.getElementById("product-stock").value = p.stock;
        this.currentImage = p.image;
        document.getElementById("product-status").value = p.status;
      }
    } else {
      title.textContent = "Thêm Sản phẩm mới";
      document.getElementById("product-id").value = "";
    }

    this.updateImagePreview();
    modal.showModal();
  },

  updateImagePreview: function() {
    const preview = document.getElementById("product-image-preview");
    preview.hidden = !this.currentImage;

    if (this.currentImage)
      preview.src = this.currentImage;
    else
      preview.removeAttribute("src");
  },

  // Kiểm tra ảnh tải lên và cập nhật ảnh xem trước.
  readImage: function(file) {
    const version = ++this.imageReadVersion;
    this.imageLoading = false;

    if (!file)
      return;

    const input = document.getElementById("product-image");

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      input.value = "";
      alert("Chọn ảnh JPG, PNG hoặc GIF không quá 5MB.");
      return;
    }

    this.imageLoading = true;
    const reader = new FileReader();

    reader.onload = () => {
      if (version !== this.imageReadVersion)
        return;

      this.currentImage = reader.result;
      this.imageLoading = false;
      this.updateImagePreview();
    };

    reader.onerror = () => {
      if (version !== this.imageReadVersion)
        return;

      this.imageLoading = false;
      input.value = "";
      alert("Không đọc được ảnh, bạn hãy chọn lại.");
    };

    reader.readAsDataURL(file);
  },

  closeModal: function() {
    document.getElementById("product-modal").close();
  },

  // Kiểm tra dữ liệu form và lưu sản phẩm.
  saveProduct: function(event) {
    event.preventDefault();

    if (this.imageLoading) {
      alert("Ảnh đang được đọc, bạn đợi một chút rồi lưu nhé.");
      return;
    }

    const id = document.getElementById("product-id").value;

    const newProduct = {
      // Generate ID nếu thêm mới
      id: id ? parseInt(id) : Date.now(),

      name: document.getElementById("product-name").value,
      category: document.getElementById("product-category").value,
      desc: document.getElementById("product-desc").value,
      price: parseInt(document.getElementById("product-price").value),
      stock: parseInt(document.getElementById("product-stock").value),
      image: this.currentImage || "https://via.placeholder.com/50",
      status: document.getElementById("product-status").value
    };

    const updated = id ? this.data.map(item => item.id === Number(id) ? newProduct : item) : [...this.data, newProduct];

    try {
      cinemaState.saveProducts(updated);
    } catch {
      alert("Không lưu được dữ liệu. Vui lòng thử lại.");
      return;
    }

    this.data = updated;
    this.closeModal();
    this.renderTable(this.data);
  },

  editProduct: function(id) {
    this.openModal(id);
  },

  // Xác nhận trước khi xóa sản phẩm.
  deleteProduct: function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      const updated = this.data.filter(item => item.id !== id);

      try {
        cinemaState.saveProducts(updated);
      } catch {
        alert("Không lưu được dữ liệu. Sản phẩm chưa bị xóa.");
        return;
      }

      this.data = updated;
      this.search(); // Render lại theo bộ lọc hiện tại
    }
  }
};

window.productPage.init();
