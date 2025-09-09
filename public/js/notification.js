// public/js/notifications.js
class NotificationManager {
  constructor() {
    this.socket = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.isConnected = false;

    this.initializeSocket();
    this.initializeUI();
    this.loadNotifications();
  }

  // Initialize Socket.IO connection
  initializeSocket() {
    const token = this.getAuthToken();
    if (!token) return;

    this.socket = io({
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("Connected to notification server");
      this.isConnected = true;
      this.updateConnectionStatus(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      this.isConnected = false;
      this.updateConnectionStatus(false);
    });

    // Listen for new notifications
    this.socket.on("new_notification", (notification) => {
      this.handleNewNotification(notification);
    });
  }

  // Get auth token from localStorage or cookie
  getAuthToken() {
    // Implement based on how you store your JWT token
    return (
      localStorage.getItem("authToken") ||
      document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      )
    );
  }

  // Initialize notification UI
  initializeUI() {
    // Create notification dropdown if it doesn't exist
    this.createNotificationDropdown();

    // Add click handlers
    const notifyBtn = document.getElementById("notifyBtn");
    const notificationDropdown = document.getElementById(
      "notificationDropdown"
    );

    if (notifyBtn) {
      notifyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNotificationDropdown();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (notificationDropdown && !notificationDropdown.contains(e.target)) {
        notificationDropdown.style.display = "none";
      }
    });
  }

  // Create notification dropdown HTML
  createNotificationDropdown() {
    const existingDropdown = document.getElementById("notificationDropdown");
    if (existingDropdown) return;

    const notifyBtn = document.getElementById("notifyBtn");
    if (!notifyBtn) return;

    const dropdown = document.createElement("div");
    dropdown.id = "notificationDropdown";
    dropdown.className = "notification-dropdown";
    dropdown.innerHTML = `
      <div class="notification-header">
        <h3>Notifications</h3>
        <button id="markAllRead" class="mark-all-read">Mark all as read</button>
      </div>
      <div class="notification-list" id="notificationList">
        <div class="loading">Loading notifications...</div>
      </div>
      <div class="notification-footer">
        <a href="/notifications">View all notifications</a>
      </div>
    `;

    // Insert dropdown after the notify button
    notifyBtn.parentNode.appendChild(dropdown);

    // Add click handler for mark all as read
    document.getElementById("markAllRead").addEventListener("click", () => {
      this.markAllAsRead();
    });
  }

  // Handle new real-time notification
  handleNewNotification(notification) {
    // Add to local notifications array
    this.notifications.unshift(notification);
    this.unreadCount++;

    // Update UI
    this.updateNotificationBadge();
    this.updateNotificationList();

    // Show toast notification
    this.showToastNotification(notification);

    // Play notification sound for withdrawals
    if (notification.type === "withdrawal") {
      this.playNotificationSound();
    }
  }

  // Load notifications from server
  async loadNotifications() {
    try {
      const response = await fetch("/api/notifications?limit=10", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        this.notifications = result.data.notifications;
        this.unreadCount = result.data.unreadCount;

        this.updateNotificationBadge();
        this.updateNotificationList();
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }

  // Update notification badge
  updateNotificationBadge() {
    const badge = document.querySelector("#notifyBtn .dot");
    const notifyBtn = document.getElementById("notifyBtn");

    if (this.unreadCount > 0) {
      if (badge) {
        badge.style.display = "block";
        badge.textContent = this.unreadCount > 99 ? "99+" : this.unreadCount;
      }
      if (notifyBtn) {
        notifyBtn.classList.add("has-notifications");
      }
    } else {
      if (badge) {
        badge.style.display = "none";
      }
      if (notifyBtn) {
        notifyBtn.classList.remove("has-notifications");
      }
    }
  }

  // Update notification list in dropdown
  updateNotificationList() {
    const listContainer = document.getElementById("notificationList");
    if (!listContainer) return;

    if (this.notifications.length === 0) {
      listContainer.innerHTML =
        '<div class="no-notifications">No notifications yet</div>';
      return;
    }

    const notificationHTML = this.notifications
      .slice(0, 10)
      .map((notification) => {
        const timeAgo = this.getTimeAgo(new Date(notification.timestamp));
        const severityClass = `notification-${notification.severity}`;
        const unreadClass = !notification.isRead ? "unread" : "";

        return `
        <div class="notification-item ${severityClass} ${unreadClass}" 
             data-id="${notification.id}"
             onclick="notificationManager.markAsRead('${notification.id}')">
          <div class="notification-icon">
            ${this.getNotificationIcon(
              notification.type,
              notification.severity
            )}
          </div>
          <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            ${
              notification.amount
                ? `<div class="notification-amount">$${notification.amount.toLocaleString()}</div>`
                : ""
            }
            <div class="notification-time">${timeAgo}</div>
          </div>
          ${!notification.isRead ? '<div class="unread-indicator"></div>' : ""}
        </div>
      `;
      })
      .join("");

    listContainer.innerHTML = notificationHTML;
  }

  // Get notification icon based on type and severity
  getNotificationIcon(type, severity) {
    const icons = {
      withdrawal: severity === "error" ? "⚠️" : "💳",
      deposit: "💰",
      transfer: "🔄",
      payment: "💳",
      security: "🔒",
      general: "ℹ️",
    };

    return icons[type] || "ℹ️";
  }

  // Show toast notification
  showToastNotification(notification) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    const severityClass = `toast-${notification.severity}`;

    toast.innerHTML = `
      <div class="toast-content ${severityClass}">
        <div class="toast-icon">${this.getNotificationIcon(
          notification.type,
          notification.severity
        )}</div>
        <div class="toast-text">
          <div class="toast-title">${notification.title}</div>
          <div class="toast-message">${notification.message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
    `;

    toast.style.display = "block";
    toast.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.style.display = "none";
      }, 300);
    }, 5000);
  }

  // Play notification sound
  playNotificationSound() {
    // Create and play notification sound
    const audio = new Audio("/audio/notification.mp3"); // Add notification sound file
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Could not play notification sound"));
  }

  // Toggle notification dropdown
  toggleNotificationDropdown() {
    const dropdown = document.getElementById("notificationDropdown");
    if (!dropdown) return;

    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      // Refresh notifications when opening dropdown
      this.loadNotifications();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (response.ok) {
        // Update local notification
        const notification = this.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);

          this.updateNotificationBadge();
          this.updateNotificationList();
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        // Update local notifications
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;

        this.updateNotificationBadge();
        this.updateNotificationList();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  // Update connection status indicator
  updateConnectionStatus(isConnected) {
    const notifyBtn = document.getElementById("notifyBtn");
    if (notifyBtn) {
      if (isConnected) {
        notifyBtn.classList.remove("disconnected");
        notifyBtn.title = "Notifications (Connected)";
      } else {
        notifyBtn.classList.add("disconnected");
        notifyBtn.title = "Notifications (Disconnected)";
      }
    }
  }

  // Get relative time ago
  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }
}

