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

  // show tost function
   function showToast(message, type = "SUCCESS") {
     const toast = document.getElementById("toast");
     const toastMessage = document.getElementById("toastMessage");
     if (!toast || !toastMessage) return;

     toastMessage.textContent = message;
     toast.className = "toast";
     toast.classList.add(type === "SUCCESS" ? "toast-success" : "toast-error");
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
   }s
});
