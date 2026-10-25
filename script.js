

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
    id: "nova-hoodie",
    name: "NOVA Unisex Hoodie",
    description: "A premium everyday streetwear essential",
    price: 64.50,
    tag: "NOVA ORIGINAL",
    image: "https://nova-ship.github.io/NOVA-BRAND/photos/fronthoodie.png",
    backImage: "https://nova-ship.github.io/NOVA-BRAND/photos/backhoodie.png"
  },
  {
    id: "nova-tee",
    name: "NOVA Mountain Tee",
    description: "An oversized streetwear essential",
    price: 64.50,
    tag: "NOVA ORIGINAL",
    image: "https://nova-ship.github.io/NOVA-BRAND/photos/novafront.png.png",
    backImage: "https://nova-ship.github.io/NOVA-BRAND/photos/novaback.png.png"
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

        <img class="product-photo"
          src="${product.image}"
          alt="${product.name} - front"
          loading="lazy"
          data-product-image="${product.id}">

        ${product.backImage ? `
          <div class="photo-switch">
            <button type="button" data-view="front"
              data-product="${product.id}" aria-pressed="true">
              Front
            </button>
            <button type="button" data-view="back"
              data-product="${product.id}" aria-pressed="false">
              Back
            </button>
          </div>
        ` : ""}

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

const preview = document.createElement("div");
preview.id = "product-preview";
preview.className = "product-preview";
preview.setAttribute("aria-hidden", "true");

preview.innerHTML = `
  <div class="preview-backdrop" data-preview-close></div>
  <div class="preview-panel" role="dialog" aria-modal="true">
    <button class="preview-close" data-preview-close>×</button>
    <img class="preview-image" src="" alt="">
    <h2 class="preview-title"></h2>
    <p class="preview-description"></p>
    <p class="preview-price"></p>
    <button data-preview-view="front">Front</button>
    <button data-preview-view="back">Back</button>
    <button class="preview-add" data-preview-add>ADD TO BAG</button>
  </div>
`;

document.body.appendChild(preview);

function openProductPreview(product) {
  if (!product.backImage) return;
  preview.querySelector(".preview-title").textContent = product.name;
  preview.querySelector(".preview-description").textContent = product.description;
  preview.querySelector(".preview-price").textContent = money(product.price);
  preview.querySelector(".preview-image").src = product.image;
  preview.querySelector(".preview-image").alt = product.name;
  preview.querySelector("[data-preview-add]").dataset.previewAdd = product.id;
  preview.classList.add("open");
  preview.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProductPreview() {
  preview.classList.remove("open");
  preview.setAttribute("aria-hidden", "true");
  if (!$("#cart-drawer").classList.contains("open")) {
    document.body.style.overflow = "";
  }
}
document.addEventListener("click", event => {
    const previewOpen = event.target.closest("[data-preview-open]");

  if (previewOpen) {
    const product = products.find(
      item => item.id === previewOpen.dataset.previewOpen
    );
    if (product) openProductPreview(product);
  }

  if (event.target.closest("[data-preview-close]")) {
    closeProductPreview();
  }

  const previewView = event.target.closest("[data-preview-view]");

  if (previewView) {
    const productName =
      preview.querySelector(".preview-title").textContent;

    const product = products.find(item => item.name === productName);

    if (product) {
      const showBack = previewView.dataset.previewView === "back";
      const image = preview.querySelector(".preview-image");

      image.src = showBack ? product.backImage : product.image;
      image.alt = product.name + (showBack ? " - back" : " - front");
    }
  }
    const previewAdd = event.target.closest("[data-preview-add]");

  if (previewAdd) {
    addToCart(previewAdd.dataset.previewAdd);
    closeProductPreview();
  }
  const viewButton = event.target.closest("[data-view]");

  if (viewButton) {
    const product = products.find(
      item => item.id === viewButton.dataset.product
    );

    if (product) {
      const showBack = viewButton.dataset.view === "back";
      
      const image = document.querySelector(
        `[data-product-image="${product.id}"]`
      );


      if (image) {
        image.src = showBack ? product.backImage : product.image;
        image.alt = `${product.name} - ${showBack ? "back" : "front"}`;
      }

      document.querySelectorAll(
        `[data-product="${product.id}"][data-view]`
      ).forEach(button => {
        button.setAttribute(
          "aria-pressed",
          String(button === viewButton)
        );
      });
    }
  }

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
      event.target.closest("#cart-backdrop")) {
    closeCart();
  }

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
