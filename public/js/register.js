document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const firstNameInput = registerForm.querySelector(
    'input[placeholder="First Name"]'
  );
  const lastNameInput = registerForm.querySelector(
    'input[placeholder="Last Name"]'
  );
  const emailInput = registerForm.querySelector('input[type="email"]');
  const phoneInput = registerForm.querySelector('input[placeholder="Phone"]');
  const passwordInput = registerForm.querySelectorAll(
    'input[type="password"]'
  )[0];
  const confirmPasswordInput = registerForm.querySelectorAll(
    'input[type="password"]'
  )[1];
  const submitBtn = registerForm.querySelector("button[type='submit']");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10,15}$/;

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

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const isFirstNameValid = validateInput(firstNameInput);
    const isLastNameValid = validateInput(lastNameInput);
    const isEmailValid = validateInput(emailInput, emailRegex);
    const isPhoneValid = validateInput(phoneInput, phoneRegex);
    const isPasswordValid = validateInput(passwordInput);
    const isConfirmPasswordValid =
      passwordInput.value === confirmPasswordInput.value;

    if (!isConfirmPasswordValid) {
      confirmPasswordInput.style.border = "1px solid red";
      showToast("Passwords do not match", "ERROR");
      return;
    }

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Please wait...";

      try {
        const formData = {
          firstName: firstNameInput.value.trim(),
          lastName: lastNameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          password: passwordInput.value.trim(),
          confirmPassword: confirmPasswordInput.value.trim(),
        };

        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || "Registration failed", "ERROR");
        } else {
          showToast("Registration successful!", "SUCCESS");
          registerForm.reset();
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("Something went wrong. Please try again.", "ERROR");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Create Account";
      }
    }
  });
});
