
// orders.js - JavaScript file for order-related functionality

// Load active orders
async function loadActiveOrders() {
      try {
          const activeOrdersContainer = document.getElementById('active-orders-container');
          activeOrdersContainer.innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
          `;
          
          const activeOrders = await fetchAPI('/orders/active');
          
          if (activeOrders.length === 0) {
              activeOrdersContainer.innerHTML = '<div class="alert alert-info">No active orders found.</div>';
              return;
          }
          
          let html = '';
          activeOrders.forEach(order => {
              html += `
                  <div class="card mb-3">
                      <div class="card-header d-flex justify-content-between align-items-center">
                          <div>
                              <h5 class="mb-0">Order #${order.order_id}</h5>
                              <small class="text-muted">${formatDate(order.order_date)}</small>
                          </div>
                          <div>${getStatusBadge(order.status)}</div>
                      </div>
                      <div class="card-body">
                          <div class="row">
                              <div class="col-md-6">
                                  <p><strong>Customer:</strong> ${order.customer_name}</p>
                                  <p><strong>Delivery:</strong> ${order.hostel}, ${order.room_number}</p>
                                  <p><strong>Delivery Status:</strong> ${getStatusBadge(order.delivery_status)}</p>
                              </div>
                              <div class="col-md-6 text-md-end">
                                  <h5 class="text-primary mb-3">${formatCurrency(order.total_amount)}</h5>
                                  <button class="btn btn-primary view-order-btn" data-order-id="${order.order_id}">
                                      <i class="bi bi-eye"></i> View Details
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
          });
          
          activeOrdersContainer.innerHTML = html;
          
          // Add event listeners
          document.querySelectorAll('.view-order-btn').forEach(button => {
              button.addEventListener('click', function() {
                  const orderId = this.getAttribute('data-order-id');
                  loadOrderDetails(orderId);
              });
          });
          
      } catch (error) {
          console.error('Error loading active orders:', error);
          document.getElementById('active-orders-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load active orders. Please try again later.</div>';
      }
  }
  
  // Load completed orders
  async function loadCompletedOrders() {
      try {
          const completedOrdersContainer = document.getElementById('completed-orders-container');
          completedOrdersContainer.innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
          `;
          
          // Get completed and cancelled orders
          const orders = await fetchAPI('/orders?status=Completed');
          const cancelledOrders = await fetchAPI('/orders?status=Cancelled');
          
          // Combine and sort by date (newest first)
          const completedOrders = [...orders, ...cancelledOrders].sort((a, b) => 
              new Date(b.order_date) - new Date(a.order_date)
          );
          
          if (completedOrders.length === 0) {
              completedOrdersContainer.innerHTML = '<div class="alert alert-info">No completed orders found.</div>';
              return;
          }
          
          let html = '';
          completedOrders.forEach(order => {
              html += `
                  <div class="card mb-3">
                      <div class="card-header d-flex justify-content-between align-items-center">
                          <div>
                              <h5 class="mb-0">Order #${order.order_id}</h5>
                              <small class="text-muted">${formatDate(order.order_date)}</small>
                          </div>
                          <div>${getStatusBadge(order.status)}</div>
                      </div>
                      <div class="card-body">
                          <div class="row">
                              <div class="col-md-6">
                                  <p><strong>Customer:</strong> ${order.customer_name}</p>
                                  <p><strong>Delivery:</strong> ${order.hostel}, ${order.room_number}</p>
                              </div>
                              <div class="col-md-6 text-md-end">
                                  <h5 class="text-primary mb-3">${formatCurrency(order.total_amount)}</h5>
                                  <button class="btn btn-outline-primary view-order-btn" data-order-id="${order.order_id}">
                                      <i class="bi bi-eye"></i> View Details
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
          });
          
          completedOrdersContainer.innerHTML = html;
          
          // Add event listeners
          document.querySelectorAll('.view-order-btn').forEach(button => {
              button.addEventListener('click', function() {
                  const orderId = this.getAttribute('data-order-id');
                  loadOrderDetails(orderId);
              });
          });
          
      } catch (error) {
          console.error('Error loading completed orders:', error);
          document.getElementById('completed-orders-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load completed orders. Please try again later.</div>';
      }
  }
  
  // Load order details
  async function loadOrderDetails(orderId) {
      try {
          hideAllSections();
          
          const orderDetailSection = document.getElementById('order-detail-section');
          orderDetailSection.innerHTML = `
              <div class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading order details...</p>
              </div>
          `;
          orderDetailSection.classList.remove('d-none');
          
          // Load order details and items
          const order = await fetchAPI(`/orders/${orderId}`);
          
          // Build the order detail HTML
          let html = `
              <div class="mb-4">
                  <a href="#" class="btn btn-outline-secondary mb-3" id="back-to-orders-btn">
                      <i class="bi bi-arrow-left"></i> Back to Orders
                  </a>
                  
                  <div class="card mb-4">
                      <div class="card-header bg-primary text-white">
                          <div class="d-flex justify-content-between align-items-center">
                              <h3 class="mb-0">Order #${order.order_id}</h3>
                              <div>${getStatusBadge(order.status)}</div>
                          </div>
                      </div>
                      <div class="card-body">
                          <div class="row mb-4">
                              <div class="col-md-6">
                                  <h5>Customer Information</h5>
                                  <p><strong>Name:</strong> ${order.customer_name}</p>
                                  <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
                                  <p><strong>Delivery Location:</strong> ${order.hostel}, ${order.room_number}</p>
                              </div>
                              <div class="col-md-6">
                                  <h5>Order Information</h5>
                                  <p><strong>Order Date:</strong> ${formatDate(order.order_date)}</p>
                                  <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                                  <p><strong>Delivery Status:</strong> ${getStatusBadge(order.delivery_status)}</p>
                              </div>
                          </div>
                          
                          <h5>Order Items</h5>
                          <div class="table-responsive">
                              <table class="table table-striped">
                                  <thead>
                                      <tr>
                                          <th>Product</th>
                                          <th>Shop</th>
                                          <th class="text-end">Price</th>
                                          <th class="text-center">Quantity</th>
                                          <th class="text-end">Subtotal</th>
                                      </tr>
                                  </thead>
                                  <tbody>
          `;
          
          // Add order items
          order.items.forEach(item => {
              html += `
                  <tr>
                      <td>${item.product_name}</td>
                      <td>${item.shop_name}</td>
                      <td class="text-end">${formatCurrency(item.unit_price)}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-end">${formatCurrency(item.subtotal)}</td>
                  </tr>
              `;
          });
          
          html += `
                                  </tbody>
                                  <tfoot>
                                      <tr class="fw-bold">
                                          <td colspan="4" class="text-end">Total:</td>
                                          <td class="text-end">${formatCurrency(order.total_amount)}</td>
                                      </tr>
                                  </tfoot>
                              </table>
                          </div>
          `;
          
          // Add special instructions if any
          if (order.special_instructions) {
              html += `
                  <div class="mt-3">
                      <h5>Special Instructions</h5>
                      <p class="bg-light p-3 rounded">${order.special_instructions}</p>
                  </div>
              `;
          }
          
          // Add action buttons based on order status
          html += `
                      </div>
                      <div class="card-footer">
          `;
          
          if (order.status === 'Pending' || order.status === 'Processing') {
              html += `
                  <button class="btn btn-danger" id="cancel-order-btn" data-order-id="${order.order_id}">
                      <i class="bi bi-x-circle"></i> Cancel Order
                  </button>
              `;
          }
          
          html += `
                      </div>
                  </div>
              </div>
          `;
          
          // Update the order detail section
          orderDetailSection.innerHTML = html;
          
          // Add event listeners
          document.getElementById('back-to-orders-btn').addEventListener('click', function(e) {
              e.preventDefault();
              showOrders();
          });
          
          // Add cancel order button functionality
          const cancelBtn = document.getElementById('cancel-order-btn');
          if (cancelBtn) {
              cancelBtn.addEventListener('click', function() {
                  const orderId = this.getAttribute('data-order-id');
                  
                  showConfirmationDialog(
                      'Cancel Order',
                      `<p>Are you sure you want to cancel Order #${orderId}?</p>
                      <div class="mb-3">
                          <label for="cancellation-reason" class="form-label">Reason for cancellation (optional):</label>
                          <textarea id="cancellation-reason" class="form-control" rows="2"></textarea>
                      </div>`,
                      async function() {
                          try {
                              const reason = document.getElementById('cancellation-reason').value;
                              
                              await fetchAPI(`/orders/${orderId}/cancel`, {
                                  method: 'POST',
                                  headers: {
                                      'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ cancellation_reason: reason })
                              });
                              
                              showSuccessMessage('Order cancelled successfully.');
                              showOrders();
                          } catch (error) {
                              console.error('Error cancelling order:', error);
                              showErrorMessage('Failed to cancel order. Please try again.');
                          }
                      }
                  );
              });
          }
          
      } catch (error) {
          console.error(`Error loading order details for ID ${orderId}:`, error);
          document.getElementById('order-detail-section').innerHTML = `
              <div class="alert alert-danger my-5">
                  <h4>Error Loading Order Details</h4>
                  <p>${error.message || 'Failed to load order details. Please try again later.'}</p>
                  <button class="btn btn-outline-primary mt-3" onclick="showOrders()">
                      <i class="bi bi-arrow-left"></i> Back to Orders
                  </button>
              </div>
          `;
      }
  }
  
  // Setup place order form
  async function setupPlaceOrderForm() {
      try {
          const placeOrderContainer = document.getElementById('place-order-container');
          
          // Fetch shops and customers
          const [shops, customers] = await Promise.all([
              fetchAPI('/shops'),
              fetchAPI('/orders/customers/all')
          ]);
          
          let html = `
              <div class="row">
                  <div class="col-md-7">
                      <div class="card mb-4">
                          <div class="card-header">
                              <h5 class="mb-0">Select Items</h5>
                          </div>
                          <div class="card-body">
                              <div class="mb-3">
                                  <label for="order-shop-select" class="form-label">Select Shop</label>
                                  <select id="order-shop-select" class="form-select">
                                      <option value="">-- Select a Shop --</option>
                                      ${shops.map(shop => `<option value="${shop.shop_id}">${shop.name}</option>`).join('')}
                                  </select>
                              </div>
                              
                              <div id="shop-products" class="mt-4">
                                  <p class="text-muted">Please select a shop to view available products.</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-5">
                      <div class="card mb-4">
                          <div class="card-header">
                              <h5 class="mb-0">Order Summary</h5>
                          </div>
                          <div class="card-body">
                              <div id="cart-items-container">
                                  <p class="text-muted">Your cart is empty.</p>
                              </div>
                          </div>
                      </div>
                      
                      <div class="card mb-4">
                          <div class="card-header">
                              <h5 class="mb-0">Customer Information</h5>
                          </div>
                          <div class="card-body">
                              <div class="mb-3">
                                  <label for="customer-select" class="form-label">Select Customer</label>
                                  <select id="customer-select" class="form-select">
                                      <option value="">-- Select a Customer --</option>
                                      ${customers.map(customer => 
                                          `<option value="${customer.customer_id}">${customer.first_name} ${customer.last_name} (${customer.hostel}, ${customer.room_number})</option>`
                                      ).join('')}
                                  </select>
                              </div>
                              <div class="mb-3">
                                  <button id="new-customer-btn" class="btn btn-outline-primary btn-sm">
                                      <i class="bi bi-plus-circle"></i> New Customer
                                  </button>
                              </div>
                              
                              <div id="selected-customer-info" class="d-none border p-3 rounded bg-light mt-3">
                                  <!-- Selected customer information will be displayed here -->
                              </div>
                          </div>
                      </div>
                      
                      <div class="card mb-4">
                          <div class="card-header">
                              <h5 class="mb-0">Order Details</h5>
                          </div>
                          <div class="card-body">
                              <div class="mb-3">
                                  <label for="payment-method" class="form-label">Payment Method</label>
                                  <select id="payment-method" class="form-select">
                                      <option value="Cash">Cash</option>
                                      <option value="Mobile Banking">Mobile Banking</option>
                                      <option value="Card">Credit/Debit Card</option>
                                  </select>
                              </div>
                              <div class="mb-3">
                                  <label for="special-instructions" class="form-label">Special Instructions</label>
                                  <textarea id="special-instructions" class="form-control" rows="3" placeholder="Any special instructions for this order..."></textarea>
                              </div>
                          </div>
                      </div>
                      
                      <button id="place-order-btn" class="btn btn-primary btn-lg w-100 mb-3" disabled>
                          <i class="bi bi-check-circle"></i> Place Order
                      </button>
                      
                      <button id="clear-cart-btn" class="btn btn-outline-secondary w-100">
                          <i class="bi bi-trash"></i> Clear Cart
                      </button>
                  </div>
              </div>
          `;
          
          placeOrderContainer.innerHTML = html;
          
          // Load products when shop is selected
          document.getElementById('order-shop-select').addEventListener('change', async function() {
              const shopId = this.value;
              const shopProductsContainer = document.getElementById('shop-products');
              
              if (!shopId) {
                  shopProductsContainer.innerHTML = '<p class="text-muted">Please select a shop to view available products.</p>';
                  return;
              }
              
              shopProductsContainer.innerHTML = `
                  <div class="text-center">
                      <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                      </div>
                  </div>
              `;
              
              try {
                  const products = await fetchAPI(`/shops/${shopId}/products`);
                  
                  if (products.length === 0) {
                      shopProductsContainer.innerHTML = '<div class="alert alert-info">No products available for this shop.</div>';
                      return;
                  }
                  
                  let html = '<div class="row">';
                  
                  products.filter(p => p.is_available).forEach(product => {
                      html += `
                          <div class="col-md-6 mb-3">
                              <div class="card h-100">
                                  <div class="card-body">
                                      <h6 class="card-title">${product.name}</h6>
                                      <p class="card-text small">${product.description || 'No description available.'}</p>
                                      <div class="d-flex justify-content-between align-items-center">
                                          <span class="fw-bold text-primary">${formatCurrency(product.price)}</span>
                                          <button class="btn btn-sm btn-outline-primary add-to-cart-btn" 
                                                  data-product-id="${product.product_id}" 
                                                  data-product-name="${product.name}" 
                                                  data-product-price="${product.price}">
                                              <i class="bi bi-cart-plus"></i> Add
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      `;
                  });
                  
                  html += '</div>';
                  shopProductsContainer.innerHTML = html;
                  
                  // Add event listeners to add to cart buttons
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
                          
                          // Enable place order button if cart has items and customer is selected
                          updatePlaceOrderButton();
                      });
                  });
                  
              } catch (error) {
                  console.error(`Error loading products for shop ID ${shopId}:`, error);
                  shopProductsContainer.innerHTML = '<div class="alert alert-danger">Failed to load products. Please try again later.</div>';
              }
          });
          
          // Customer selection handler
          document.getElementById('customer-select').addEventListener('change', function() {
              const customerId = this.value;
              const selectedCustomerInfo = document.getElementById('selected-customer-info');
              
              if (!customerId) {
                  selectedCustomerInfo.classList.add('d-none');
                  return;
              }
              
              const selectedCustomer = customers.find(c => c.customer_id == customerId);
              
              if (selectedCustomer) {
                  selectedCustomerInfo.classList.remove('d-none');
                  selectedCustomerInfo.innerHTML = `
                      <h6>${selectedCustomer.first_name} ${selectedCustomer.last_name}</h6>
                      <p class="mb-1"><i class="bi bi-telephone"></i> ${selectedCustomer.phone || 'No phone number'}</p>
                      <p class="mb-1"><i class="bi bi-house"></i> ${selectedCustomer.hostel}, ${selectedCustomer.room_number}</p>
                  `;
              }
              
              // Enable place order button if cart has items and customer is selected
              updatePlaceOrderButton();
          });
          
          // New customer button
          document.getElementById('new-customer-btn').addEventListener('click', function() {
              showNewCustomerForm();
          });
          
          // Place order button
          document.getElementById('place-order-btn').addEventListener('click', async function() {
              if (cartItems.length === 0) {
                  showErrorMessage('Your cart is empty. Please add items to your order.');
                  return;
              }
              
              const customerId = document.getElementById('customer-select').value;
              if (!customerId) {
                  showErrorMessage('Please select a customer or create a new one.');
                  return;
              }
              
              try {
                  const orderData = {
                      customer_id: customerId,
                      products: cartItems.map(item => ({
                          product_id: item.id,
                          quantity: item.quantity
                      })),
                      payment_method: document.getElementById('payment-method').value,
                      special_instructions: document.getElementById('special-instructions').value
                  };
                  
                  // Create the order
                  const result = await fetchAPI('/orders', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(orderData)
                  });
                  
                  // Clear cart and show success message
                  clearCart();
                  
                  // Show success message and redirect to active orders
                  showSuccessMessage(`Order #${result.order_id} has been placed successfully!`);
                  
                  // Reset form and navigate to active orders
                  document.getElementById('order-shop-select').value = '';
                  document.getElementById('shop-products').innerHTML = '<p class="text-muted">Please select a shop to view available products.</p>';
                  document.getElementById('customer-select').value = '';
                  document.getElementById('selected-customer-info').classList.add('d-none');
                  document.getElementById('special-instructions').value = '';
                  
                  // Switch to active orders tab
                  document.getElementById('active-orders-tab').click();
                  
                  // Reload active orders
                  loadActiveOrders();
                  
              } catch (error) {
                  console.error('Error placing order:', error);
                  showErrorMessage('Failed to place order. Please try again.');
              }
          });
          
          // Clear cart button
          document.getElementById('clear-cart-btn').addEventListener('click', function() {
              if (cartItems.length === 0) {
                  showErrorMessage('Your cart is already empty.');
                  return;
              }
              
              showConfirmationDialog(
                  'Clear Cart',
                  'Are you sure you want to clear all items from your cart?',
                  function() {
                      clearCart();
                      updatePlaceOrderButton();
                  }
              );
          });
          
      } catch (error) {
          console.error('Error setting up place order form:', error);
          document.getElementById('place-order-container').innerHTML = 
              '<div class="alert alert-danger">Failed to load order form. Please try again later.</div>';
      }
  }
  
  // Show new customer form
  function showNewCustomerForm() {
      const modalTitle = document.getElementById('appModalLabel');
      const modalBody = document.getElementById('app-modal-body');
      const confirmBtn = document.getElementById('modal-confirm-btn');
      
      modalTitle.textContent = 'Add New Customer';
      
      modalBody.innerHTML = `
          <form id="new-customer-form">
              <div class="row">
                  <div class="col-md-6 mb-3">
                      <label for="first-name" class="form-label">First Name*</label>
                      <input type="text" class="form-control" id="first-name" required>
                  </div>
                  <div class="col-md-6 mb-3">
                      <label for="last-name" class="form-label">Last Name*</label>
                      <input type="text" class="form-control" id="last-name" required>
                  </div>
              </div>
              <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="email">
              </div>
              <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number*</label>
                  <input type="tel" class="form-control" id="phone" required>
              </div>
              <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <input type="text" class="form-control" id="address">
              </div>
              <div class="row">
                  <div class="col-md-6 mb-3">
                      <label for="hostel" class="form-label">Hostel*</label>
                      <input type="text" class="form-control" id="hostel" required>
                  </div>
                  <div class="col-md-6 mb-3">
                      <label for="room-number" class="form-label">Room Number*</label>
                      <input type="text" class="form-control" id="room-number" required>
                  </div>
              </div>
              <p class="text-muted small">Fields marked with * are required</p>
          </form>
      `;
      
      confirmBtn.style.display = 'block';
      confirmBtn.textContent = 'Save Customer';
      
      // Remove any existing event listeners
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      
      // Add new event listener
      newConfirmBtn.addEventListener('click', async function() {
          const form = document.getElementById('new-customer-form');
          
          // Basic form validation
          if (!form.checkValidity()) {
              form.reportValidity();
              return;
          }
          
          try {
              const customerData = {
                  first_name: document.getElementById('first-name').value,
                  last_name: document.getElementById('last-name').value,
                  email: document.getElementById('email').value,
                  phone: document.getElementById('phone').value,
                  address: document.getElementById('address').value,
                  hostel: document.getElementById('hostel').value,
                  room_number: document.getElementById('room-number').value
              };
              
              // Create the customer
              const result = await fetchAPI('/orders/customers', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(customerData)
              });
              
              // Close modal
              appModal.hide();
              
              // Show success message
              showSuccessMessage(`Customer "${result.first_name} ${result.last_name}" has been added successfully.`);
              
              // Refresh customer select options
              const customers = await fetchAPI('/orders/customers/all');
              const customerSelect = document.getElementById('customer-select');
              
              customerSelect.innerHTML = `
                  <option value="">-- Select a Customer --</option>
                  ${customers.map(customer => 
                      `<option value="${customer.customer_id}">${customer.first_name} ${customer.last_name} (${customer.hostel}, ${customer.room_number})</option>`
                  ).join('')}
              `;
              
              // Select the new customer
              customerSelect.value = result.customer_id;
              
              // Trigger change event to update the customer info display
              customerSelect.dispatchEvent(new Event('change'));
              
          } catch (error) {
              console.error('Error creating customer:', error);
              showErrorMessage('Failed to create customer. Please try again.');
          }
      });
      
      appModal.show();
  }
  
  // Update the place order button state
  function updatePlaceOrderButton() {
      const placeOrderBtn = document.getElementById('place-order-btn');
      if (!placeOrderBtn) return;
      
      const hasItems = cartItems.length > 0;
      const hasCustomer = document.getElementById('customer-select').value !== '';
      
      placeOrderBtn.disabled = !(hasItems && hasCustomer);
  }
// Add this to orders.js to debug delivery creation
async function debugDeliveryCreation() {
    try {
        console.log("Checking delivery creation...");
        // Check if deliveries exist for the latest order
        const orders = await fetchAPI('/orders');
        if (orders && orders.length > 0) {
            const latestOrder = orders[0];
            console.log("Latest order:", latestOrder);
            
            // Check if a delivery exists for this order
            const deliveries = await fetchAPI('/delivery');
            console.log("All deliveries:", deliveries);
            
            const orderDelivery = deliveries.find(d => d.order_id === latestOrder.order_id);
            console.log("Delivery for latest order:", orderDelivery);
            
            if (!orderDelivery) {
                console.error("No delivery found for latest order!");
            }
        }
    } catch (error) {
        console.error("Error debugging delivery creation:", error);
    }
}
