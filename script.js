
// NOVA SUPPLY demo storefront. No real payments or orders are processed.

const SITE_PHOTO = "https://nova-ship.github.io/NOVA-BRAND/photos/";

const products = [
{
  id: "nova-cap",
  name: "NOVA Signature Cap",
  description: "A considered essential for everyday wear",
  price: 39.95,
  tag: "THE EVERYDAY",
  image: "photos/Capfront.png"
},
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
    price: 84.95,
    tag: "NOVA ORIGINAL",
    image: SITE_PHOTO + "fronthoodie.png",
    backImage: SITE_PHOTO + "backhoodie.png"
  },
  {
    id: "nova-tee",
    name: "NOVA Mountain Tee",
    description: "An oversized streetwear essential",
    price: 89.95,
    tag: "NOVA ORIGINAL",
    image: SITE_PHOTO + "novafront.png.png",
    backImage: SITE_PHOTO + "novaback.png.png"
  },
  {
    id: "nova-pants",
    name: "NOVA Pants",
    description: "A relaxed streetwear essential",
    price: 79.95,
    tag: "NOVA ORIGINAL",
    variants: [
      {
        id: "white",
        name: "White",
        image: SITE_PHOTO + "whitepantsfront.png",
        backImage: SITE_PHOTO + "whitepantsback.png"
      },
      {
        id: "black",
        name: "Black",
        image: SITE_PHOTO + "blackpantsfront.png",
        backImage: SITE_PHOTO + "blackpantsback.png"
      }
    ]
  }
];

const cart = new Map();
const $ = (selector) => document.querySelector(selector);
let toastTimer;
let previewProductId = null;
let previewVariantId = "white";
let previewView = "front";

const money = (amount) => new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD"
}).format(amount);

function getVariant(product, variantId) {
  return product.variants?.find(variant => variant.id === variantId)
    || product.variants?.[0]
    || null;
}

function getProductImage(product, view = "front", variantId = null) {
  const variant = getVariant(product, variantId);
  const front = variant ? variant.image : product.image;
  const back = variant ? variant.backImage : product.backImage;
  return view === "back" && back ? back : front;
}

