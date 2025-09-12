const supportForm = document.getElementById("supportForm");

supportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    issue: supportForm.issue.value.trim(),
    email: supportForm.email.value.trim(),
  };

  try {
    const res = await fetch("/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (res.ok) {
      showToast("Support request submitted successfully!", "success");
      supportForm.reset(); // ✅ was `form.reset()`, should be `supportForm.reset()`
    } else {
      showToast("Error: " + result.message, "error");
    }
  } catch (err) {
    console.error("Support request error:", err);
    showToast("Something went wrong. Please try again.", "error");
  }
});

function showToast(message, type) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.className = "toast"; // reset
  toast.classList.add(type === "success" ? "toast-success" : "toast-error");
  toast.classList.remove("hidden");
  toast.style.display = "block";

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
      toast.style.display = "none";
    }, 300);
  }, 4000);
}
