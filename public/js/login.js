document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const rememberMeInput = loginForm.querySelector('input[type="checkbox"]');
  const submitBtn = loginForm.querySelector("button[type='submit']");

  // Regex for validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validation helper
  const validateInput = (input, regex = null) => {
    let isValid = true;
    if (input.value.trim() === "") {
      isValid = false;
    } else if (regex && !regex.test(input.value.trim())) {
      isValid = false;
    }
    return isValid;
  };

  // Form submission handler
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const isEmailValid = validateInput(emailInput, emailRegex);
    const isPasswordValid = validateInput(passwordInput);

    if (isEmailValid && isPasswordValid) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Please wait...";

      try {
        const formData = {
          email: emailInput.value.trim(),
          password: passwordInput.value.trim(),
          rememberMe: rememberMeInput.checked,
        };

        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || "Login failed", "error");
        } else {
          showToast("Login successful", "success");
          loginForm.reset();
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        }
      } catch (error) {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Log in";
      }
    }
  });

  // Toast function
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
