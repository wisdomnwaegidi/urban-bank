// Old toast helper
function toast(message, type = "info") {
  const toast = document.getElementById("layouttoast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `layouttoast show ${type}`;

  setTimeout(() => {
    toast.className = "layouttoast";
  }, 3000);
}

module.exports = { toast };
