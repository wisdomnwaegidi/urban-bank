document.addEventListener("DOMContentLoaded", () => {
  // Handle any security form (password or pin)
  document.querySelectorAll(".security-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const actionUrl = form.getAttribute("action");

      const button = form.querySelector("button[type='submit']");
      const originalText = button.textContent;
      button.textContent = "Saving...";
      button.disabled = true;

      try {
        const response = await fetch(actionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          showToast(result.message || "Update successful", "success");
          form.reset();
        } else {
          showToast(result.message || "Update failed", "error");
        }
      } catch (err) {
        console.error("Update error:", err);
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  });

  // Toggle password/PIN visibility
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (targetInput.type === "password") {
        targetInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        targetInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  // Toast function
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
