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
    input.style.border = isValid ? "1px solid green" : "1px solid red";
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
          showToast(data.message || "Login failed", "ERROR");
        } else {
          showToast("Login successful", "SUCCESS");
          loginForm.reset();
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        }
      } catch (error) {
        showToast("Something went wrong. Please try again.", "ERROR");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Log in";
      }
    }
  });
});
