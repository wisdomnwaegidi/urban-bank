async function loadRecentTransactions() {
  try {
    const res = await fetch("/api/recent-transactions");
    const data = await res.json();
    const tbody = document.querySelector(".table tbody");
    tbody.innerHTML = "";

    if (data.transactions && data.transactions.length) {
      data.transactions.forEach((tx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.user.account}</td>
          <td>${
            tx.debit
              ? "-" + tx.debit.toLocaleString()
              : "+" + tx.credit.toLocaleString()
          }</td>
          <td>${tx.debit ? "Debit" : "Credit"}</td>
          <td>${new Date(tx.date).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="4">No recent transactions</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadRecentTransactions);
