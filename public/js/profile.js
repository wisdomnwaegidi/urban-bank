document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  if (!form) return console.error("Upload form not found");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const actionUrl = form.getAttribute("action");

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Saving...";
    submitButton.disabled = true;

    try {
      const response = await fetch(actionUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "Profile updated successfully", "success");

        if (result.user) {
          // Update form inputs
          Object.keys(result.user).forEach((key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
              if (input.type === "date" && result.user[key]) {
                input.value = new Date(result.user[key])
                  .toISOString()
                  .split("T")[0];
              } else {
                input.value = result.user[key] || "";
              }
            }
          });

          // Update displayed name
          const userNamesElement = document.getElementById("userNames");
          if (
            userNamesElement &&
            result.user.firstName &&
            result.user.lastName
          ) {
            userNamesElement.textContent = `${result.user.firstName} ${result.user.lastName}`;
            userNamesElement.classList.add("updated");
            setTimeout(() => userNamesElement.classList.remove("updated"), 500);
          }

          // Update displayed address
          const userAddressElement = document.getElementById("userAddress");
          if (userAddressElement) {
            userAddressElement.textContent =
              result.user.address || "Address not provided";
            userAddressElement.classList.add("updated");
            setTimeout(
              () => userAddressElement.classList.remove("updated"),
              500
            );
          }
        }
      } else {
        showToast(result.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  // Toast function (keep your existing implementation)
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
