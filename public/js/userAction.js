// Profile dropdown toggle
function attachProfileListeners() {
  const profile = document.querySelector(".profile");
  const profileBtn = document.getElementById("profileBtn");

  if (!profile || !profileBtn) return;

  // Toggle profile menu
  profileBtn.addEventListener("click", () => {
    const expanded = profileBtn.getAttribute("aria-expanded") === "true";
    profileBtn.setAttribute("aria-expanded", String(!expanded));
    profile.classList.toggle("open");
  });

  // Close menu if clicked outside
  document.addEventListener("click", (e) => {
    if (!profile.contains(e.target) && e.target !== profileBtn) {
      profile.classList.remove("open");
      profileBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// Logout handler
function attachLogoutListener() {
  const logoutBtn = document.getElementById("logout");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Client-side toast
    showToast("Logging out…", "info");

    // Redirect to backend logout route
    window.location.href = "/logout";
  });
}

// Toast helper
function showToast(message, type = "info") {
  const toast = document.getElementById("layouttoast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `layouttoast show ${type}`;

  setTimeout(() => {
    toast.className = "layouttoast";
  }, 3000);
}

// CLICK-ONLY Sidebar submenu toggle
function attachSubmenuListeners() {
  // Clear any stuck states on page load
  document.querySelectorAll(".has-submenu").forEach(function (submenu) {
    submenu.classList.remove("open");
  });

  // Handle parent menu link clicks (prevent navigation and toggle submenu)
  document
    .querySelectorAll('.has-submenu > .nav-link[href="#"]')
    .forEach(function (parentLink) {
      parentLink.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const submenu = parentLink.closest(".has-submenu");
        const isCurrentlyOpen = submenu.classList.contains("open");

        // Close all other submenus first
        document.querySelectorAll(".has-submenu").forEach(function (other) {
          other.classList.remove("open");
        });

        // Toggle current submenu (open if it was closed, close if it was open)
        if (!isCurrentlyOpen) {
          submenu.classList.add("open");
        }
      });
    });

  // REMOVED: Mouse enter/leave handlers - no more hover behavior

  // Close all submenus when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-submenu")) {
      document.querySelectorAll(".has-submenu").forEach(function (submenu) {
        submenu.classList.remove("open");
      });
    }
  });

  // Handle submenu link clicks (allow normal navigation)
  document.querySelectorAll(".submenu-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      // Allow normal navigation for submenu items
      // Close all submenus after clicking a link
      setTimeout(function () {
        document.querySelectorAll(".has-submenu").forEach(function (submenu) {
          submenu.classList.remove("open");
        });
      }, 100);
    });
  });
}

// Handle active navigation states
function setActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");
  const submenuLinks = document.querySelectorAll(".submenu-link");

  // Clear all active states first
  navLinks.forEach((link) => link.classList.remove("active"));
  submenuLinks.forEach((link) => link.classList.remove("active"));

  // Remove has-active-child class from all submenus
  document.querySelectorAll(".has-submenu").forEach((submenu) => {
    submenu.classList.remove("has-active-child");
  });

  // Set active state for main nav links
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href !== "#" && href === currentPath) {
      link.classList.add("active");

      // If this is a parent of a submenu, mark it as having an active child
      const parentSubmenu = link.closest(".has-submenu");
      if (parentSubmenu) {
        parentSubmenu.classList.add("has-active-child");
      }
    }
  });

  // Set active state for submenu links
  submenuLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href === currentPath) {
      link.classList.add("active");

      // Mark parent submenu as having active child
      const parentSubmenu = link.closest(".has-submenu");
      if (parentSubmenu) {
        parentSubmenu.classList.add("has-active-child");
        const parentLink = parentSubmenu.querySelector(".nav-link");
        if (parentLink) {
          parentLink.classList.add("active");
        }
      }
    }
  });
}

// Mobile menu toggle
function attachMobileMenuListener() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");

  if (!menuToggle || !sidebar) return;

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove("open");
      }
    }
  });
}

// Search functionality
function attachSearchListener() {
  const searchForm = document.querySelector(".search");
  const searchInput = document.getElementById("globalSearch");

  if (!searchForm || !searchInput) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query) {
      console.log("Searching for:", query);
      showToast(`Searching for: ${query}`, "info");

      // Example: redirect to search results page
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    } else {
      showToast("Please enter a search query", "info");
    }
  });
}

// Initialize notification system
function initNotifications() {
  const notifyBtn = document.getElementById("notifyBtn");

  if (!notifyBtn) return;

  notifyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Notification button clicked");
    showToast("Notifications feature coming soon", "info");
  });
}

// Handle window resize for mobile responsiveness
function handleResize() {
  const sidebar = document.querySelector(".sidebar");

  if (window.innerWidth > 1024) {
    // Desktop - make sure sidebar is visible
    sidebar.classList.remove("open");
  }
}

// Keyboard shortcuts
function attachKeyboardListeners() {
  document.addEventListener("keydown", function (e) {
    // ESC key - close all dropdowns and submenus
    if (e.key === "Escape") {
      // Close profile dropdown
      const profile = document.querySelector(".profile");
      if (profile) {
        profile.classList.remove("open");
        const profileBtn = document.getElementById("profileBtn");
        if (profileBtn) {
          profileBtn.setAttribute("aria-expanded", "false");
        }
      }

      // Close all submenus
      document.querySelectorAll(".has-submenu").forEach(function (submenu) {
        submenu.classList.remove("open");
      });

      // Close mobile sidebar
      const sidebar = document.querySelector(".sidebar");
      if (sidebar && window.innerWidth <= 1024) {
        sidebar.classList.remove("open");
      }
    }

    // Ctrl/Cmd + K - focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("globalSearch");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });
}

// Support Modal Logic
const openSupport = document.getElementById("openSupport");
const supportModal = document.getElementById("supportModal");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");

openSupport.addEventListener("click", () => {
  supportModal.style.display = "block";
  supportModal.setAttribute("aria-hidden", "false");
});

closeModal.addEventListener("click", () => {
  supportModal.style.display = "none";
  supportModal.setAttribute("aria-hidden", "true");
});

modalOverlay.addEventListener("click", () => {
  supportModal.style.display = "none";
  supportModal.setAttribute("aria-hidden", "true");
});

// Optional: Handle form submission
document.getElementById("supportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Support request submitted!"); // Replace with actual submission logic
  supportModal.style.display = "none";
});

// Attach all listeners when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  attachProfileListeners();
  attachLogoutListener();
  attachSubmenuListeners();
  attachMobileMenuListener();
  attachSearchListener();
  attachKeyboardListeners();
  initNotifications();
  setActiveNav();

  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Handle window resize
  window.addEventListener("resize", handleResize);

  // Initial resize check
  handleResize();
});
