const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// helper functions
async function fetchForexRate(from, to) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: from,
      to_currency: to,
      apikey: API_KEY,
    },
  });
  return (
    res.data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || null
  );
}

async function fetchCryptoPrice(symbol) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: symbol,
      to_currency: "USD",
      apikey: API_KEY,
    },
  });
  return (
    res.data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || null
  );
}

async function fetchStockIndex(symbol) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "GLOBAL_QUOTE",
      symbol,
      apikey: API_KEY,
    },
  });
  return res.data["Global Quote"]?.["05. price"] || null;
}

// GET /api/market
router.get("/market", async (req, res) => {
  try {
    const tickers = [
      { name: "EUR/USD", value: await fetchForexRate("EUR", "USD") },
      { name: "BTC/USD", value: await fetchCryptoPrice("BTC") },
      { name: "ETH/USD", value: await fetchCryptoPrice("ETH") },
    ];

    const indices = [
      { label: "S&P 500", value: await fetchStockIndex("SPY") },
      { label: "Dow Jones", value: await fetchStockIndex("^DJI") },
      { label: "NASDAQ", value: await fetchStockIndex("^IXIC") },
    ];

    res.json({ tickers, indices });
  } catch (err) {
    console.error("Market API error:", err.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

module.exports = router;
