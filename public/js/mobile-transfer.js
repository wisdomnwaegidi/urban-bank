document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".transfer-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const description = document.getElementById("description").value.trim();

    try {
      const res = await fetch("/transfers/mobile-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, amount, description }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Deposit successful!", "success");
        form.reset();
      } else {
        showToast(data.message || "Deposit failed!", "error");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      showToast("An error occurred. Please try again.", "error");
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
