// ===== Setup Live Calculator =====
function setupCalculator(productSelectId, qtyInputId, totalElId, warningElId) {
  const productSelect = document.getElementById(productSelectId);
  const qtyInput = document.getElementById(qtyInputId);
  const totalEl = document.getElementById(totalElId);
  const warningEl = warningElId ? document.getElementById(warningElId) : null;
  if (!productSelect || !qtyInput || !totalEl) return;
  function updateTotal() {
    let price = 0;
    let qty = parseInt(qtyInput.value) || 0;
    if (warningEl) warningEl.textContent = "";
    if (productSelect.value === "1L") price = 20;
    if (productSelect.value === "20L") price = 60;
    if (productSelect.value === "250ML") {
      price = 200;
      if (qty < 2) {
        if (warningEl)
          warningEl.textContent = "Minimum 2 boxes required for 250ML Box.";
        qty = 2;
        qtyInput.value = 2;
      }
    }
    totalEl.textContent = price * qty;
  }
  productSelect.addEventListener("change", updateTotal);
  qtyInput.addEventListener("input", updateTotal);
  updateTotal();
  return updateTotal;
}
function initializeBookingPage() {
  setupCalculator("productSelect","quantity","totalAmount","quantityWarning");
}
function initializeOrderCalculators() {
  setupCalculator("inlineProduct","inlineQty","inlineTotal","inlineMinMsg");
  setupCalculator("mProduct","mQty","priceTotal","minMsg");
}
function openOrderModal(product) {
  const modal = document.getElementById("orderModal");
  const overlay = document.getElementById("modalOverlay");
  const mProduct = document.getElementById("mProduct");
  if (mProduct && product) {
    mProduct.value = product;
    mProduct.dispatchEvent(new Event("change"));
  }
  modal.classList.add("active");
  overlay.classList.add("active");
  document.body.classList.add("modal-open");
  modal.setAttribute("aria-hidden", "false");
}
function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  const overlay = document.getElementById("modalOverlay");
  modal.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("modal-open");
  modal.setAttribute("aria-hidden", "true");
}
function showSuccessPopup(messageId) {
  const popup = document.getElementById(messageId);
  if (popup) popup.style.display = "flex";
}
function closeSuccessMessage() {
  const el = document.getElementById("successMessage");
  if (el) el.style.display = "none";
}
function closeOrderSuccess() {
  const el = document.getElementById("orderSuccess");
  if (el) el.style.display = "none";
}