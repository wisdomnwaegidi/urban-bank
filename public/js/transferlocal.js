document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".transfer-form");
  const accountBalanceEl = document.getElementById("accountBalance");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const amount = parseFloat(data.amount);

    if (!amount || amount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Transfer successful!", "success");

        // Update balance on UI
        if (accountBalanceEl) {
          accountBalanceEl.textContent = `$${result.newBalance.toLocaleString()}`;
        }

        // Reset form
        form.reset();
      } else {
        showToast(result.message || "Transfer failed", "error");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      showToast("Something went wrong. Please try again.", "error");
    }
  });

  // Reuse your global toast function
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