function renderProducts() {
  const grid = $("#product-grid");
  if (!grid) return;

  grid.innerHTML = products.map(product => {
    const hasVariants = Boolean(product.variants?.length);
    const firstVariant = getVariant(product, product.variants?.[0]?.id);
    const image = firstVariant ? firstVariant.image : product.image;

    return `
      <article class="product-card">
        <div class="product-visual">
          <span class="product-tag">${product.tag}</span>
          <img class="product-photo"
            src="${image}"
            alt="${product.name} - front"
            loading="lazy"
            data-product-image="${product.id}"
            data-preview-open="${product.id}">

          ${product.backImage || hasVariants ? `
            <div class="photo-switch">
              <button type="button" data-view="front"
                data-product="${product.id}" aria-pressed="true">Front</button>
              <button type="button" data-view="back"
                data-product="${product.id}" aria-pressed="false">Back</button>
            </div>
          ` : ""}

          ${hasVariants ? `
            <div class="colour-switch">
              ${product.variants.map((variant, index) => `
                <button type="button"
                  data-variant="${variant.id}"
                  data-product="${product.id}"
                  aria-pressed="${index === 0 ? "true" : "false"}">
                  ${variant.name}
                </button>
              `).join("")}
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
    `;
  }).join("");
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

  if ($("#cart-count")) $("#cart-count").textContent = count;
  if ($("#drawer-count")) $("#drawer-count").textContent = `(${count})`;
  if ($("#cart-subtotal")) $("#cart-subtotal").textContent = money(subtotal);

  const cartItems = $("#cart-items");
  if (!cartItems) return;

  if (!entries.length) {
    cartItems.innerHTML =
      '<p class="empty-cart">Your bag is waiting for something good.</p>';
    return;
  }

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <div class="cart-row">
      <div>
        <strong>${product.name}</strong>
        <p>${money(product.price)} each</p>
        <div class="quantity-controls">
          <button data-quantity="${product.id}" data-delta="-1">−</button>
          <span>${quantity}</span>
          <button data-quantity="${product.id}" data-delta="1">+</button>
          <button class="remove-item" data-remove="${product.id}">Remove</button>
        </div>
      </div>
      <strong>${money(product.price * quantity)}</strong>
    </div>
  `).join("");
}

function openCart() {
  $("#cart-drawer")?.classList.add("open");
  $("#cart-drawer")?.setAttribute("aria-hidden", "false");
  if ($("#cart-backdrop")) $("#cart-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cart-drawer")?.classList.remove("open");
  $("#cart-drawer")?.setAttribute("aria-hidden", "true");
  if ($("#cart-backdrop")) $("#cart-backdrop").hidden = true;
  if (!preview.classList.contains("open")) document.body.style.overflow = "";
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
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
    <div class="preview-colours"></div>
    <button type="button" data-preview-view="front">Front</button>
    <button type="button" data-preview-view="back">Back</button>
    <button class="preview-add" data-preview-add>ADD TO BAG</button>
  </div>
`;
document.body.appendChild(preview);

function updatePreviewImage(product) {
  const variant = getVariant(product, previewVariantId);
  const front = variant ? variant.image : product.image;
  const back = variant ? variant.backImage : product.backImage;
  const image = preview.querySelector(".preview-image");
  image.src = previewView === "back" && back ? back : front;
  image.alt = `${product.name} - ${previewView}`;
}

function openProductPreview(product) {
  if (!product.backImage && !product.variants?.length) return;
  previewProductId = product.id;
  previewVariantId = product.variants?.[0]?.id || "";
  previewView = "front";

  preview.querySelector(".preview-title").textContent = product.name;
  preview.querySelector(".preview-description").textContent = product.description;
  preview.querySelector(".preview-price").textContent = money(product.price);
  preview.querySelector("[data-preview-add]").dataset.previewAdd = product.id;

  preview.querySelector(".preview-colours").innerHTML =
    (product.variants || []).map((variant, index) => `
      <button type="button" data-preview-variant="${variant.id}"
        aria-pressed="${index === 0 ? "true" : "false"}">${variant.name}</button>
    `).join("");

  updatePreviewImage(product);
  preview.classList.add("open");
  preview.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProductPreview() {
  preview.classList.remove("open");
  preview.setAttribute("aria-hidden", "true");
  if (!$("#cart-drawer")?.classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

document.addEventListener("click", event => {
  const previewOpen = event.target.closest("[data-preview-open]");
  if (previewOpen) {
    const product = products.find(item => item.id === previewOpen.dataset.previewOpen);
    if (product) openProductPreview(product);
  }

  if (event.target.closest("[data-preview-close]")) closeProductPreview();

  const previewViewButton = event.target.closest("[data-preview-view]");
  if (previewViewButton && previewProductId) {
    const product = products.find(item => item.id === previewProductId);
    if (product) {
      previewView = previewViewButton.dataset.previewView;
      updatePreviewImage(product);
    }
  }

  const previewVariantButton = event.target.closest("[data-preview-variant]");
  if (previewVariantButton && previewProductId) {
    previewVariantId = previewVariantButton.dataset.previewVariant;
    const product = products.find(item => item.id === previewProductId);
    if (product) updatePreviewImage(product);
    preview.querySelectorAll("[data-preview-variant]").forEach(button => {
      button.setAttribute("aria-pressed", String(button === previewVariantButton));
    });
  }

  const previewAdd = event.target.closest("[data-preview-add]");
  if (previewAdd) {
    addToCart(previewAdd.dataset.previewAdd);
    closeProductPreview();
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    const product = products.find(item => item.id === viewButton.dataset.product);
    if (product) {
      const selectedVariant = document.querySelector(
        `[data-product="${product.id}"][data-variant][aria-pressed="true"]`
      );
      const variantId = selectedVariant?.dataset.variant || product.variants?.[0]?.id;
      const showBack = viewButton.dataset.view === "back";
      const image = document.querySelector(`[data-product-image="${product.id}"]`);
      if (image) {
        image.src = getProductImage(product, showBack ? "back" : "front", variantId);
        image.alt = `${product.name} - ${showBack ? "back" : "front"}`;
      }
      document.querySelectorAll(`[data-product="${product.id}"][data-view]`).forEach(button => {
        button.setAttribute("aria-pressed", String(button === viewButton));
      });
    }
  }

  const variantButton = event.target.closest("[data-variant]");
  if (variantButton) {
    const product = products.find(item => item.id === variantButton.dataset.product);
    if (product) {
      const selectedView = document.querySelector(
        `[data-product="${product.id}"][data-view][aria-pressed="true"]`
      )?.dataset.view || "front";
      const image = document.querySelector(`[data-product-image="${product.id}"]`);
      if (image) {
        image.src = getProductImage(product, selectedView, variantButton.dataset.variant);
        image.alt = `${product.name} - ${variantButton.textContent.trim()} - ${selectedView}`;
      }
      document.querySelectorAll(`[data-product="${product.id}"][data-variant]`).forEach(button => {
        button.setAttribute("aria-pressed", String(button === variantButton));
      });
    }
  }

  const add = event.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const quantity = event.target.closest("[data-quantity]");
  if (quantity) changeQuantity(quantity.dataset.quantity, Number(quantity.dataset.delta));

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    cart.delete(remove.dataset.remove);
    renderCart();
  }

  if (event.target.closest("#cart-toggle")) openCart();

  if (event.target.closest("#cart-close") || event.target.closest("#cart-backdrop")) {
    closeCart();
  }

  if (event.target.closest("#checkout-button")) {
    showToast("Demo only — secure checkout is not connected yet.");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeProductPreview();
  }
});

if ($("#year")) $("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
