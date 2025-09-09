document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordForm = document.getElementById("forgotPassword");

  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = forgotPasswordForm.querySelector("input[type='email']").value;

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          data.message || "Password reset link sent to your email!",
          "SUCCESS"
        );
        forgotPasswordForm.reset();
      } else {
        showToast(data.message || "Something went wrong!", "ERROR");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(
        "Failed to connect to server. Please try again later.",
        "ERROR"
      );
    }
  });
});
