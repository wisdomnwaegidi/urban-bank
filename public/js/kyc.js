document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".kyc-form");

  if (!form) return console.error("KYC form not found");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const actionUrl = form.getAttribute("action");

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;

    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "KYC submitted successfully", "success");
        form.reset();
      } else {
        showToast(result.message || "KYC submission failed", "error");
      }
    } catch (err) {
      console.error("KYC submission error:", err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  function showToast(message, type) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = "toast";
    toast.classList.add(type === "success" ? "toast-success" : "toast-error");
    toast.classList.remove("hidden");
    toast.style.display = "block";

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.classList.add("hidden");
        toast.style.display = "none";
      }, 300);
    }, 4000);
  }
});
