async function fetchMarketData() {
  try {
    const res = await fetch("/api/market");
    const data = await res.json();

    // Update ticker
    const tickerDiv = document.getElementById("marketTicker");
    tickerDiv.innerHTML = data.tickers
      .map((t) => `<span>${t.name}: ${t.value || "--"}</span>`)
      .join("");

    // Update indices
    const indicesDiv = document.getElementById("indices");
    indicesDiv.innerHTML = data.indices
      .map((i) => `<p>${i.label}: ${i.value || "--"}</p>`)
      .join("");
  } catch (err) {
    console.error("Error fetching market data", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // Fetch immediately and refresh every 60 seconds
  fetchMarketData();
  setInterval(fetchMarketData, 60000);
});