// Initialize notification manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.notificationManager = new NotificationManager();
});

// ===========================
// CSS Styles for Notifications
// ===========================

const notificationCSS = `
/* Notification Dropdown */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 400px;
  max-height: 600px;
  z-index: 1000;
  display: none;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.mark-all-read {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f8ff;
  border-left: 3px solid #007bff;
}

.notification-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.notification-amount {
  font-weight: 600;
  font-size: 14px;
  color: #dc3545;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #007bff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
  margin-left: 8px;
}

.notification-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.notification-footer a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.notification-footer a:hover {
  text-decoration: underline;
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: none;
}

.toast.show {
  display: block;
  animation: slideInRight 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-left: 4px solid #007bff;
  max-width: 400px;
}

.toast-content.toast-warning {
  border-left-color: #ffc107;
}

.toast-content.toast-error {
  border-left-color: #dc3545;
}

.toast-content.toast-success {
  border-left-color: #28a745;
}

.toast-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #666;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  margin-left: 8px;
}

.toast-close:hover {
  color: #666;
}

/* Notification Button States */
#notifyBtn {
  position: relative;
}

#notifyBtn .dot {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

#notifyBtn.disconnected {
  opacity: 0.6;
}

#notifyBtn.has-notifications {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Loading and No Notifications States */
.loading, .no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-style: italic;
}

/* Notification Severity Colors */
.notification-warning .notification-icon {
  color: #ffc107;
}

.notification-error .notification-icon {
  color: #dc3545;
}

.notification-success .notification-icon {
  color: #28a745;
}

.notification-info .notification-icon {
  color: #17a2b8;
}
`;

// Inject CSS
const style = document.createElement("style");
style.textContent = notificationCSS;
document.head.appendChild(style);
