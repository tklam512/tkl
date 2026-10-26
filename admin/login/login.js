// Kiểm tra thông tin đăng nhập và chuyển vào trang quản trị.
document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // shortcut: đăng nhập demo trên trình duyệt, dùng xác thực máy chủ trước khi triển khai thật.
  if (username !== "utcadmin" || password !== "12345678") {
    document.getElementById("loginError").style.display = "block";
    return;
  }

  sessionStorage.setItem("btl.loggedIn", "true");
  const next = new URL(new URLSearchParams(window.location.search).get("next") || "/admin/home/", window.location.origin);

  window.location.assign(
    next.origin === window.location.origin && next.pathname.startsWith("/admin/") && next.pathname !== "/admin/login/" ? next.href : "/admin/home/"
  );
});
