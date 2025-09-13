document.addEventListener("DOMContentLoaded", () => {
  const networkSelect = document.getElementById("networkSelect");
  const typeSelect = document.getElementById("typeSelect");
  const form = document.getElementById("cardForm");

  const cardPreview = document.getElementById("cardPreview"); // <div class="card" id="cardPreview">
  const cardVisual = cardPreview.querySelector(".card-visual"); // inner visual box
  const previewLogo = document.getElementById("previewLogo");
  const previewType = document.getElementById("previewType");


// get network logo
  function getNetworkLogo(network) {
    switch ((network || "").toLowerCase()) {
      case "mastercard":
        return "/image/mastercard-logo.png";
      case "verve":
        return "/image/verve-logo.png";
      default:
        return "/image/visa-logo.png";
    }
  }

  // get network
  function updatePreview() {
    const network = networkSelect.value;
    const type = typeSelect.value;

    // update text + logo
    previewType.textContent = type;
    previewLogo.src = getNetworkLogo(network);
    previewLogo.alt = network;

    // Remove old network classes from the parent .card (important)
    cardPreview.classList.remove("visa", "mastercard", "verve");

    // Add new network class on parent .card element
    cardPreview.classList.add(network.toLowerCase());

    // (optional) also keep cardVisual in sync if you used that previously
    cardVisual.classList.remove("visa", "mastercard", "verve");
    cardVisual.classList.add(network.toLowerCase());
  }

  // attach listeners for live preview (no submit required)
  networkSelect.addEventListener("change", updatePreview);
  typeSelect.addEventListener("change", updatePreview);

  // run once on load to set default
  updatePreview();

  // submit form via AJAX
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      network: formData.get("network"),
      type: formData.get("type"),
    };

    try {
      const res = await fetch("/cards/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result);

      if (result.success) {
        console.log(
          showToast(
            "Card application successful! Pending admin approval.",
            "success"
          )
        );
        showToast(
          "Card application successful! Pending admin approval.",
          "success"
        );
      } else {
        showToast("Error: " + result.message, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }
  });

 // Toast function
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
});
