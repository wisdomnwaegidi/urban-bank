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
