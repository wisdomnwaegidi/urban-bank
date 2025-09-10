document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".transfer-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop default reload

    const recipientName = document.getElementById("recipientName").value.trim();
    const iban = document.getElementById("iban").value.trim();
    const swift = document.getElementById("swift").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const description = document.getElementById("description").value.trim();

    try {
      const res = await fetch("/transfers/international", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientName,
          iban,
          swift,
          amount,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Transfer successful!", "success");
        form.reset();
      } else {
        showToast(`${data.message || "Transfer failed"}`, "error");
      }
    } catch (err) {
      console.error("Error submitting transfer:", err);
      showToast("Network error, please try again", "error");
    }
  });

  // Simple toast function
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
