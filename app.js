/* 
   Campus Exclusive Store JS Logic
   Manages product rendering, filtering, sorting, cart drawer state, 
   product quick-view modals, and simulated checkout sequences.
*/


// --- Product Catalog Database ---
const PRODUCTS = [
  {
    id: 'apex-run',
    name: 'Campus Apex-Run',
    category: 'Running',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.9,
    reviewsCount: 184,
    image: 'run-apex.png',
    description: 'Engineered for high-mileage runs, the Apex-Run features a carbon-fiber reinforced mesh structure and responsive air-cushion sole for ultimate energy return.',
    badge: 'Best Seller',
    colors: ['#FF6B35', '#1E293B', '#00ADB5'],
    sizes: [7, 8, 9, 10, 11]
  },
  {
    id: 'velocity-x',
    name: 'Campus Velocity-X',
    category: 'Running',
    price: 159.99,
    rating: 4.9,
    reviewsCount: 92,
    image: 'run-velocity.png',
    description: 'Designed for lightweight speed, the Velocity-X wraps your foot in a breathable, adaptive mesh with specialized high-grip traction for wet surfaces.',
    badge: 'New Launch',
    colors: ['#00ADB5', '#1E293B', '#FF6B35'],
    sizes: [8, 9, 10, 11]
  },
  {
    id: 'aero-strider',
    name: 'Campus Aero-Strider',
    category: 'Athletic',
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviewsCount: 148,
    image: 'athletic-strider.png',
    description: 'The ultimate cross-trainer. Aero-Strider offers dual-density foam midsoles and a lateral stability wrap to support quick multi-directional movements in the gym or court.',
    badge: '15% OFF',
    colors: ['#00ADB5', '#FF6B35', '#FFFFFF'],
    sizes: [7, 8, 9, 10, 11]
  },
  {
    id: 'trail-blazer',
    name: 'Campus Trail-Blazer',
    category: 'Athletic',
    price: 139.99,
    rating: 4.8,
    reviewsCount: 76,
    image: 'athletic-trail.png',
    description: 'Rugged terrain requires rugged gear. The Trail-Blazer has a mud-guard shell, protective toe cap, and deep multi-directional lugs for running and hiking on dirt, rocks, and mud.',
    badge: 'Rugged Edition',
    colors: ['#30475E', '#FF6B35', '#1E293B'],
    sizes: [8, 9, 10]
  },
  {
    id: 'glide-on',
    name: 'Campus Glide-On',
    category: 'Casual',
    price: 89.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewsCount: 212,
    image: 'casual-glide.png',
    description: 'Slip into comfort with the Glide-On lifestyle slip-on shoe. Features a memory foam insole and slip-resistant stretch-knit fabric for daily casual wear.',
    badge: 'Pure Comfort',
    colors: ['#172A45', '#30475E', '#1E293B'],
    sizes: [7, 8, 9, 10, 11]
  },
  {
    id: 'court-classic',
    name: 'Campus Court-Classic',
    category: 'Casual',
    price: 109.99,
    rating: 4.9,
    reviewsCount: 125,
    image: 'casual-classic.png',
    description: 'Retro heritage meets modern cushioning. Crafted with premium white synthetic leather and athletic styling details, the Court-Classic complements any casual street look.',
    badge: 'Street Icon',
    colors: ['#FFFFFF', '#FF6B35', '#1E293B'],
    sizes: [8, 9, 10]
  }
];

// --- Global Application State ---
let cart = JSON.parse(localStorage.getItem('campus_cart')) || [];
let activeCategory = 'All';
let searchKeyword = '';
let currentSort = 'recommended';
let selectedQuickViewProduct = null;
let selectedSize = null;
let selectedColor = null;

