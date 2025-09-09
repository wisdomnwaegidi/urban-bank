document.addEventListener("DOMContentLoaded", () => {
  // Balance toggle
  const toggleBtn = document.getElementById("toggleBalance");
  const balance = document.getElementById("accountBalance");
  toggleBtn.addEventListener("click", () => {
    if (balance.textContent !== "*****") {
      balance.textContent = "*****";
      toggleBtn.classList.remove("fa-eye");
      toggleBtn.classList.add("fa-eye-slash");
    } else {
      balance.textContent = "$40,000";
      toggleBtn.classList.remove("fa-eye-slash");
      toggleBtn.classList.add("fa-eye");
    }
  });

  // Auto Date
  document.getElementById("transferDate").textContent =
    new Date().toLocaleDateString();

  // Modal
  const modal = document.getElementById("beneficiaryModal");
  const openModal = document.getElementById("findBeneficiary");
  const closeModal = document.getElementById("ModalClose");

  openModal.onclick = () => (modal.style.display = "flex");
  closeModal.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };

  // Charges example calculation
  const amountInput = document.getElementById("amount");
  const chargesText = document.getElementById("charges");
  amountInput.addEventListener("input", () => {
    const amount = parseFloat(amountInput.value) || 0;
    const charge = amount * 0.02; // e.g., 2%
    chargesText.textContent = `Charges: $${charge.toFixed(2)}`;
  });
});
