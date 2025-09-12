function generateCardNumber() {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

function generateCVV() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

function generateExpiry() {
  const month = String(Math.floor(Math.random() * 12 + 1)).padStart(2, "0");
  const year = String(new Date().getFullYear() + 3).slice(2); // 3 years expiry
  return `${month}/${year}`;
}

module.exports = { generateCardNumber, generateCVV, generateExpiry };
