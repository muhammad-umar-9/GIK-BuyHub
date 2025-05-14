
// products.js - JavaScript file for product-related functionality

// Load all products
async function loadAllProducts() {
      try {
          const productsContainer = document.getElementById('products-container');
          productsContainer.innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
          `;
          
          const products = await fetchAPI('/products');
          
          if (products.length === 0) {
              productsContainer.innerHTML = '<div class="alert alert-info">No products found.</div>';
              return;
          }
          
          // Group products by shop
          const productsByShop = {};
          
          products.forEach(product => {
              if (!productsByShop[product.shop_name]) {
                  productsByShop[product.shop_name] = [];
              }
              
              productsByShop[product.shop_name].push(product);
          });
          
          let html = '';
          
          // Create sections for each shop
          for (const [shopName, shopProducts] of Object.entries(productsByShop)) {
              html += `
                  <div class="mb-4">
                      <h3>${shopName}</h3>
                      <div class="row">
              `;
              
              // Add product cards
              shopProducts.forEach(product => {
                  html += createProductCard(product);
              });
              
              html += `
                      </div>
                  </div>
              `;
          }
          
          productsContainer.innerHTML = html;
          
          // Add event listeners to product cards
          addProductEventListeners();
          
      } catch (error) {
          console.error('Error loading products:', error);
          document.getElementById('products-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load products. Please try again later.</div>';
      }
  }
  
  // Load products by category
  async function loadProductsByCategory(categoryId) {
      try {
          const productsContainer = document.getElementById('products-container');
          productsContainer.innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
          `;
          
          const products = await fetchAPI(`/products/category/${categoryId}`);
          
          if (products.length === 0) {
              productsContainer.innerHTML = '<div class="alert alert-info">No products found in this category.</div>';
              return;
          }
          
          let html = `<div class="row">`;
          
          products.forEach(product => {
              html += createProductCard(product);
          });
          
          html += `</div>`;
          
          productsContainer.innerHTML = html;
          
          // Add event listeners to product cards
          addProductEventListeners();
          
      } catch (error) {
          console.error(`Error loading products for category ${categoryId}:`, error);
          document.getElementById('products-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load products. Please try again later.</div>';
      }
  }
  
  // Load product details
  async function loadProductDetails(productId) {
      try {
          const product = await fetchAPI(`/products/${productId}`);
          
          const modalTitle = document.getElementById('appModalLabel');
          const modalBody = document.getElementById('app-modal-body');
          const confirmBtn = document.getElementById('modal-confirm-btn');
          
          modalTitle.textContent = product.name;
          
          modalBody.innerHTML = `
              <div class="row">
                  <div class="col-md-5 text-center mb-3">
                      <div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 180px;">
                          <i class="bi bi-box" style="font-size: 4rem;"></i>
                      </div>
                  </div>
                  <div class="col-md-7">
                      <h5>${product.name}</h5>
                      <p class="text-muted">${product.shop_name}</p>
                      <span class="badge bg-info mb-2">${product.category_name || 'Uncategorized'}</span>
                      <p>${product.description || 'No description available.'}</p>
                      <h5 class="text-primary">${formatCurrency(product.price)}</h5>
                      <p>
                          <span class="badge ${product.is_available ? 'bg-success' : 'bg-danger'}">
                              ${product.is_available ? 'In Stock' : 'Out of Stock'}
                          </span>
                      </p>
                  </div>
              </div>
          `;
          
          confirmBtn.style.display = 'block';
          confirmBtn.textContent = 'Add to Cart';
          confirmBtn.disabled = !product.is_available;
          
          // Remove any existing event listeners
          const newConfirmBtn = confirmBtn.cloneNode(true);
          confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
          
          // Add new event listener
          newConfirmBtn.addEventListener('click', function() {
              addToCart({
                  id: product.product_id,
                  name: product.name,
                  price: product.price,
                  quantity: 1
              });
              
              appModal.hide();
              showSuccessMessage(`"${product.name}" has been added to your cart.`);
          });
          
          appModal.show();
          
      } catch (error) {
          console.error(`Error loading product details for ID ${productId}:`, error);
          showErrorMessage('Failed to load product details. Please try again later.');
      }
  }
  
  // Load all categories
  async function loadCategories() {
      try {
          const categories = await fetchAPI('/products/categories');
          return categories;
      } catch (error) {
          console.error('Error loading categories:', error);
          return [];
      }
  }
