
const products = [
  {
    id: "daily-bottle",
    name: "Daily Form Bottle",
    description: "A considered everyday carry",
    price: 29.00,
    tag: "THE EVERYDAY",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop"
  },
  {
    id: "soft-glow",
    name: "Soft Glow Lamp",
    description: "Warm light, simple form",
    price: 49.00,
    tag: "DESIGN PICK",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop"
  },
  {
    id: "utility-pouch",
    name: "Utility Pouch",
    description: "Keep the small things together",
    price: 24.00,
    tag: "DAILY ESSENTIAL",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop"
  },
  {
    id: "nova-tee",
    name: "NOVA Mountain Tee",
    description: "An oversized streetwear essential",
    price: 64.50,
    tag: "NOVA ORIGINAL",
    image: "photos/novafront.png"
  }
];

const cart = new Map();
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD"
}).format(amount);

function renderProducts() {
  $("#product-grid").innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-visual">
        <span class="product-tag">${product.tag}</span>
        <img class="product-photo" src="${product.image}"
          alt="${product.name}" loading="lazy">
        <button class="quick-add" data-add="${product.id}"
          aria-label="Add ${product.name} to bag">+</button>
      </div>
      <div class="product-info">
        <div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        </div>
        <span class="price">${money(product.price)}</span>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const current = cart.get(id);
  cart.set(id, {
    product,
    quantity: (current?.quantity || 0) + 1
  });
  renderCart();
  showToast(`${product.name} added to your bag`);
}

function changeQuantity(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart.delete(id);
  renderCart();
}

function renderCart() {
  const entries = [...cart.values()];
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = entries.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#cart-subtotal").textContent = money(subtotal);

  if (!entries.length) {
    $("#cart-items").innerHTML =
      '<p class="empty-cart">Your bag is waiting for something good.</p>';
    return;
  }

  $("#cart-items").innerHTML = entries.map(({ product, quantity }) => `
    <div class="cart-row">
      <div>
        <strong>${product.name}</strong>
        <p>${money(product.price)} each</p>
        <div class="quantity-controls">
          <button data-quantity="${product.id}" data-delta="-1"
            aria-label="Remove one ${product.name}">−</button>
          <span>${quantity}</span>
          <button data-quantity="${product.id}" data-delta="1"
            aria-label="Add one ${product.name}">+</button>
          <button class="remove-item" data-remove="${product.id}">
            Remove
          </button>
        </div>
      </div>
      <strong>${money(product.price * quantity)}</strong>
    </div>
  `).join("");
}

function openCart() {
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  $("#cart-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  $("#cart-backdrop").hidden = true;
  document.body.style.overflow = "";
}

let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const quantity = event.target.closest("[data-quantity]");
  if (quantity) {
    changeQuantity(quantity.dataset.quantity, Number(quantity.dataset.delta));
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    cart.delete(remove.dataset.remove);
    renderCart();
  }

  if (event.target.closest("#cart-toggle")) openCart();
  if (event.target.closest("#cart-close") ||
      event.target.closest("#cart-backdrop")) closeCart();

  if (event.target.closest("#checkout-button")) {
    showToast("Demo only — secure checkout is not connected yet.");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
