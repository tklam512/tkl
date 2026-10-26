(() => {
  // Bật cuộn mượt khi thư viện sẵn sàng và người dùng cho phép chuyển động.
  if (typeof Lenis !== "function")
    return;

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let scroll;

  function syncMotion() {
    scroll?.destroy();

    scroll = motion.matches ? null : new Lenis({
      autoRaf: true,
      lerp: 0.1,
      syncTouch: false,

      anchors: {
        offset: -110
      },

      allowNestedScroll: true,
      stopInertiaOnNavigate: true
    });
  }

  syncMotion();
  motion.addEventListener("change", syncMotion);
})();
