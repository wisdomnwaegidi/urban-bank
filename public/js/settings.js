document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settingsForm");

  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const theme = document.getElementById("themeSelect").value;
      const language = document.getElementById("languageSelect").value;

      // Example: Apply theme immediately
      document.body.className = theme;

      // Show toast
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = `Settings saved: ${theme} theme, ${language} language`;
        toast.className = "toast show success";
        setTimeout(() => (toast.className = "toast"), 3000);
      }

      // TODO: Send updated settings to backend via fetch/axios
    });
  }
});
