(() => {
  // Đóng hộp thoại khi bấm ra ngoài vùng nội dung.
  const dialogs = document.querySelectorAll("dialog.form-dialog");

  const dismiss = dialog => {
    if (dialog.dispatchEvent(new Event("cancel", {
      cancelable: true
    })))
      dialog.close();
  };

  dialogs.forEach(dialog => {
    const outside = event => {
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    };

    let startedOutside = false;

    dialog.addEventListener("pointerdown", event => {
      startedOutside = outside(event);
    });

    dialog.addEventListener("click", event => {
      if (startedOutside && outside(event))
        dismiss(dialog);

      startedOutside = false;
    });
  });
})();