// --- DOM Element References ---
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const header = document.querySelector('header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const productsContainer = document.getElementById('productsGrid');
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartBadge = document.getElementById('cartBadge');
  const cartCountText = document.getElementById('cartCountText');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTax = document.getElementById('cartTax');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Search & Filters
  const filterTabsContainer = document.getElementById('filterTabs');
  const searchInput = document.getElementById('shopSearchInput');
  const headerSearchInput = document.getElementById('headerSearchInput');
  const sortSelect = document.getElementById('shopSortSelect');
  
  // Google Auth Elements
  const loginTriggerBtn = document.getElementById('loginTriggerBtn');
  const userProfileDropdown = document.getElementById('userProfileDropdown');
  const userProfilePic = document.getElementById('userProfilePic');
  const userProfileName = document.getElementById('userProfileName');
  const userProfileEmail = document.getElementById('userProfileEmail');
  const userLogoutBtn = document.getElementById('userLogoutBtn');
  const loginModalOverlay = document.getElementById('loginModalOverlay');
  const loginModalClose = document.getElementById('loginModalClose');

  // Modals
  const quickviewOverlay = document.getElementById('quickviewOverlay');
  const qvClose = document.getElementById('qvClose');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutClose = document.getElementById('checkoutClose');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutContainer = document.getElementById('checkoutContainer');
  
  // Newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterStatus = document.getElementById('newsletterStatus');

  // --- Scroll Header Animation ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Navigation Menu ---
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const svg = menuToggle.querySelector('svg');
    if (mobileNav.classList.contains('open')) {
      svg.innerHTML = `<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                       <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>`;
    } else {
      svg.innerHTML = `<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                       <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                       <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>`;
    }
  });

  // --- Initial Renderings ---
  renderFilterTabs();
  renderProducts();
  updateCartBadge();
  renderCart();

  // --- Cart Drawer Event Handlers ---
  cartTrigger.addEventListener('click', openCartDrawer);
  cartClose.addEventListener('click', closeCartDrawer);
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) closeCartDrawer();
  });

  // --- Sorting & Filters Event Handlers ---
  searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    renderProducts();
  });
  
  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value.trim().toLowerCase();
      searchInput.value = e.target.value; // Sync with shop search
      renderProducts();
      // Scroll to shop section
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // --- Modal Close Handlers ---
  qvClose.addEventListener('click', closeQuickViewModal);
  quickviewOverlay.addEventListener('click', (e) => {
    if (e.target === quickviewOverlay) closeQuickViewModal();
  });

  checkoutClose.addEventListener('click', closeCheckoutModal);
  checkoutOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckoutModal();
  });

  // --- Checkout Simulator trigger ---
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    closeCartDrawer();
    openCheckoutModal();
  });

  // --- Checkout Form Submit handler ---
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate process payment
    checkoutContainer.innerHTML = `
      <div class="checkout-success-state">
        <div class="checkout-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3>Order Confirmed!</h3>
        <p>Thank you for shopping at Campus. Your simulated order has been placed successfully. A delivery schedule will be generated shortly.</p>
        <button class="btn btn-primary" id="successOkBtn">Continue Shopping</button>
      </div>
    `;

    document.getElementById('successOkBtn').addEventListener('click', () => {
      cart = [];
      localStorage.setItem('campus_cart', JSON.stringify(cart));
      updateCartBadge();
      renderCart();
      closeCheckoutModal();
      // Restore form content after closing modal so it remains operational for next checkout
      setTimeout(resetCheckoutForm, 400);
    });
  });

  // --- Newsletter Signup Form Validation ---
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = newsletterEmail.value.trim();
    if (!emailVal || !validateEmail(emailVal)) {
      newsletterStatus.textContent = 'Please enter a valid email address.';
      newsletterStatus.className = 'newsletter-status error';
      return;
    }

    // Success response
    newsletterStatus.textContent = 'Awesome! Check your inbox for exclusive campus discount schemes.';
    newsletterStatus.className = 'newsletter-status success';
    newsletterEmail.value = '';
    showToast('Subscribed to Newsletter!');
  });

  // --- Google Auth Event Handlers ---
  if (loginTriggerBtn) loginTriggerBtn.addEventListener('click', openLoginModal);
  if (loginModalClose) loginModalClose.addEventListener('click', closeLoginModal);
  if (loginModalOverlay) {
    loginModalOverlay.addEventListener('click', (e) => {
      if (e.target === loginModalOverlay) closeLoginModal();
    });
  }

  if (userProfileDropdown) {
    userProfileDropdown.addEventListener('click', (e) => {
      userProfileDropdown.classList.toggle('show');
      e.stopPropagation();
    });
  }

  document.addEventListener('click', () => {
    if (userProfileDropdown) userProfileDropdown.classList.remove('show');
  });

  if (userLogoutBtn) userLogoutBtn.addEventListener('click', logoutUser);

  // Initialize and update auth
  updateAuthUI();
  
  // Dynamically load Google Identity Services client to prevent race conditions
  loadGoogleScript();
});

// --- Cart Core Operations ---
function openCartDrawer() {
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeCartDrawer() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = ''; // Release scroll
}

