const container = document.getElementById("productsContainer");
let filteredProducts = [...products];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
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

    saveCartToStorage();
    renderCart();
    updateCartCount();
  }
}

function removeItem(productId) {
  cart = cart.filter((item) => item.id != productId);
  saveCartToStorage();
  renderCart();
  updateCartCount();
}

function addToCart(product) {
  const existingItemIndex = cart.findIndex((item) => item.id == product.id);

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      prix: product.prix,
      images: product.images,
      category: product.category,
      wOrm: product.wOrm,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
  }

  saveCartToStorage();
  renderCart();

  showNotification(`${product.title} added to cart!`);

  updateCartCount();
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "position-fixed top-0 end-0 p-3";
  notification.style.zIndex = "1060";
  notification.innerHTML = `
      <div class="toast show" role="alert">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 1500);
}

function updateCartCount() {
  const cartCountElements = document.querySelectorAll(".cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCountElements.forEach((element) => {
    element.textContent = totalItems;
    element.style.display = totalItems > 0 ? "block" : "none";
  });
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

window.clearAllFilters = function () {
  document
    .querySelectorAll('#NomobileFilter input[type="checkbox"]')
    .forEach((input) => {
      input.checked = false;
    });

  document
    .querySelectorAll('#filterOffcanvas input[type="checkbox"]')
    .forEach((input) => {
      input.checked = false;
    });

  filteredProducts = shuffleArray([...products]);
  renderProducts(filteredProducts);
};

function renderProducts(productsList) {
  container.innerHTML = "";

  if (productsList.length === 0) {
    container.innerHTML = `
          <div class="col-12 text-center py-5">
            <p class="text-muted">No products found matching your filters.</p>
            <button class="btn btn-outline-dark" onclick="clearAllFilters()">Clear All Filters</button>
          </div>
        `;
    return;
  }

  productsList.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-lg-4 col-sm-6 col-12 mb-4 product-card";

    col.innerHTML = `
            <div class="card border-0" style="height: 500px; display: flex; flex-direction: column;">
                <div class="position-relative flex-grow-1 overflow-hidden">
                <div class="position-absolute top-0 end-0 p-2 d-flex gap-2 z-1">
                    <button class="btn btn-light btn-sm shadow-sm"><i class="bi bi-heart"></i></button>
                    <button class="btn btn-light btn-sm shadow-sm add-to-cart-btn" data-product-id="${product.id}">
                    <i class="bi bi-bag"></i>
                    </button>
                </div>
                <div style="
                    background-image: url('${product.images[0]}');
                    background-size: cover;
                    background-position: center;
                    width: 100%;
                    height: 100%;
                "></div>
                </div>
                <div class="text-center py-3 bg-white">
                <h6 class="mb-1 text-uppercase small" style="
                    white-space: nowrap; 
                    overflow: hidden; 
                    text-overflow: ellipsis; 
                    display: block;
                    padding: 0 10px;
                ">${product.title}</h6>
                <p class="mb-2 fw-semibold">${product.prix} €</p>
                <a href="product-view.html?id=${product.id}" class="btn btn-outline-dark btn-sm">View</a>
                </div>
            </div>
        `;
    container.appendChild(col);
  });
}

function getActiveFilters() {
  const desktopGenders = Array.from(
    document.querySelectorAll(
      '#NomobileFilter input[id="men"]:checked, #NomobileFilter input[id="women"]:checked',
    ),
  ).map((input) => input.value);

  const desktopCategories = Array.from(
    document.querySelectorAll(
      '#NomobileFilter input[id="shoes"]:checked, #NomobileFilter input[id="bags"]:checked',
    ),
  ).map((input) => input.value.toLowerCase());

  const desktopPrices = Array.from(
    document.querySelectorAll(
      '#NomobileFilter input[value="0-1000"]:checked, #NomobileFilter input[value="1000-2000"]:checked, #NomobileFilter input[value="2000+"]:checked',
    ),
  ).map((input) => input.value);

  const mobileGenders = Array.from(
    document.querySelectorAll(
      '#filterOffcanvas input[id="men-mob"]:checked, #filterOffcanvas input[id="women-mob"]:checked',
    ),
  ).map((input) => input.value);

  const mobileCategories = Array.from(
    document.querySelectorAll(
      '#filterOffcanvas input[id="shoes-mob"]:checked, #filterOffcanvas input[id="bags-mob"]:checked',
    ),
  ).map((input) => input.value.toLowerCase());

  const mobilePrices = Array.from(
    document.querySelectorAll(
      '#filterOffcanvas input[value="0-1000"]:checked, #filterOffcanvas input[value="1000-2000"]:checked, #filterOffcanvas input[value="2000+"]:checked',
    ),
  ).map((input) => input.value);

  let genders = desktopGenders;
  let categories = desktopCategories;
  let prices = desktopPrices;

  if (desktopGenders.length === 0 && mobileGenders.length > 0)
    genders = mobileGenders;
  if (desktopCategories.length === 0 && mobileCategories.length > 0)
    categories = mobileCategories;
  if (desktopPrices.length === 0 && mobilePrices.length > 0)
    prices = mobilePrices;

  return {
    genders: genders,
    categories: categories,
    prices: prices,
  };
}

function matchesPrice(productPrice, priceRanges) {
  if (priceRanges.length === 0) return true;

  return priceRanges.some((range) => {
    if (range === "0-1000") return productPrice <= 1000;
    if (range === "1000-2000")
      return productPrice > 1000 && productPrice <= 2000;
    if (range === "2000+") return productPrice > 2000;
    return false;
  });
}

function applyFilters() {
  const filters = getActiveFilters();

  if (
    filters.genders.length === 0 &&
    filters.categories.length === 0 &&
    filters.prices.length === 0
  ) {
    filteredProducts = shuffleArray([...products]);
    renderProducts(filteredProducts);
    return;
  }

  filteredProducts = products.filter((product) => {
    const matchesGender =
      filters.genders.length === 0 || filters.genders.includes(product.wOrm);

    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(product.category.toLowerCase());

    const matchesPriceFilter = matchesPrice(product.prix, filters.prices);

    return matchesGender && matchesCategory && matchesPriceFilter;
  });

  renderProducts(filteredProducts);
}

function handleDesktopFilter() {
  applyFilters();
}

function handleMobileFilter() {
  applyFilters();

  const offcanvas = bootstrap.Offcanvas.getInstance(
    document.getElementById("filterOffcanvas"),
  );
  if (offcanvas) offcanvas.hide();
}

document.addEventListener("DOMContentLoaded", function () {
  const desktopApplyBtn = document.querySelector("#NomobileFilter .btn-dark");
  if (desktopApplyBtn) {
    desktopApplyBtn.addEventListener("click", handleDesktopFilter);
  }

  const mobileApplyBtn = document.querySelector("#filterOffcanvas .btn-dark");
  if (mobileApplyBtn) {
    mobileApplyBtn.addEventListener("click", handleMobileFilter);
  }
});

filteredProducts = shuffleArray([...products]);
renderProducts(filteredProducts);

document.addEventListener("click", function (event) {
  if (event.target.closest(".add-to-cart-btn")) {
    const button = event.target.closest(".add-to-cart-btn");
    const productId = button.getAttribute("data-product-id");
    const product = products.find((p) => p.id == productId);

    if (product) {
      addToCart(product);

      button.innerHTML = '<i class="bi bi-check"></i>';
      button.classList.add("btn-success");
      button.classList.remove("btn-light");

      setTimeout(() => {
        button.innerHTML = '<i class="bi bi-bag"></i>';
        button.classList.remove("btn-success");
        button.classList.add("btn-light");
      }, 1000);
    }
  }
  if (event.target.closest(".decrease-qty")) {
    const button = event.target.closest(".decrease-qty");
    const productId = button.getAttribute("data-product-id");
    updateQuantity(productId, -1);
  }

  if (event.target.closest(".increase-qty")) {
    const button = event.target.closest(".increase-qty");
    const productId = button.getAttribute("data-product-id");
    updateQuantity(productId, 1);
  }

  if (event.target.closest(".remove-item-btn")) {
    const button = event.target.closest(".remove-item-btn");
    const productId = button.getAttribute("data-product-id");
    removeItem(productId);
  }
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
});

document
  .querySelector("#cartOffcanvas .btn-dark")
  .addEventListener("click", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty. Add some products first.");
      return;
    }

    window.location.href = "checkout.html";
  });
