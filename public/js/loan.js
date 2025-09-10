document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".loan-form");
    
    console.log(showToast)

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Loan application submitted successfully!", "SUCCESS");
        form.reset();
      } else {
        showToast(
          `${result.message || "Failed to submit application"}`,
          "ERROR"
        );
      }
    } catch (err) {
      console.error("Loan submission error:", err);
      showToast("Something went wrong. Please try again.", "ERROR");
    }
  });
});
