document.addEventListener("DOMContentLoaded", () => {
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const passwordInput = resetPasswordForm.querySelector(
    'input[name="password"]'
  );
  const confirmPasswordInput = resetPasswordForm.querySelector(
    'input[name="confirmPassword"]'
  );
  const submitBtn = resetPasswordForm.querySelector("button[type='submit']");

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");

  if (!resetToken) {
    showToast("Invalid or missing reset token", "ERROR");
    resetPasswordForm.querySelectorAll("input, button").forEach((el) => {
      el.disabled = true;
    });
    return;
  }

  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!password || !confirmPassword) {
      showToast("Please fill out all fields", "ERROR");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "ERROR");
      confirmPasswordInput.style.border = "1px solid red";
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Please wait...";

    try {
     const response = await fetch(`/reset-password?token=${resetToken}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ newPassword: password }),
     });

      const data = await response.json();

      if (response.ok) {
        showToast(
          data.message || "Password reset successful! Redirecting...",
          "SUCCESS"
        );
        resetPasswordForm.reset();

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showToast(data.message || "Failed to reset password", "ERROR");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Server error. Please try again later.", "ERROR");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  });
});
