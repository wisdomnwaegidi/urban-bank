document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".transfer-form");
  const accountBalanceEl = document.getElementById("accountBalance");
  const submitBtn = form?.querySelector(".btn-transfer");
  const modal = document.getElementById("beneficiaryModal");

  if (!form) return;

  // --------------------------
  // Handle Transfer Submit
  // --------------------------
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
      // Disable button during request
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

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

        // Reset charges display
        const chargesEl = document.getElementById("charges");
        if (chargesEl) chargesEl.textContent = "Charges: $7";

        // ✅ Refresh beneficiaries immediately if backend returned them
        if (result.beneficiaries) {
          refreshBeneficiaries(result.beneficiaries);
        }
      } else {
        showToast(result.message || "Transfer failed", "error");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Transfer";
      }
    }
  });

  // --------------------------
  // Toast Notification
  // --------------------------
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

  // --------------------------
  // Beneficiary Modal Selection
  // --------------------------
  function attachBeneficiaryClickHandlers() {
    document
      .querySelectorAll("#beneficiaryModal li[data-valid='true']")
      .forEach((li) => {
        li.addEventListener("click", function () {
          document.querySelector("input[name='beneficiaryName']").value =
            this.dataset.name;
          document.querySelector("input[name='beneficiaryAccount']").value =
            this.dataset.account;
          document.querySelector("input[name='beneficiaryBank']").value =
            this.dataset.bank;
          modal.style.display = "none";
        });
      });
  }

  // --------------------------
  // Refresh Beneficiaries (no reload)
  // --------------------------
  function refreshBeneficiaries(beneficiaries) {
    const list = modal.querySelector("ul");
    list.innerHTML = "";

    if (beneficiaries.length > 0) {
      beneficiaries.forEach((b) => {
        const li = document.createElement("li");
        li.dataset.valid = "true";
        li.dataset.name = b.name;
        li.dataset.account = b.accountNumber;
        li.dataset.bank = b.bank;
        li.textContent = `${b.name} - ${b.accountNumber} (${b.bank})`;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No saved beneficiaries";
      list.appendChild(li);
    }

    attachBeneficiaryClickHandlers();
  }

  // Initial bind for beneficiaries rendered by EJS
  attachBeneficiaryClickHandlers();
});
