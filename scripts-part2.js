function renderReviews() {
  const list = document.getElementById("reviewsList");
  if (!list) return;
  const reviews = JSON.parse(localStorage.getItem("tussar_reviews") || "[]");
  list.innerHTML = "";
  reviews.forEach((r) => {
    const box = document.createElement("div");
    box.className = "review-box";
    const p = document.createElement("p");
    p.textContent = '"' + r.text + '"';
    const strong = document.createElement("strong");
    strong.textContent = "- " + r.name;
    const date = document.createElement("div");
    date.className = "review-date";
    date.textContent = new Date(r.date).toLocaleString();
    box.appendChild(p);
    box.appendChild(strong);
    box.appendChild(date);
    list.appendChild(box);
  });
}
function submitReview() {
  const text = document.getElementById("newReviewText").value.trim();
  const name = (document.getElementById("reviewerName").value || "Anonymous").trim();
  if (!text) {
    alert("Please write a short review.");
    return;
  }
  const reviews = JSON.parse(localStorage.getItem("tussar_reviews") || "[]");
  reviews.unshift({ text, name, date: Date.now() });
  localStorage.setItem("tussar_reviews", JSON.stringify(reviews));
  document.getElementById("newReviewText").value = "";
  document.getElementById("reviewerName").value = "";
  renderReviews();
}
document.addEventListener("DOMContentLoaded", function () {
  let overlay = document.getElementById("modalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    document.body.appendChild(overlay);
  }
  overlay.addEventListener("click", closeOrderModal);
  if (document.getElementById("productSelect")) initializeBookingPage();
  if (document.getElementById("inlineProduct") && document.getElementById("mProduct")) {
    initializeOrderCalculators();
  }
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      bookingForm.reset();
      initializeBookingPage();
      showSuccessPopup("orderSuccess");
    });
  }
  const inlineForm = document.getElementById("inlineOrder");
  if (inlineForm) {
    inlineForm.addEventListener("submit", function (e) {
      e.preventDefault();
      inlineForm.reset();
      initializeOrderCalculators();
      showSuccessPopup("successMessage");
    });
  }
  const modalForm = document.getElementById("modalOrderForm");
  if (modalForm) {
    modalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      modalForm.reset();
      initializeOrderCalculators();
      showSuccessPopup("successMessage");
      closeOrderModal();
    });
  }
  const openModalBtn = document.getElementById("openModalFromInline");
  if (openModalBtn) {
    openModalBtn.addEventListener("click", function () {
      openOrderModal("");
    });
  }
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  [modalClose, modalCancel].forEach((btn) => {
    if (btn) btn.addEventListener("click", closeOrderModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOrderModal();
  });
  const toggleBtn = document.getElementById("mobileMenuToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      document.querySelector(".nav-links").classList.toggle("active");
    });
  }
  renderReviews();
});