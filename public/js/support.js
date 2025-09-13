document.addEventListener("DOMContentLoaded", () => {
  const supportForm = document.getElementById("supportForm");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const closeModalBtn = document.getElementById("closeModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const supportModal = document.getElementById("supportModal");

  if (!supportForm || !toast || !toastMessage) return;

  // Close modal handlers
  closeModalBtn?.addEventListener("click", () => {
    supportModal.classList.remove("show");
  });
  modalOverlay?.addEventListener("click", () => {
    supportModal.classList.remove("show");
  });

  // Form submit
  supportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const issue = supportForm.issue.value.trim();
    const email = supportForm.email.value.trim();

    if (!issue || !email) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const formData = { issue, email };

    try {
      const res = await fetch("/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(result.message || "Support request submitted", "success");
        supportForm.reset();
        supportModal.classList.remove("show"); // optional: close modal
      } else {
        showToast(result.message || "Failed to submit", "error");
      }
    } catch (err) {
      console.error("Support request error:", err);
      showToast(err.message || "Something went wrong", "error");
    }
  });

  // Toast function
  function showToast(message, type) {
    toastMessage.textContent = message;
    toast.className = `toast ${
      type === "success" ? "toast-success" : "toast-error"
    } show`;
    toast.style.display = "block";

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.style.display = "none";
      }, 300);
    }, 4000);
  }
});
