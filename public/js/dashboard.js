document.addEventListener("DOMContentLoaded", () => {
  // Router configuration
  const routes = {
    "/overview": {
      title: "Overview",
      content: `
    <section class="welcome">
      <h1 id="welcomeUser">Welcome User</h1>
      <div class="market-ticker" id="marketTicker"></div>
    </section>

    <section class="grid three" aria-label="Balances and Rates">
      <article class="card">
        <h2>Receive Money</h2>
        <p><strong>Account Name:</strong> <span id="accountName"></span></p>
        <p><strong>Account Number:</strong> <span id="accountNumber"></span></p>
      </article>

      <article class="card">
        <h2>Your Balances:</h2>
        <p><strong>US Dollar</strong></p>
        <p>AVAILABLE BALANCE</p>
        <div class="balance" id="balanceAmount">$0.00</div>
        <p><small>Default</small></p>
      </article>

      <article class="card">
        <h2>Our Rates</h2>
        <p id="ratesText">No Rate Available</p>
      </article>
    </section>

    <section class="card" aria-label="Current Trading Indices">
      <h2>Current Trading Indices</h2>
      <div class="table-wrap">
        <table class="table" id="indicesTable">
          <thead>
            <tr>
              <th>EUR</th>
              <th>USD</th>
              <th>GBP</th>
              <th>CAD</th>
              <th>CNY</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>

    <section class="card" aria-label="Recent Transactions">
      <h2>Recent Transactions</h2>
      <div class="table-wrap">
        <table class="table" id="recentTx">
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  `,
    },
    "/accounts": {
      title: "Accounts",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Accounts</h2>
            <button class="btn btn-ghost" id="btnAddAccount">
              <i class="fa fa-plus"></i> Add Account
            </button>
          </header>
          <ul class="list" id="accountsList" aria-live="polite"></ul>
        </section>
      `,
    },
    "/cards": {
      title: "Cards",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Cards</h2>
            <button class="btn btn-ghost">
              <i class="fa fa-cog"></i> Manage Cards
            </button>
          </header>
          <div class="cards" id="cardsStrip" aria-label="Your cards"></div>
        </section>
      `,
    },
    "/transfers": {
      title: "Transfers",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Transfer Money</h2>
          </header>
          <form id="transferForm" novalidate>
            <label>
              From Account
              <select id="fromAccount" required></select>
            </label>
            <label>
              To (Account No. / Beneficiary)
              <input type="text" id="toAccount" placeholder="0123456789 or Jane Doe" required />
            </label>
            <label>
              Amount (₦)
              <input type="number" id="amount" min="1" step="0.01" required />
            </label>
            <label>
              Narration
              <input type="text" id="narration" placeholder="e.g., Rent, Groceries" />
            </label>
            <div class="form__row">
              <button type="submit" class="btn" id="transferBtn">Send</button>
              <button type="button" class="btn btn-outline" id="saveBeneficiary">Save Beneficiary</button>
            </div>
            <p class="form__hint">Instant inter-bank transfers supported.</p>
          </form>
        </section>
      `,
    },
    "/bills": {
      title: "Bills",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Pay Bills</h2>
          </header>
          <form id="billsForm" novalidate>
            <label>
              Biller
              <select id="biller" required>
                <option value="">Select</option>
                <option value="power">Electricity (PHCN)</option>
                <option value="data">Data/Internet</option>
                <option value="tv">Cable TV</option>
                <option value="water">Water</option>
              </select>
            </label>
            <label>
              Customer ID
              <input type="text" id="customerId" placeholder="Meter/Smartcard/Account" required />
            </label>
            <label>
              Amount (₦)
              <input type="number" id="billAmount" min="1" step="0.01" required />
            </label>
            <div class="form__row">
              <button type="submit" class="btn">Pay</button>
              <button type="button" class="btn btn-outline" id="saveBiller">Save Biller</button>
            </div>
          </form>
        </section>
      `,
    },
    "/analytics": {
      title: "Analytics",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Analytics</h2>
          </header>
          <div>
            <p>View your financial analytics and trends:</p>
            <ul>
              <li>Spending by Category</li>
              <li>Income vs Expenses</li>
              <li>Monthly Trends</li>
            </ul>
            <div id="analyticsChart" style="height: 300px;">
              <!-- Placeholder for chart -->
              <p>Chart placeholder: Spending trends</p>
            </div>
          </div>
        </section>
      `,
    },
    "/security": {
      title: "Security",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Security</h2>
          </header>
          <div>
            <p>Manage your account security settings:</p>
            <form id="securityForm" novalidate>
              <label>
                Current Password
                <input type="password" id="currentPassword" required />
              </label>
              <label>
                New Password
                <input type="password" id="newPassword" required />
              </label>
              <label>
                Two-Factor Authentication
                <input type="checkbox" id="twoFactor" />
              </label>
              <button type="submit" class="btn">Update Security</button>
            </form>
            <p><a href="#" id="viewLoginActivity">View Recent Login Activity</a></p>
          </div>
        </section>
      `,
    },
    "/settings": {
      title: "Settings",
      content: `
        <section class="card">
          <header class="card__head">
            <h2>Settings</h2>
          </header>
          <div>
            <p>Customize your dashboard preferences:</p>
            <form id="settingsForm" novalidate>
              <label>Theme:
                <select id="themeSelect">
                  <option value="light">Light</option>
                  <option value="dark" selected>Dark</option>
                </select>
              </label>
              <label>Language:
                <select id="languageSelect">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
              <button type="submit" class="btn">Save Settings</button>
            </form>
          </div>
        </section>
      `,
    },
  };

  // State management
  const state = {
    kpis: {
      total: 2450000.23,
      income: 820000.0,
      expense: 530000.55,
      score: 742,
      tMoM: 3.8,
      iMoM: 6.2,
      eMoM: 2.1,
    },
    accounts: [
      {
        id: "001",
        name: "Main Naira Account",
        number: "0123456789",
        balance: 1540000.12,
      },
      {
        id: "002",
        name: "Savings Vault",
        number: "2223334445",
        balance: 680000.11,
      },
      {
        id: "003",
        name: "Dollar Domiciliary",
        number: "5566778899",
        balance: 930.45,
        currency: "USD",
      },
    ],
    cards: [
      {
        brand: "VISA",
        last4: "4321",
        holder: "JOHN DOE",
        exp: "07/28",
        type: "Debit",
      },
      {
        brand: "Mastercard",
        last4: "8899",
        holder: "JOHN DOE",
        exp: "11/27",
        type: "Credit",
      },
    ],
    transactions: [
      {
        date: "2025-08-12",
        name: "Uber Trip",
        type: "Debit",
        amount: -4200.0,
        status: "Successful",
        ref: "TX-18KD7",
      },
      {
        date: "2025-08-11",
        name: "Salary",
        type: "Credit",
        amount: 800000.0,
        status: "Successful",
        ref: "TX-99YH2",
      },
      {
        date: "2025-08-10",
        name: "PHCN Ikeja",
        type: "Debit",
        amount: -18500.0,
        status: "Successful",
        ref: "TX-55ZQ1",
      },
      {
        date: "2025-08-10",
        name: "Netflix",
        type: "Debit",
        amount: -2900.0,
        status: "Pending",
        ref: "TX-31AB9",
      },
      {
        date: "2025-08-08",
        name: "Transfer from Ada",
        type: "Credit",
        amount: 15000.0,
        status: "Successful",
        ref: "TX-20PL3",
      },
    ],
    goals: [
      { title: "Laptop Fund", target: 1200000, saved: 480000 },
      { title: "Vacation", target: 900000, saved: 300000 },
    ],
    budgets: [
      { title: "Food & Groceries", limit: 200000, spent: 120000 },
      { title: "Transport", limit: 60000, spent: 38000 },
      { title: "Subscriptions", limit: 30000, spent: 18000 },
    ],
    settings: {
      theme: "dark",
      language: "en",
    },
  };

  // Format helpers
  const fmt = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });
  const el = (sel) => document.querySelector(sel);

  // Toast helper
  const toast = (msg, type = "info") => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = `toast ${type}`; // Add type for styling (success, error, etc.)
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2600);
  };

  // Navigation handler
  const navigateTo = (path) => {
    // Normalize path (fix typo in /accounnts)
    if (path === "/accounnts") path = "/accounts";

    const route = routes[path] || routes["/overview"];
    const contentEl = document.getElementById("content");

    // Smooth transition
    contentEl.style.opacity = "0";
    setTimeout(() => {
      contentEl.innerHTML = route.content;
      document.title = `Union Ledger - ${route.title}`;
      history.pushState({ path }, route.title, path);

      // Re-render dynamic content and attach listeners
      if (path === "/overview") {
        setKpis();
        renderAccounts();
        renderCards();
        renderTx(
          doSort(filterTx(state.transactions), currentSort.key, currentSort.dir)
        );
        renderGoals();
        renderBudgets();
        attachFormListeners();
        attachTableListeners();
      } else if (path === "/accounts") {
        renderAccounts();
        attachAddAccountListener();
      } else if (path === "/cards") {
        renderCards();
      } else if (path === "/transfers") {
        renderAccounts();
        attachFormListeners();
      } else if (path === "/bills") {
        attachFormListeners();
      } else if (path === "/security") {
        attachSecurityFormListener();
      } else if (path === "/settings") {
        attachSettingsFormListener();
      }

      contentEl.style.opacity = "1";

      // Update active nav link
      document.querySelectorAll(".nav-link").forEach((link) => {
        const href =
          link.getAttribute("href") === "/accounnts"
            ? "/accounts"
            : link.getAttribute("href");
        link.classList.toggle("active", href === path);
      });
    }, 200);
  };

  // Handle sidebar link clicks
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path =
        link.getAttribute("href") === "/accounnts"
          ? "/accounts"
          : link.getAttribute("href");
      navigateTo(path);
    });
  });

  // Handle support button
  const openSupportBtn = document.getElementById("openSupport");
  if (openSupportBtn) {
    openSupportBtn.addEventListener("click", () => {
      const content = `
        <section class="card">
          <header class="card__head">
            <h2>Support</h2>
          </header>
          <div>
            <p>Need help? Contact our support team:</p>
            <form id="supportForm" novalidate>
              <label>Subject:
                <input type="text" name="subject" required />
              </label>
              <label>Message:
                <textarea name="message" rows="4" required></textarea>
              </label>
              <button class="btn" type="submit">Send</button>
            </form>
          </div>
        </section>
      `;
      document.getElementById("content").innerHTML = content;
      document.title = "Union Ledger - Support";
      const supportForm = document.querySelector("#supportForm");
      if (supportForm) {
        supportForm.addEventListener("submit", (e) => {
          e.preventDefault();
          toast("Support request sent!", "success");
        });
      }
    });
  }

  // Handle browser back/forward
  window.addEventListener("popstate", (e) => {
    navigateTo(e.state?.path || "/overview");
  });

  // KPIs
  const setKpis = () => {
    if (el("#kpiTotal"))
      el("#kpiTotal").textContent = fmt.format(state.kpis.total);
    if (el("#kpiIncome"))
      el("#kpiIncome").textContent = fmt.format(state.kpis.income);
    if (el("#kpiExpense"))
      el("#kpiExpense").textContent = fmt.format(state.kpis.expense);
    if (el("#kpiScore")) el("#kpiScore").textContent = state.kpis.score;
    if (el("#kpiTrend"))
      el("#kpiTrend").textContent = `+${state.kpis.tMoM}% MoM`;
    if (el("#kpiIncomeTrend"))
      el("#kpiIncomeTrend").textContent = `+${state.kpis.iMoM}%`;
    if (el("#kpiExpenseTrend"))
      el("#kpiExpenseTrend").textContent = `${state.kpis.eMoM}%`;
  };

  // Accounts
  const accountsList = () => document.getElementById("accountsList");
  const fromAccount = () => document.getElementById("fromAccount");
  const renderAccounts = () => {
    if (!accountsList() || !fromAccount()) return;
    accountsList().innerHTML = "";
    fromAccount().innerHTML = '<option value="">Select</option>';
    state.accounts.forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div><strong>${a.name}</strong></div>
          <div class="muted">${a.number}${
        a.currency ? ` • ${a.currency}` : ""
      }</div>
        </div>
        <div><strong>${
          a.currency === "USD"
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(a.balance)
            : fmt.format(a.balance)
        }</strong></div>
      `;
      accountsList().appendChild(li);

      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = `${a.name} (${a.number.slice(-4)})`;
      fromAccount().appendChild(opt);
    });
  };

  // Add Account Listener
  const attachAddAccountListener = () => {
    const addAccountBtn = document.getElementById("btnAddAccount");
    if (addAccountBtn) {
      addAccountBtn.addEventListener("click", () => {
        toast("Account addition initiated. Please contact support.", "info");
      });
    }
  };

  // Cards
  const cardsStrip = () => document.getElementById("cardsStrip");
  const renderCards = () => {
    if (!cardsStrip()) return;
    cardsStrip().innerHTML = "";
    state.cards.forEach((c) => {
      const wrap = document.createElement("div");
      wrap.className = "card-visual";
      wrap.innerHTML = `
        <div class="row">
          <strong>${c.brand}</strong>
          <span>${c.type}</span>
        </div>
        <div class="digits">**** **** **** ${c.last4}</div>
        <div class="row">
          <span>${c.holder}</span>
          <span>${c.exp}</span>
        </div>
      `;
      cardsStrip().appendChild(wrap);
    });
  };

  // Transactions
  let currentSort = { key: "date", dir: "desc" };
  const txTable = () =>
    document.getElementById("txTable")?.querySelector("tbody");
  const renderTx = (rows) => {
    if (!txTable()) return;
    txTable().innerHTML = "";
    rows.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(t.date).toLocaleDateString()}</td>
        <td>${t.name}</td>
        <td>${t.type}</td>
        <td class="right">${
          (t.amount < 0 ? "-" : "") + fmt.format(Math.abs(t.amount))
        }</td>
        <td>${t.status}</td>
        <td>${t.ref}</td>
      `;
      txTable().appendChild(tr);
    });
  };

  // Sort & filter
  const doSort = (data, key, dir) => {
    const d = [...data];
    d.sort((a, b) => {
      let va = a[key],
        vb = b[key];
      if (key === "date") {
        va = new Date(a.date).getTime();
        vb = new Date(b.date).getTime();
      }
      if (key === "amount") {
        va = a.amount;
        vb = b.amount;
      }
      return va < vb
        ? dir === "asc"
          ? -1
          : 1
        : va > vb
        ? dir === "asc"
          ? 1
          : -1
        : 0;
    });
    return d;
  };

  const filterTx = (rows) => {
    const term = (document.getElementById("txSearch")?.value || "")
      .toLowerCase()
      .trim();
    const range = parseInt(
      document.getElementById("txRange")?.value || "30",
      10
    );
    const cutoff = Date.now() - range * 86400000;
    return rows.filter((t) => {
      const okDate = new Date(t.date).getTime() >= cutoff;
      const okTerm =
        !term ||
        t.name.toLowerCase().includes(term) ||
        t.ref.toLowerCase().includes(term);
      return okDate && okTerm;
    });
  };

  const attachTableListeners = () => {
    document.querySelectorAll("#txTable thead th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        currentSort.dir =
          currentSort.key === key && currentSort.dir === "asc" ? "desc" : "asc";
        currentSort.key = key;
        renderTx(doSort(filterTx(state.transactions), key, currentSort.dir));
      });
    });
    document.getElementById("txSearch")?.addEventListener("input", () => {
      renderTx(
        doSort(filterTx(state.transactions), currentSort.key, currentSort.dir)
      );
    });
    document.getElementById("txRange")?.addEventListener("change", () => {
      renderTx(
        doSort(filterTx(state.transactions), currentSort.key, currentSort.dir)
      );
    });
  };

  // Goals & budgets
  const goalsList = () => document.getElementById("goalsList");
  const budgetList = () => document.getElementById("budgetList");
  const renderGoals = () => {
    if (!goalsList()) return;
    goalsList().innerHTML = "";
    state.goals.forEach((g) => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      const li = document.createElement("li");
      li.className = "goal";
      li.innerHTML = `
        <div class="row">
          <strong>${g.title}</strong>
          <span>${pct}%</span>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <div class="muted">${fmt.format(g.saved)} / ${fmt.format(
        g.target
      )}</div>
      `;
      goalsList().appendChild(li);
    });
  };
  const renderBudgets = () => {
    if (!budgetList()) return;
    budgetList().innerHTML = "";
    state.budgets.forEach((b) => {
      const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
      const li = document.createElement("li");
      li.className = "budget";
      li.innerHTML = `
        <div class="row">
          <strong>${b.title}</strong>
          <span>${fmt.format(b.spent)} / ${fmt.format(b.limit)}</span>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
      `;
      budgetList().appendChild(li);
    });
  };

  // Form listeners
  const attachFormListeners = () => {
    const transferForm = document.getElementById("transferForm");
    if (transferForm) {
      transferForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const from = document.getElementById("fromAccount").value.trim();
        const to = document.getElementById("toAccount").value.trim();
        const amount = parseFloat(document.getElementById("amount").value);
        const narration = document.getElementById("narration").value.trim();

        if (!from || !to || !(amount > 0)) {
          toast("Please complete the transfer form correctly.", "error");
          return;
        }

        try {
          el("#transferBtn").disabled = true;
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          state.transactions.unshift({
            date: new Date().toISOString().slice(0, 10),
            name: `Transfer to ${to}`,
            type: "Debit",
            amount: -amount,
            status: "Successful",
            ref: "TX-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
          });
          toast("Transfer successful ✔", "success");
          renderTx(
            doSort(
              filterTx(state.transactions),
              currentSort.key,
              currentSort.dir
            )
          );
          transferForm.reset();
        } catch (err) {
          console.error(err);
          toast("Transfer failed. Please try again.", "error");
        } finally {
          el("#transferBtn").disabled = false;
        }
      });
    }

    const billsForm = document.getElementById("billsForm");
    if (billsForm) {
      billsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const biller = document.getElementById("biller").value.trim();
        const customerId = document.getElementById("customerId").value.trim();
        const billAmount = parseFloat(
          document.getElementById("billAmount").value
        );
        if (!biller || !customerId || !(billAmount > 0)) {
          toast("Please complete the bill form correctly.", "error");
          return;
        }
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          state.transactions.unshift({
            date: new Date().toISOString().slice(0, 10),
            name: `Bill: ${biller.toUpperCase()}`,
            type: "Debit",
            amount: -billAmount,
            status: "Successful",
            ref: "BL-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
          });
          toast("Bill paid successfully ✔", "success");
          renderTx(
            doSort(
              filterTx(state.transactions),
              currentSort.key,
              currentSort.dir
            )
          );
          billsForm.reset();
        } catch (err) {
          toast("Payment failed. Try again.", "error");
        }
      });
    }

    document
      .getElementById("saveBeneficiary")
      ?.addEventListener("click", () => {
        toast("Beneficiary saved ✔", "success");
      });
    document.getElementById("saveBiller")?.addEventListener("click", () => {
      toast("Biller saved ✔", "success");
    });
  };

  // Security form listener
  const attachSecurityFormListener = () => {
    const securityForm = document.getElementById("securityForm");
    if (securityForm) {
      securityForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentPassword =
          document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const twoFactor = document.getElementById("twoFactor").checked;

        if (!currentPassword || !newPassword) {
          toast("Please fill in all password fields.", "error");
          return;
        }

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast(
            `Security settings updated. 2FA: ${
              twoFactor ? "Enabled" : "Disabled"
            }`,
            "success"
          );
          securityForm.reset();
        } catch (err) {
          toast("Failed to update security settings.", "error");
        }
      });
    }

    document
      .getElementById("viewLoginActivity")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        toast("Login activity view not implemented yet.", "info");
      });
  };

  // Settings form listener
  const attachSettingsFormListener = () => {
    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
      // Set initial values
      document.getElementById("themeSelect").value = state.settings.theme;
      document.getElementById("languageSelect").value = state.settings.language;

      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const theme = document.getElementById("themeSelect").value;
        const language = document.getElementById("languageSelect").value;
        state.settings.theme = theme;
        state.settings.language = language;
        document.body.className = theme;
        toast(
          `Settings saved: ${theme} theme, ${language} language`,
          "success"
        );
      });
    }
  };

  // Other UI interactions
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const sidebar = document.querySelector(".sidebar");
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  const profile = document.querySelector(".profile");
  const profileBtn = document.getElementById("profileBtn");
  profileBtn?.addEventListener("click", () => {
    const expanded = profileBtn.getAttribute("aria-expanded") === "true";
    profileBtn.setAttribute("aria-expanded", String(!expanded));
    profile?.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!profile?.contains(e.target)) {
      profile?.classList.remove("open");
      profileBtn?.setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("globalSearch")?.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Global search not implemented yet.", "info");
  });
  document.getElementById("notifyBtn")?.addEventListener("click", () => {
    toast("No new notifications", "info");
  });

  // Keyboard accessibility
  document
    .querySelectorAll("a, button, input, select, textarea")
    .forEach((el) => {
      el.setAttribute("tabindex", el.tabIndex || 0);
    });

  // Initial render
  navigateTo(window.location.pathname || "/overview");

  // Update CSS for toast types
  const style = document.createElement("style");
  style.textContent = `
    .toast.success { background: #2d3d3d; border-color: #64dcb6; }
    .toast.error { background: #3d2d2d; border-color: #ff9b9b; }
    .toast.info { background: var(--bg_othe_1); border-color: var(--border_color); }
  `;
  document.head.appendChild(style);

  // Apply initial theme
  document.body.className = state.settings.theme;
});
