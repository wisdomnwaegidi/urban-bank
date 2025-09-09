function showToast(message, type = "SUCCESS") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;

  toast.classList.remove("toast-success", "toast-error", "hidden");

  if (type === "SUCCESS") {
    toast.classList.add("toast-success");
  } else {
    toast.classList.add("toast-error");
  }

  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
    toast.classList.add("hidden");
  }, 5000);
}