function openCheckoutModal() {
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function resetCheckoutForm() {
  const checkoutContainer = document.getElementById('checkoutContainer');
  const user = JSON.parse(localStorage.getItem('campus_user'));
  const nameVal = user ? user.name : '';
  const emailVal = user ? user.email : '';

  checkoutContainer.innerHTML = `
    <div class="checkout-modal-header">
      <h3>Checkout (Simulated)</h3>
      <button class="checkout-close-btn" id="checkoutClose">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <form class="checkout-form" id="checkoutForm">
      <div class="form-group">
        <label for="cName">Full Name</label>
        <input type="text" id="cName" placeholder="John Doe" value="${nameVal}" required>
      </div>
      <div class="form-group">
        <label for="cEmail">Email Address</label>
        <input type="email" id="cEmail" placeholder="john@example.com" value="${emailVal}" required>
      </div>
      <div class="form-group">
        <label for="cAddress">Shipping Address</label>
        <input type="text" id="cAddress" placeholder="123 Active Street, Sport City" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cCard">Card Number</label>
          <input type="text" id="cCard" placeholder="4111 2222 3333 4444" pattern="\\d{16}" title="16-digit credit card number" required>
        </div>
        <div class="form-group">
          <label for="cExpiry">Expiry (MM/YY)</label>
          <input type="text" id="cExpiry" placeholder="12/28" pattern="\\d{2}/\\d{2}" title="Expiry in MM/YY format" required>
        </div>
      </div>
      <button type="submit" class="checkout-submit-btn">Authorize Simulated Payment</button>
    </form>
  `;
  
  // Rebind elements
  document.getElementById('checkoutClose').addEventListener('click', closeCheckoutModal);
  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('checkoutContainer').innerHTML = `
      <div class="checkout-success-state">
        <div class="checkout-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3>Order Confirmed!</h3>
        <p>Thank you for shopping at Campus. Your simulated order has been placed successfully. A delivery schedule will be generated shortly.</p>
        <button class="btn btn-primary" id="successOkBtn">Continue Shopping</button>
      </div>
    `;
    
    document.getElementById('successOkBtn').addEventListener('click', () => {
      cart = [];
      localStorage.setItem('campus_cart', JSON.stringify(cart));
      updateCartBadge();
      renderCart();
      closeCheckoutModal();
      setTimeout(resetCheckoutForm, 400);
    });
  });
}

function addToCart(productId, size = null, color = null, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Use default size/color if not specified
  const chosenSize = size || product.sizes[0];
  const chosenColor = color || product.colors[0];

  // Check if item with same size and color already in cart
  const existingItemIndex = cart.findIndex(item => 
    item.product.id === productId && 
    item.size === chosenSize && 
    item.color === chosenColor
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      product,
      quantity,
      size: chosenSize,
      color: chosenColor
    });
  }

  // Save & Render
  localStorage.setItem('campus_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
  
  // Notify
  showToast(`Added ${product.name} to Cart`);
  
  // Cart Badge Bounce Animation
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('active');
  void badge.offsetWidth; // Trigger reflow
  badge.classList.add('active');
}

