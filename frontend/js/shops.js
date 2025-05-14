
// shops.js - JavaScript file for shop-related functionality

// Load all shops
async function loadShops() {
      try {
          const shopsContainer = document.getElementById('shops-container');
          shopsContainer.innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
          `;
          
          const shops = await fetchAPI('/shops');
          
          if (shops.length === 0) {
              shopsContainer.innerHTML = '<div class="alert alert-info">No shops found.</div>';
              return;
          }
          
          let html = '';
          shops.forEach(shop => {
              html += `
                  <div class="col-md-4 col-sm-6 mb-4">
                      <div class="card shop-card">
                          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 180px;">
                              <i class="bi bi-shop" style="font-size: 4rem;"></i>
                          </div>
                          <div class="card-body">
                              <h5 class="card-title">${shop.name}</h5>
                              <h6 class="card-subtitle mb-2 text-muted">${shop.shop_type}</h6>
                              <p class="card-text">${shop.description || 'No description available.'}</p>
                              <p class="card-text small">
                                  <i class="bi bi-geo-alt"></i> ${shop.location || 'Location not specified'}<br>
                                  <i class="bi bi-telephone"></i> ${shop.contact_number || 'No contact number'}<br>
                                  <i class="bi bi-clock"></i> ${formatOpeningHours(shop.opening_time, shop.closing_time)}
                              </p>
                          </div>
                          <div class="card-footer">
                              <button class="btn btn-primary w-100 view-shop-btn" data-shop-id="${shop.shop_id}">
                                  View Products <i class="bi bi-arrow-right"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              `;
          });
          
          shopsContainer.innerHTML = html;
          
          // Add event listeners to shop cards
          document.querySelectorAll('.view-shop-btn').forEach(button => {
              button.addEventListener('click', function() {
                  const shopId = this.getAttribute('data-shop-id');
                  loadShopDetails(shopId);
              });
          });
          
      } catch (error) {
          console.error('Error loading shops:', error);
          document.getElementById('shops-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load shops. Please try again later.</div>';
      }
  }
  
  // Format opening hours
  function formatOpeningHours(opening, closing) {
      if (!opening || !closing) {
          return 'Hours not available';
      }
      
      // Format time to 12-hour format
      const formatTime = (timeStr) => {
          const [hours, minutes] = timeStr.split(':');
          let h = parseInt(hours, 10);
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          return `${h}:${minutes} ${ampm}`;
      };
      
      return `${formatTime(opening)} - ${formatTime(closing)}`;
  }
  
  // Load shop details and products
  async function loadShopDetails(shopId) {
      try {
          hideAllSections();
          
          const shopDetailSection = document.getElementById('shop-detail-section');
          shopDetailSection.innerHTML = `
              <div class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading shop details...</p>
              </div>
          `;
          shopDetailSection.classList.remove('d-none');
          
          // Fetch shop details and products in parallel
          const [shop, products] = await Promise.all([
              fetchAPI(`/shops/${shopId}`),
              fetchAPI(`/shops/${shopId}/products`)
          ]);
          
          // Group products by category
          const productsByCategory = {};
          const categories = new Set();
          
          products.forEach(product => {
              const categoryName = product.category_name || 'Uncategorized';
              categories.add(categoryName);
              
              if (!productsByCategory[categoryName]) {
                  productsByCategory[categoryName] = [];
              }
              
              productsByCategory[categoryName].push(product);
          });
          
          // Build the shop detail HTML
          let html = `
              <div class="mb-4">
                  <a href="#" class="btn btn-outline-secondary mb-3" id="back-to-shops-btn">
                      <i class="bi bi-arrow-left"></i> Back to Shops
                  </a>
                  
                  <div class="card mb-4">
                      <div class="card-body">
                          <div class="row">
                              <div class="col-md-8">
                                  <h2 class="card-title">${shop.name}</h2>
                                  <h6 class="card-subtitle mb-3 text-muted">${shop.shop_type}</h6>
                                  <p class="card-text">${shop.description || 'No description available.'}</p>
                                  
                                  <div class="row mt-4">
                                      <div class="col-md-6">
                                          <p><strong><i class="bi bi-geo-alt"></i> Location:</strong> ${shop.location || 'Not specified'}</p>
                                          <p><strong><i class="bi bi-telephone"></i> Contact:</strong> ${shop.contact_number || 'Not available'}</p>
                                      </div>
                                      <div class="col-md-6">
                                          <p><strong><i class="bi bi-clock"></i> Hours:</strong> ${formatOpeningHours(shop.opening_time, shop.closing_time)}</p>
                                      </div>
                                  </div>
                              </div>
                              <div class="col-md-4 text-center">
                                  <div class="bg-light rounded d-flex align-items-center justify-content-center mb-3" style="height: 130px; width: 130px; margin: 0 auto;">
                                      <i class="bi bi-shop" style="font-size: 5rem;"></i>
                                  </div>
                                  <button class="btn btn-primary mt-2" id="place-order-shop-btn" data-shop-id="${shop.shop_id}">
                                      <i class="bi bi-bag"></i> Place Order
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div class="mb-4">
                  <h3>Products</h3>
                  
                  <div class="mb-3">
                      <div class="d-flex flex-wrap gap-2">
                          <span class="badge bg-light text-dark category-pill active" data-category="all">All</span>
                          ${Array.from(categories).map(category => 
                              `<span class="badge bg-light text-dark category-pill" data-category="${category}">${category}</span>`
                          ).join('')}
                      </div>
                  </div>
                  
                  <div id="shop-products-container">
          `;
          
          // Add products by category
          if (products.length === 0) {
              html += `<div class="alert alert-info">No products available for this shop.</div>`;
          } else {
              html += `<div class="row" id="products-list">`;
              
              // Add all products initially
              products.forEach(product => {
                  html += createProductCard(product);
              });
              
              html += `</div>`;
          }
          
          html += `
                  </div>
              </div>
          `;
          
          // Update the shop detail section
          shopDetailSection.innerHTML = html;
          
          // Add event listeners
          document.getElementById('back-to-shops-btn').addEventListener('click', function(e) {
              e.preventDefault();
              showShops();
          });
          
          document.getElementById('place-order-shop-btn').addEventListener('click', function() {
              const shopId = this.getAttribute('data-shop-id');
              showOrders();
              // Switch to the place order tab
              document.getElementById('place-order-tab').click();
              // Pre-select this shop
              const shopSelect = document.getElementById('order-shop-select');
              if (shopSelect) {
                  shopSelect.value = shopId;
                  // Trigger change event to load products
                  shopSelect.dispatchEvent(new Event('change'));
              }
          });
          
          // Category filter functionality
          document.querySelectorAll('.category-pill').forEach(pill => {
              pill.addEventListener('click', function() {
                  const category = this.getAttribute('data-category');
                  
                  // Update active pill
                  document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                  this.classList.add('active');
                  
                  // Filter products
                  const productsContainer = document.getElementById('products-list');
                  
                  if (category === 'all') {
                      // Show all products
                      productsContainer.innerHTML = products.map(createProductCard).join('');
                  } else {
                      // Show only products from selected category
                      const filteredProducts = products.filter(p => (p.category_name || 'Uncategorized') === category);
                      productsContainer.innerHTML = filteredProducts.map(createProductCard).join('');
                  }
                  
                  // Add event listeners to add to cart buttons
                  addProductEventListeners();
              });
          });
          
          // Add event listeners to product cards
          addProductEventListeners();
          
      } catch (error) {
          console.error('Error loading shop details:', error);
          document.getElementById('shop-detail-section').innerHTML = `
              <div class="alert alert-danger my-5">
                  <h4>Error Loading Shop Details</h4>
                  <p>${error.message || 'Failed to load shop details. Please try again later.'}</p>
                  <button class="btn btn-outline-primary mt-3" onclick="showShops()">
                      <i class="bi bi-arrow-left"></i> Back to Shops
                  </button>
              </div>
          `;
      }
  }
  
  // Create product card HTML
  function createProductCard(product) {
      return `
          <div class="col-md-4 col-sm-6 mb-4" data-category="${product.category_name || 'Uncategorized'}">
              <div class="card product-card h-100">
                  <div class="card-img-top bg-light d-flex align-items-center justify-content-center">
                      <i class="bi bi-box" style="font-size: 3rem;"></i>
                  </div>
                  <div class="card-body">
                      <h5 class="card-title">${product.name}</h5>
                      <span class="badge bg-info mb-2">${product.category_name || 'Uncategorized'}</span>
                      <p class="card-text">${product.description || 'No description available.'}</p>
                      <h6 class="card-subtitle mb-2 text-primary fw-bold">${formatCurrency(product.price)}</h6>
                      <p class="card-text small">
                          <span class="badge ${product.is_available ? 'bg-success' : 'bg-danger'}">
                              ${product.is_available ? 'In Stock' : 'Out of Stock'}
                          </span>
                      </p>
                  </div>
                  <div class="card-footer">
                      <button class="btn btn-primary w-100 add-to-cart-btn ${!product.is_available ? 'disabled' : ''}" 
                              data-product-id="${product.product_id}" 
                              data-product-name="${product.name}" 
                              data-product-price="${product.price}"
                              ${!product.is_available ? 'disabled' : ''}>
                          <i class="bi bi-cart-plus"></i> Add to Cart
                      </button>
                  </div>
              </div>
          </div>
      `;
  }
  
  // Add event listeners to product cards
  function addProductEventListeners() {
      document.querySelectorAll('.add-to-cart-btn').forEach(button => {
          button.addEventListener('click', function() {
              const productId = this.getAttribute('data-product-id');
              const productName = this.getAttribute('data-product-name');
              const productPrice = this.getAttribute('data-product-price');
              
              addToCart({
                  id: productId,
                  name: productName,
                  price: productPrice,
                  quantity: 1
              });
              
              showSuccessMessage(`"${productName}" has been added to your cart.`);
          });
      });
  }
  
  // Shopping cart functionality
  let cartItems = [];
  
  // Add item to cart
  function addToCart(product) {
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
          // Increment quantity if already in cart
          cartItems[existingItemIndex].quantity += product.quantity;
      } else {
          // Add new item to cart
          cartItems.push(product);
      }
      
      // Update cart UI if needed
      updateCartUI();
  }
  
  // Update cart UI
  function updateCartUI() {
      const cartContainer = document.getElementById('cart-items-container');
      if (!cartContainer) return;
      
      if (cartItems.length === 0) {
          cartContainer.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
          return;
      }
      
      let html = '';
      let total = 0;
      
      cartItems.forEach((item, index) => {
          const subtotal = item.price * item.quantity;
          total += subtotal;
          
          html += `
              <div class="cart-item">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                      <div>
                          <h6 class="mb-0">${item.name}</h6>
                          <div class="text-muted small">${formatCurrency(item.price)} each</div>
                      </div>
                      <div>${formatCurrency(subtotal)}</div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                      <div class="input-group input-group-sm" style="width: 120px;">
                          <button class="btn btn-outline-secondary decrease-qty-btn" data-index="${index}">-</button>
                          <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                          <button class="btn btn-outline-secondary increase-qty-btn" data-index="${index}">+</button>
                      </div>
                      <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
                          <i class="bi bi-trash"></i>
                      </button>
                  </div>
              </div>
          `;
      });
      
      html += `
          <div class="mt-3 pt-3 border-top">
              <div class="d-flex justify-content-between align-items-center fw-bold">
                  <div>Total:</div>
                  <div>${formatCurrency(total)}</div>
              </div>
          </div>
      `;
      
      cartContainer.innerHTML = html;
      
      // Add event listeners for cart items
      document.querySelectorAll('.decrease-qty-btn').forEach(button => {
          button.addEventListener('click', function() {
              const index = parseInt(this.getAttribute('data-index'));
              if (cartItems[index].quantity > 1) {
                  cartItems[index].quantity -= 1;
                  updateCartUI();
              }
          });
      });
      
      document.querySelectorAll('.increase-qty-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cartItems[index].quantity += 1;
                updateCartUI();
            });
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cartItems.splice(index, 1);
                updateCartUI();
            });
        });
    }
    
    // Clear cart
    function clearCart() {
        cartItems = [];
        updateCartUI();
    }
