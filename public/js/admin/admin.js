// public/js/admin/admin.js - External JavaScript file

const socket = io();

// Join admin room for notifications
socket.emit("joinAdmin");

// Track processed users to prevent duplicate actions
const processedUsers = new Set();

// Listen for new registration requests
socket.on("newUserRequest", (user) => {
  console.log("📩 New user registration:", user);

  const tbody = document.querySelector(".admin-table tbody");
  if (!tbody) return;

  // Check if user already exists in the table
  if (document.getElementById(`user-${user.id}`)) {
    console.log("User already in table:", user.id);
    return;
  }

  const row = document.createElement("tr");
  row.id = `user-${user.id}`;
  row.innerHTML = `
    <td>${user.firstName} ${user.lastName}</td>
    <td>${user.email}</td>
    <td>
      <button class="btn-approve" data-userid="${user.id}">
        Approve
      </button>
    </td>
  `;
  tbody.appendChild(row);

  // Show notification
  showNotification(
    `New user registration: ${user.firstName} ${user.lastName}`,
    "info"
  );
});

// Remove row when user is approved by another admin
socket.on("userApproved", ({ userId }) => {
  const row = document.getElementById(`user-${userId}`);
  if (row) {
    row.remove();
    processedUsers.add(userId); // Mark as processed
    console.log("✅ User approved, removed from list:", userId);
  }
});

// Handle approve button clicks with event delegation
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-approve")) {
    const userId = e.target.dataset.userid;

    // Prevent duplicate processing
    if (processedUsers.has(userId)) {
      showNotification("User already processed", "warning");
      return;
    }

    await approveUser(userId);
  }
});

// Approve user function with better error handling
async function approveUser(userId) {
  // Check if element still exists
  const row = document.getElementById(`user-${userId}`);
  if (!row) {
    console.log("User row no longer exists:", userId);
    showNotification("User already processed", "warning");
    return;
  }

  // Disable button to prevent double-clicking
  const button = row.querySelector(".btn-approve");
  if (button) {
    button.disabled = true;
    button.textContent = "Processing...";
  }

  try {
    const res = await fetch(`/admin/approve-user/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(data.message, "success");

      // Mark as processed and remove row
      processedUsers.add(userId);
      if (row && row.parentNode) {
        row.remove();
      }
    } else {
      showNotification("Error: " + data.message, "error");

      // Re-enable button on error
      if (button) {
        button.disabled = false;
        button.textContent = "Approve";
      }
    }
  } catch (error) {
    console.error("Error approving user:", error);
    showNotification("Network error approving user", "error");

    // Re-enable button on error
    if (button) {
      button.disabled = false;
      button.textContent = "Approve";
    }
  }
}

// Load money form handler
const loadMoneyForm = document.getElementById("loadMoneyForm");
if (loadMoneyForm) {
  loadMoneyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      userId: form.userId.value,
      amount: form.amount.value,
      description: form.description.value,
    };

    try {
      const res = await fetch("/admin/load-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      const result = document.getElementById("loadMoneyResult");
      if (result) {
        result.textContent = data.message || "Error";
        result.className = res.ok
          ? "form-message success"
          : "form-message error";
      }

      if (res.ok) {
        form.reset();
        showNotification("Account funded successfully", "success");
      } else {
        showNotification("Error: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error loading money:", error);
      showNotification("Network error", "error");
    }
  });
}

// Notification system
function showNotification(message, type = "info") {
  // Create notification if it doesn't exist
  let notification = document.getElementById("admin-notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "admin-notification";
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(notification);
  }

  // Set message and style based on type
  notification.textContent = message;
  notification.className = `notification notification-${type}`;

  // Set colors based on type
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  notification.style.backgroundColor = colors[type] || colors.info;
  notification.style.display = "block";
  notification.style.opacity = "1";

  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      notification.style.display = "none";
    }, 300);
  }, 4000);
}