function removeFromCart(productId, size, color) {
  cart = cart.filter(item => 
    !(item.product.id === productId && item.size === size && item.color === color)
  );
  localStorage.setItem('campus_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
  showToast('Removed item from Cart');
}

function changeQuantity(productId, size, color, delta) {
  const itemIndex = cart.findIndex(item => 
    item.product.id === productId && item.size === size && item.color === color
  );

  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    localStorage.setItem('campus_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalQty > 0) {
    badge.textContent = totalQty;
    badge.classList.add('active');
  } else {
    badge.classList.remove('active');
  }
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTax = document.getElementById('cartTax');
  const cartTotal = document.getElementById('cartTotal');
  const cartCountText = document.getElementById('cartCountText');
  
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountText.textContent = `(${totalQty} Item${totalQty !== 1 ? 's' : ''})`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        <p>Your shopping cart is empty.</p>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Step into style by adding products today!</span>
      </div>
    `;
    cartSubtotal.textContent = '$0.00';
    cartShipping.textContent = '$0.00';
    cartTax.textContent = '$0.00';
    cartTotal.textContent = '$0.00';
    return;
  }

  // Draw items
  let subtotal = 0;
  cartItemsContainer.innerHTML = '';
  
  cart.forEach(item => {
    const itemCost = item.product.price * item.quantity;
    subtotal += itemCost;

    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <div class="cart-item-img-wrapper">
        <img src="${item.product.image}" alt="${item.product.name}" style="max-height: 50px; transform: rotate(-10deg);">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.product.name}</h4>
        <div class="cart-item-details">Size: ${item.size} | Color: <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${item.color}; border: 1px solid #ddd; vertical-align:middle; margin-left:2px;"></span></div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn decrease-qty" data-id="${item.product.id}" data-size="${item.size}" data-color="${item.color}">-</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button class="cart-qty-btn increase-qty" data-id="${item.product.id}" data-size="${item.size}" data-color="${item.color}">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">$${itemCost.toFixed(2)}</span>
        <button class="cart-item-remove-btn remove-item" data-id="${item.product.id}" data-size="${item.size}" data-color="${item.color}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Remove
        </button>
      </div>
    `;
    cartItemsContainer.appendChild(cartItemEl);
  });

  // Calculate pricing summary
  const shipping = subtotal > 150 ? 0 : 12.99; // Free shipping over $150
  const tax = subtotal * 0.08; // 8% Tax
  const total = subtotal + shipping + tax;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  cartTax.textContent = `$${tax.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;

  // Bind Events on items
  document.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      changeQuantity(btn.dataset.id, parseInt(btn.dataset.size), btn.dataset.color, -1);
    });
  });

  document.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      changeQuantity(btn.dataset.id, parseInt(btn.dataset.size), btn.dataset.color, 1);
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id, parseInt(btn.dataset.size), btn.dataset.color);
    });
  });
}

// --- Dynamic Catalog Rendering (Filter, Search & Sort) ---
function renderFilterTabs() {
  const container = document.getElementById('filterTabs');
  const categories = ['All', 'Running', 'Athletic', 'Casual'];
  
  container.innerHTML = '';
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${activeCategory === category ? 'active' : ''}`;
    btn.textContent = category;
    btn.addEventListener('click', () => {
      activeCategory = category;
      renderFilterTabs();
      renderProducts();
    });
    container.appendChild(btn);
  });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  // 1. Filter by category & Search query
  let filtered = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchKeyword) || 
                          p.category.toLowerCase().includes(searchKeyword) || 
                          p.description.toLowerCase().includes(searchKeyword);
    return matchesCategory && matchesSearch;
  });

  // 2. Sort results
  if (currentSort === 'low-to-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'high-to-low') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } // 'recommended' uses catalog defaults

  // Handle empty search results
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No Products Found</h3>
        <p>Try refining your search keyword or selecting a different tab.</p>
      </div>
    `;
    return;
  }

  // 3. Render cards
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Check if original price exists for promo badge
    const discountPercent = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    const badgeHTML = p.badge ? `<span class="product-card-badge ${p.originalPrice ? 'promo' : ''}">${p.badge}</span>` : '';
    const originalPriceHTML = p.originalPrice ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : '';

    card.innerHTML = `
      ${badgeHTML}
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.name}" class="product-img" style="transform: rotate(-15deg);">
        <div class="product-actions-overlay">
          <button class="btn-card add-to-cart-quick" data-id="${p.id}" title="Quick Add to Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </button>
          <button class="btn-card view-details" data-id="${p.id}" title="Quick View Details">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </div>
      <div class="product-details">
        <div class="product-meta">
          <span class="product-category">${p.category}</span>
          <div class="product-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>${p.rating}</span>
          </div>
        </div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price-row">
          <div class="price-container">
            <span class="price">$${p.price.toFixed(2)}</span>
            ${originalPriceHTML}
          </div>
          <button class="quick-add-link add-to-cart-quick" data-id="${p.id}">Add To Cart</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Bind clicks
  document.querySelectorAll('.add-to-cart-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });

  document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickViewModal(btn.dataset.id);
    });
  });
}

// --- Product Quick View Modal ---
function openQuickViewModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = product.sizes[0];
  selectedColor = product.colors[0];

  // DOM elements updates
  document.getElementById('qvCategory').textContent = product.category;
  document.getElementById('qvName').textContent = product.name;
  document.getElementById('qvPrice').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('qvDesc').textContent = product.description;
  document.getElementById('qvRatingText').textContent = `${product.rating} / 5 stars (${product.reviewsCount} reviews)`;

  // Dynamic Image
  const gallery = document.getElementById('qvGallery');
  gallery.innerHTML = `<img src="${product.image}" alt="${product.name}" style="transform: rotate(-15deg);">`;

  // Dynamic Swatches
  const swatchesContainer = document.getElementById('qvSwatches');
  swatchesContainer.innerHTML = '';
  product.colors.forEach((color, idx) => {
    const swatch = document.createElement('div');
    swatch.className = `qv-swatch ${color === selectedColor ? 'active' : ''}`;
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', () => {
      selectedColor = color;
      document.querySelectorAll('.qv-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
    swatchesContainer.appendChild(swatch);
  });

  // Dynamic Size Buttons
  const sizesContainer = document.getElementById('qvSizes');
  sizesContainer.innerHTML = '';
  product.sizes.forEach(size => {
    const sizeBtn = document.createElement('button');
    sizeBtn.className = `qv-size-btn ${size === selectedSize ? 'active' : ''}`;
    sizeBtn.textContent = size;
    sizeBtn.addEventListener('click', () => {
      selectedSize = size;
      document.querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('active'));
      sizeBtn.classList.add('active');
    });
    sizesContainer.appendChild(sizeBtn);
  });

  // Add Button Event
  const addBtn = document.getElementById('qvAddBtn');
  // Clean old event listeners
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);
  
  newAddBtn.addEventListener('click', () => {
    addToCart(selectedQuickViewProduct.id, selectedSize, selectedColor);
    closeQuickViewModal();
  });

  // Open Modal Overlay
  document.getElementById('quickviewOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickViewModal() {
  document.getElementById('quickviewOverlay').classList.remove('open');
  document.body.style.overflow = '';
  selectedQuickViewProduct = null;
}

