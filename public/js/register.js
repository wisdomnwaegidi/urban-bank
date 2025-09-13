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
      showToast("Passwords do not match", "error");
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
          showToast(data.message || "Registration failed", "error");
        } else {
          // ✅ DON'T redirect to dashboard - user needs approval first
          showToast(
            data.message ||
              "Registration successful! Please wait for admin approval.",
            "success"
          );
          registerForm.reset();

          // ✅ Show a pending approval message instead
          setTimeout(() => {
            showPendingApprovalMessage();
          }, 2000);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Create Account";
      }
    }
  });

  // ✅ Show pending approval message
  function showPendingApprovalMessage() {
    // Create or show a pending approval section
    const pendingDiv = document.createElement("div");
    pendingDiv.className = "pending-approval-message";
    pendingDiv.innerHTML = `
    <div style="
      width: 600px;
      margin: 50px auto;
      padding: 40px;
      border-radius: 16px;
      background: var(--bg_othe_1);
      border: 1px solid var(--border_color);
      font-family: var(--font_family_1);
      text-align: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    ">
      <h3 style="
        color: var(--text_green);
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 25px;
      ">
        Registration Successful!
      </h3>
      <p style="
        color: var(--text_paragraph_color);
        font-size: 1rem;
        line-height: 1.7;
        margin-bottom: 35px;
      ">
        Your account is pending admin approval. You will receive a notification once your account is approved.
         Thank you for your patience.
      </p>
      <a href="/login"
         style="
           display: inline-block;
           padding: 12px 30px;
           border-radius: 8px;
           font-weight: 600;
           color: var(--text_white);
           background: var(--bg_gradient);
           text-decoration: none;
           transition: all 0.3s ease;
           color: black;
         "
         onmouseover="this.style.background='var(--bg_gradient_hover)'; this.style.transform='scale(1.05)';"
         onmouseout="this.style.background='var(--bg_gradient)'; this.style.transform='scale(1)';">
        Go to Login Page
      </a>
    </div>
  `;

    // Replace the form with the pending message
    registerForm.parentNode.insertBefore(pendingDiv, registerForm);
    registerForm.style.display = "none";
  }

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
