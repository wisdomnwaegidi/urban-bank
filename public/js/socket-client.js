(function () {
  const userId = document.body.getAttribute("data-user-id");
  if (!userId) return;

  const socket = io();
  socket.emit("register", userId);

  const notifBadge = document.getElementById("notifBadge");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifList = document.getElementById("notifList");
  const notifyBtn = document.getElementById("notifyBtn");
  const clearBtn = document.getElementById("clearNotif");

  let notifCount = 0;
  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  // Render notifications
  function renderNotifications() {
    notifList.innerHTML = "";
    notifications.forEach((n) => {
      const li = document.createElement("li");
      li.className = n.read ? "" : "unread";
      li.innerHTML = `
        <strong>${n.type} transfer</strong>: $${n.amount}
        <br/>
        <small>${new Date(n.timestamp).toLocaleString()}</small>
      `;
      notifList.prepend(li);
    });

    notifCount = notifications.filter((n) => !n.read).length;
    if (notifCount > 0) {
      notifBadge.style.display = "inline-block";
      notifBadge.textContent = notifCount;
    } else {
      notifBadge.style.display = "none";
    }
  }

  renderNotifications();

  // Handle incoming notifications
  socket.on("notification", (data) => {
    notifications.push({
      type: data.type,
      amount: data.amount,
      timestamp: data.timestamp,
      read: false,
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));
    renderNotifications();
  });

  // Toggle dropdown when bell clicked
  notifyBtn.addEventListener("click", () => {
    const isVisible = notifDropdown.style.display === "block";
    notifDropdown.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      // mark all as read but DO NOT clear
      notifications = notifications.map((n) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(notifications));
      renderNotifications();
    }
  });

  // Clear all notifications (optional feature)
  clearBtn.addEventListener("click", () => {
    notifications = [];
    localStorage.setItem("notifications", JSON.stringify([]));
    renderNotifications();
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!notifDropdown.contains(e.target) && !notifyBtn.contains(e.target)) {
      notifDropdown.style.display = "none";
    }
  });
})();