// --- Toast Alerts ---
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Fade out
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// --- Helper Email Validator ---
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// --- Google Auth Operations ---
function loadGoogleScript() {
  // Check if GSI is already loaded
  if (window.google && window.google.accounts) {
    initGoogleAuth();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    initGoogleAuth();
  };
  script.onerror = () => {
    console.error("Failed to load Google Identity Services library.");
    showToast("Auth Service Unavailable");
  };
  document.head.appendChild(script);
}

function initGoogleAuth() {
  if (!window.google || !window.google.accounts) return;
  
  google.accounts.id.initialize({
    client_id: "384749496874-ch1fpkj01c3a3qle73akhj6r1eg1g7bc.apps.googleusercontent.com",
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  const btnContainer = document.getElementById("googleSignInBtn");
  if (btnContainer) {
    google.accounts.id.renderButton(
      btnContainer,
      { 
        theme: "outline", 
        size: "large", 
        width: "300",
        text: "signin_with",
        shape: "pill"
      }
    );
  }

  // Display Google One Tap trigger
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed()) {
      console.log("One Tap not displayed:", notification.getNotDisplayedReason());
    } else if (notification.isSkippedMoment()) {
      console.log("One Tap skipped:", notification.getSkippedReason());
    } else if (notification.isDismissedMoment()) {
      console.log("One Tap dismissed:", notification.getDismissedReason());
    }
  });
}

function handleGoogleCredentialResponse(response) {
  const payload = decodeJwt(response.credential);
  if (payload) {
    const userSession = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      id: payload.sub
    };
    
    localStorage.setItem('campus_user', JSON.stringify(userSession));
    closeLoginModal();
    updateAuthUI();
    showToast(`Welcome back, ${payload.given_name || payload.name}!`);
    
    // Auto-fill checkout fields if user is inside checkout
    const cName = document.getElementById('cName');
    const cEmail = document.getElementById('cEmail');
    if (cName) cName.value = userSession.name;
    if (cEmail) cEmail.value = userSession.email;
  }
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Pad base64 standardly to prevent base64 length errors in atob
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT decoding failed", e);
    return null;
  }
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('campus_user'));
  const triggerBtn = document.getElementById('loginTriggerBtn');
  const profileDropdown = document.getElementById('userProfileDropdown');
  const profilePic = document.getElementById('userProfilePic');
  const profileName = document.getElementById('userProfileName');
  const profileEmail = document.getElementById('userProfileEmail');
  
  if (user) {
    if (triggerBtn) triggerBtn.style.display = 'none';
    if (profileDropdown) profileDropdown.style.display = 'block';
    if (profilePic) profilePic.src = user.picture || 'https://www.gravatar.com/avatar/?d=mp';
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
  } else {
    if (triggerBtn) triggerBtn.style.display = 'flex';
    if (profileDropdown) profileDropdown.style.display = 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('campus_user');
  updateAuthUI();
  showToast('Logged out successfully');
  
  // Clear prefilled checkout fields if visible
  const cName = document.getElementById('cName');
  const cEmail = document.getElementById('cEmail');
  if (cName) cName.value = '';
  if (cEmail) cEmail.value = '';
}

function openLoginModal() {
  const modal = document.getElementById('loginModalOverlay');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModalOverlay');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.onload = function () {
    // 1. Initialize the Google Identity Service
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with your actual Client ID
        callback: handleCredentialResponse
    });

    // 2. Make your custom button trigger the Google sign-in overlay popup
    const loginBtn = document.getElementById("loginTriggerBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            google.accounts.id.prompt(); 
        });
    }
};

// 3. Handle the login response when a user successfully logs in
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    // Logic to show profile and hide your login button
    document.getElementById("loginTriggerBtn").style.display = "none";
    document.getElementById("userProfileDropdown").style.display = "block";
}
