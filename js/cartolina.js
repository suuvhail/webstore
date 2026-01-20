let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  const cartCountElements = document.querySelectorAll(".cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCountElements.forEach((element) => {
    element.textContent = totalItems;
    element.style.display = totalItems > 0 ? "block" : "none";
  });
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartTotalElement = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="text-muted text-center mt-5">Your bag is empty.</p>';
    cartTotalElement.textContent = "0 €";
    return;
  }

  let total = 0;
  let cartHTML = "";

  cart.forEach((item) => {
    const itemTotal = item.prix * item.quantity;
    total += itemTotal;

    cartHTML += `
                <div class="cart-item mb-3 pb-3 border-bottom" data-product-id="${item.id}">
                    <div class="d-flex gap-3">
                        <div style="width: 80px; height: 80px; flex-shrink: 0;">
                            <img src="${item.images[0]}" 
                                 alt="${item.title}" 
                                 class="w-100 h-100 object-fit-cover">
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <h6 class="mb-0 small text-uppercase" style="max-width: 70%;">${item.title}</h6>
                                <button class="btn btn-link text-danger p-0 remove-item-btn" 
                                        data-product-id="${item.id}">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                            <p class="small text-muted mb-1">${item.category} • ${item.wOrm === "M" ? "Men" : "Women"}</p>
                            <p class="fw-bold mb-2">${item.prix} €</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-outline-dark btn-sm decrease-qty" 
                                            data-product-id="${item.id}" 
                                            ${item.quantity <= 1 ? "disabled" : ""}>
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <span class="mx-2">${item.quantity}</span>
                                    <button class="btn btn-outline-dark btn-sm increase-qty" 
                                            data-product-id="${item.id}">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                                <span class="fw-bold">${itemTotal.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
  });

  cartItemsContainer.innerHTML = cartHTML;
  cartTotalElement.textContent = `${total.toFixed(2)} €`;
}

function updateQuantity(productId, change) {
  const itemIndex = cart.findIndex((item) => item.id == productId);

  if (itemIndex >= 0) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function removeItem(productId) {
  cart = cart.filter((item) => item.id != productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

document.addEventListener("click", function (event) {
  if (event.target.closest(".decrease-qty")) {
    const button = event.target.closest(".decrease-qty");
    const productId = parseInt(button.getAttribute("data-product-id"));
    updateQuantity(productId, -1);
  }

  if (event.target.closest(".increase-qty")) {
    const button = event.target.closest(".increase-qty");
    const productId = parseInt(button.getAttribute("data-product-id"));
    updateQuantity(productId, 1);
  }

  if (event.target.closest(".remove-item-btn")) {
    const button = event.target.closest(".remove-item-btn");
    const productId = parseInt(button.getAttribute("data-product-id"));
    removeItem(productId);
  }
});

document.getElementById("checkoutBtn")?.addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Your cart is empty. Add some products first.");
    return;
  }
  window.location.href = "checkout.html";
});

document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  renderCart();

  const cartOffcanvas = document.getElementById("cartOffcanvas");
  if (cartOffcanvas) {
    cartOffcanvas.addEventListener("show.bs.offcanvas", function () {
      renderCart();
    });
  }

  document.querySelectorAll(".btn-outline-light").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "Shop.html";
    });
  });

  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "Shop.html";
    });
  });
});
