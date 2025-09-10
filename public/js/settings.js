document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settingsForm");

  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const theme = document.getElementById("themeSelect").value;
    const language = document.getElementById("languageSelect").value;

    try {
      const res = await fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, language }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Settings saved successfully!", "success");

        // Apply theme instantly
        document.body.setAttribute("data-theme", theme);

        // (Optional) Trigger language change here
      } else {
        showToast("Failed to save settings: " + data.message, "error");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast("Something went wrong while saving settings.", "error");
    }
  });
  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    // Reset classes
    toast.className = "toast";

    // Apply type-specific class
    if (type === "success") {
      toast.classList.add("toast-success");
    } else if (type === "error") {
      toast.classList.add("toast-error");
    }

    // Set message
    toastMessage.textContent = message;

    // Show toast
    toast.style.display = "block";

    // Auto-hide after 4s
    setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }
});
