
// main.js - Main JavaScript file for GIKIHub application

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3000/api';

// App modal reference
const appModal = new bootstrap.Modal(document.getElementById('app-modal'));

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showErrorMessage(error.message);
        throw error;
    }
}

// Show error message
function showErrorMessage(message) {
    const modalTitle = document.getElementById('appModalLabel');
    const modalBody = document.getElementById('app-modal-body');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    modalTitle.textContent = 'Error';
    modalBody.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    confirmBtn.style.display = 'none';
    
    appModal.show();
}

// Show success message
function showSuccessMessage(message) {
    const modalTitle = document.getElementById('appModalLabel');
    const modalBody = document.getElementById('app-modal-body');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    modalTitle.textContent = 'Success';
    modalBody.innerHTML = `<div class="alert alert-success">${message}</div>`;
    confirmBtn.style.display = 'none';
    
    appModal.show();
}

// Show confirmation dialog
function showConfirmationDialog(title, message, confirmCallback) {
    const modalTitle = document.getElementById('appModalLabel');
    const modalBody = document.getElementById('app-modal-body');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = message;
    confirmBtn.style.display = 'block';
    
    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', () => {
        appModal.hide();
        confirmCallback();
    });
    
    appModal.show();
}

// Format currency
function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount).toFixed(2);
}

// Format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
}

// Get status badge HTML
function getStatusBadge(status) {
    const badgeClass = `status-${status.toLowerCase()}`;
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Navigation handlers
    document.getElementById('nav-home').addEventListener('click', showHome);
    document.getElementById('nav-shops').addEventListener('click', showShops);
    document.getElementById('nav-orders').addEventListener('click', showOrders);
    document.getElementById('nav-delivery').addEventListener('click', showDelivery);
    document.getElementById('nav-admin').addEventListener('click', showAdmin);
    
    // Home page buttons
    document.getElementById('explore-shops-btn').addEventListener('click', showShops);
    document.getElementById('shops-card-btn').addEventListener('click', showShops);
    document.getElementById('orders-card-btn').addEventListener('click', showOrders);
    document.getElementById('delivery-card-btn').addEventListener('click', showDelivery);
    
    // Load home page data
    loadPopularShops();
    loadRecentOrders();
    
    // Test database connection
    testDatabaseConnection();
});

// Test database connection
async function testDatabaseConnection() {
    try {
        const response = await fetchAPI('/test-db');
        console.log('Database connection successful:', response);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

// Load popular shops
async function loadPopularShops() {
    try {
        const shops = await fetchAPI('/shops');
        const popularShopsContainer = document.getElementById('popular-shops-list');
        
        if (shops.length === 0) {
            popularShopsContainer.innerHTML = '<p class="text-muted">No shops found.</p>';
            return;
        }
        
        // Display top 5 shops (or all if less than 5)
        const topShops = shops.slice(0, 5);
        
        let html = '<ul class="list-group">';
        topShops.forEach(shop => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-shop me-2"></i>
                        <a href="#" class="shop-link" data-shop-id="${shop.shop_id}">${shop.name}</a>
                        <span class="badge bg-secondary ms-2">${shop.shop_type}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-primary view-shop-btn" data-shop-id="${shop.shop_id}">
                        View <i class="bi bi-arrow-right"></i>
                    </button>
                </li>
            `;
        });
        html += '</ul>';
        
        popularShopsContainer.innerHTML = html;
        
        // Add event listeners for shop links and buttons
        document.querySelectorAll('.shop-link, .view-shop-btn').forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                const shopId = this.getAttribute('data-shop-id');
                loadShopDetails(shopId);
            });
        });
        
    } catch (error) {
        console.error('Error loading popular shops:', error);
        document.getElementById('popular-shops-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load shops.</div>';
    }
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const orders = await fetchAPI('/orders?status=all');
        const recentOrdersContainer = document.getElementById('recent-orders-list');
        
        if (orders.length === 0) {
            recentOrdersContainer.innerHTML = '<p class="text-muted">No orders found.</p>';
            return;
        }
        
        // Display 5 most recent orders
        const recentOrders = orders.slice(0, 5);
        
        let html = '<ul class="list-group">';
        recentOrders.forEach(order => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Order #${order.order_id}</strong>
                        <small class="text-muted ms-2">${formatDate(order.order_date)}</small>
                        <div>${getStatusBadge(order.status)}</div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${formatCurrency(order.total_amount)}</div>
                        <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order.order_id}">
                            Details <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </li>
            `;
        });
        html += '</ul>';
        
        recentOrdersContainer.innerHTML = html;
        
        // Add event listeners for order buttons
        document.querySelectorAll('.view-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                loadOrderDetails(orderId);
            });
        });
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recent-orders-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load recent orders.</div>';
    }
}

// Navigation functions
function showHome() {
    hideAllSections();
    document.getElementById('home-section').classList.remove('d-none');
    setActiveNavItem('nav-home');
    
    // Refresh home page data
    loadPopularShops();
    loadRecentOrders();
}

function showShops() {
    hideAllSections();
    document.getElementById('shops-section').classList.remove('d-none');
    setActiveNavItem('nav-shops');
    
    // Load shops data
    loadShops();
}

function showOrders() {
    hideAllSections();
    document.getElementById('orders-section').classList.remove('d-none');
    setActiveNavItem('nav-orders');
    
    // Load orders data
    loadActiveOrders();
    loadCompletedOrders();
    setupPlaceOrderForm();
}

function showDelivery() {
    hideAllSections();
    document.getElementById('delivery-section').classList.remove('d-none');
    setActiveNavItem('nav-delivery');
    
    // Load delivery data
    loadDeliveries();
}

function showAdmin() {
    hideAllSections();
    document.getElementById('admin-section').classList.remove('d-none');
    setActiveNavItem('nav-admin');
    
    // Load admin data
    setupAdminDashboard();
}

// Helper functions for navigation
function hideAllSections() {
    const sections = [
        'home-section', 
        'shops-section', 
        'shop-detail-section', 
        'products-section',
        'orders-section', 
        'order-detail-section', 
        'delivery-section', 
        'admin-section'
    ];
    
    sections.forEach(section => {
        document.getElementById(section).classList.add('d-none');
    });
}

function setActiveNavItem(activeId) {
    const navItems = [
        'nav-home',
        'nav-shops',
        'nav-orders',
        'nav-delivery',
        'nav-admin'
    ];
    
    navItems.forEach(item => {
        const element = document.getElementById(item);
        if (item === activeId) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

// Setup Admin Dashboard
function setupAdminDashboard() {
    // Set up tabs for each management section
    document.getElementById('manage-shops-tab').addEventListener('click', setupShopsManagement);
    document.getElementById('manage-products-tab').addEventListener('click', setupProductsManagement);
    document.getElementById('manage-orders-tab').addEventListener('click', setupOrdersManagement);
    document.getElementById('manage-delivery-tab').addEventListener('click', setupDeliveryManagement);
    document.getElementById('reports-tab').addEventListener('click', setupReportsManagement);
    
    // Load shops management by default
    setupShopsManagement();
}

// Add these new admin management functions
async function setupShopsManagement() {
    try {
        const manageShopsContainer = document.getElementById('manage-shops-container');
        manageShopsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        const shops = await fetchAPI('/shops');
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>Manage Shops</h3>
                <button class="btn btn-success" id="add-shop-btn">
                    <i class="bi bi-plus-circle"></i> Add New Shop
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Contact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        shops.forEach(shop => {
            html += `
                <tr>
                    <td>${shop.shop_id}</td>
                    <td>${shop.name}</td>
                    <td>${shop.shop_type}</td>
                    <td>${shop.location || 'N/A'}</td>
                    <td>${shop.contact_number || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-shop-btn" data-shop-id="${shop.shop_id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-shop-btn" data-shop-id="${shop.shop_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        manageShopsContainer.innerHTML = html;
    
    // Add this new code to attach event listener to the Add New Shop button
    document.getElementById('add-shop-btn').addEventListener('click', showAddShopForm);
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-shop-btn').forEach(button => {
        button.addEventListener('click', function() {
            const shopId = this.getAttribute('data-shop-id');
            showEditShopForm(shopId);
        });
    });
    
    document.querySelectorAll('.delete-shop-btn').forEach(button => {
        button.addEventListener('click', function() {
            const shopId = this.getAttribute('data-shop-id');
            showDeleteShopConfirmation(shopId);
        });
    });


// Function to show the add shop form
function showAddShopForm() {
    const modalTitle = document.getElementById('appModalLabel');
    const modalBody = document.getElementById('app-modal-body');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    modalTitle.textContent = 'Add New Shop';
    
    modalBody.innerHTML = `
        <form id="add-shop-form">
            <div class="mb-3">
                <label for="shop-name" class="form-label">Shop Name*</label>
                <input type="text" class="form-control" id="shop-name" required>
            </div>
            <div class="mb-3">
                <label for="shop-type" class="form-label">Shop Type*</label>
                <select class="form-select" id="shop-type" required>
                    <option value="">-- Select Shop Type --</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Stationery">Stationery</option>
                    <option value="General Store">General Store</option>
                    <option value="Fruit Shop">Fruit Shop</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="shop-location" class="form-label">Location</label>
                <input type="text" class="form-control" id="shop-location">
            </div>
            <div class="mb-3">
                <label for="shop-contact" class="form-label">Contact Number</label>
                <input type="text" class="form-control" id="shop-contact">
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="shop-opening" class="form-label">Opening Time</label>
                    <input type="time" class="form-control" id="shop-opening">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="shop-closing" class="form-label">Closing Time</label>
                    <input type="time" class="form-control" id="shop-closing">
                </div>
            </div>
            <div class="mb-3">
                <label for="shop-description" class="form-label">Description</label>
                <textarea class="form-control" id="shop-description" rows="3"></textarea>
            </div>
        </form>
    `;
    
    confirmBtn.textContent = 'Add Shop';
    confirmBtn.style.display = 'block';
    
    // Remove existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async function() {
        const form = document.getElementById('add-shop-form');
        
        // Basic validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        try {
            const shopData = {
                name: document.getElementById('shop-name').value,
                shop_type: document.getElementById('shop-type').value,
                location: document.getElementById('shop-location').value,
                contact_number: document.getElementById('shop-contact').value,
                opening_time: document.getElementById('shop-opening').value,
                closing_time: document.getElementById('shop-closing').value,
                description: document.getElementById('shop-description').value
            };
            
            // Send API request to create shop
            const result = await fetchAPI('/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shopData)
            });
            
            // Close modal and show success message
            appModal.hide();
            showSuccessMessage(`Shop "${result.name}" has been added successfully`);
            
            // Reload shops list
            setupShopsManagement();
            
        } catch (error) {
            console.error('Error adding shop:', error);
            showErrorMessage('Failed to add shop. Please try again.');
        }
    });
    
    appModal.show();
}

// Function to show the edit shop form
async function showEditShopForm(shopId) {
    try {
        // Fetch current shop data
        const shop = await fetchAPI(`/shops/${shopId}`);
        
        const modalTitle = document.getElementById('appModalLabel');
        const modalBody = document.getElementById('app-modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        
        modalTitle.textContent = 'Edit Shop';
        
        modalBody.innerHTML = `
            <form id="edit-shop-form">
                <div class="mb-3">
                    <label for="shop-name" class="form-label">Shop Name*</label>
                    <input type="text" class="form-control" id="shop-name" value="${shop.name}" required>
                </div>
                <div class="mb-3">
                    <label for="shop-type" class="form-label">Shop Type*</label>
                    <select class="form-select" id="shop-type" required>
                        <option value="Restaurant" ${shop.shop_type === 'Restaurant' ? 'selected' : ''}>Restaurant</option>
                        <option value="Cafe" ${shop.shop_type === 'Cafe' ? 'selected' : ''}>Cafe</option>
                        <option value="Stationery" ${shop.shop_type === 'Stationery' ? 'selected' : ''}>Stationery</option>
                        <option value="General Store" ${shop.shop_type === 'General Store' ? 'selected' : ''}>General Store</option>
                        <option value="Fruit Shop" ${shop.shop_type === 'Fruit Shop' ? 'selected' : ''}>Fruit Shop</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="shop-location" class="form-label">Location</label>
                    <input type="text" class="form-control" id="shop-location" value="${shop.location || ''}">
                </div>
                <div class="mb-3">
                    <label for="shop-contact" class="form-label">Contact Number</label>
                    <input type="text" class="form-control" id="shop-contact" value="${shop.contact_number || ''}">
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="shop-opening" class="form-label">Opening Time</label>
                        <input type="time" class="form-control" id="shop-opening" value="${shop.opening_time || ''}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="shop-closing" class="form-label">Closing Time</label>
                        <input type="time" class="form-control" id="shop-closing" value="${shop.closing_time || ''}">
                    </div>
                </div>
                <div class="mb-3">
                    <label for="shop-description" class="form-label">Description</label>
                    <textarea class="form-control" id="shop-description" rows="3">${shop.description || ''}</textarea>
                </div>
            </form>
        `;
        
        confirmBtn.textContent = 'Save Changes';
        confirmBtn.style.display = 'block';
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', async function() {
            const form = document.getElementById('edit-shop-form');
            
            // Basic validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            try {
                const shopData = {
                    name: document.getElementById('shop-name').value,
                    shop_type: document.getElementById('shop-type').value,
                    location: document.getElementById('shop-location').value,
                    contact_number: document.getElementById('shop-contact').value,
                    opening_time: document.getElementById('shop-opening').value,
                    closing_time: document.getElementById('shop-closing').value,
                    description: document.getElementById('shop-description').value
                };
                
                // Send API request to update shop
                const result = await fetchAPI(`/shops/${shopId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shopData)
                });
                
                // Close modal and show success message
                appModal.hide();
                showSuccessMessage(`Shop "${result.name}" has been updated successfully`);
                
                // Reload shops list
                setupShopsManagement();
                
            } catch (error) {
                console.error('Error updating shop:', error);
                showErrorMessage('Failed to update shop. Please try again.');
            }
        });
        
        appModal.show();
        
    } catch (error) {
        console.error('Error loading shop details:', error);
        showErrorMessage('Failed to load shop details. Please try again.');
    }
}

// Function to show delete shop confirmation
function showDeleteShopConfirmation(shopId) {
    showConfirmationDialog(
        'Delete Shop',
        'Are you sure you want to delete this shop? This action cannot be undone and will remove all associated products.',
        async function() {
            try {
                // Send API request to delete shop
                await fetchAPI(`/shops/${shopId}`, {
                    method: 'DELETE'
                });
                
                showSuccessMessage('Shop deleted successfully');
                
                // Reload shops list
                setupShopsManagement();
                
            } catch (error) {
                console.error('Error deleting shop:', error);
                showErrorMessage('Failed to delete shop. Make sure there are no active orders for this shop.');
            }
        }
    );
}
        
        
    }
     catch (error) {
        console.error('Error setting up shops management:', error);
        document.getElementById('manage-shops-container').innerHTML = 
            '<div class="alert alert-danger">Failed to load shops data. Please try again later.</div>';
    }
}

async function setupProductsManagement() {
    try {
        const manageProductsContainer = document.getElementById('manage-products-container');
        manageProductsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        const products = await fetchAPI('/products');
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>Manage Products</h3>
                <button class="btn btn-success" id="add-product-btn">
                    <i class="bi bi-plus-circle"></i> Add New Product
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Shop</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        products.forEach(product => {
            html += `
                <tr>
                    <td>${product.product_id}</td>
                    <td>${product.name}</td>
                    <td>${product.shop_name}</td>
                    <td>${product.category_name || 'Uncategorized'}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>
                        <span class="badge ${product.is_available ? 'bg-success' : 'bg-danger'}">
                            ${product.is_available ? 'Available' : 'Unavailable'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product-btn" data-product-id="${product.product_id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-product-id="${product.product_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        manageProductsContainer.innerHTML = html;
        // Add the event listener for the "Add New Product" button
    // ... existing code ...
    
    // Add this new code to attach event listener to the Add New Product button
    document.getElementById('add-product-btn').addEventListener('click', showAddProductForm);
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            showEditProductForm(productId);
        });
    });
    
    document.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            showDeleteProductConfirmation(productId);
        });
    });

// Function to show the add product form
async function showAddProductForm() {
    try {
        // Fetch shops and categories
        const [shops, categories] = await Promise.all([
            fetchAPI('/shops'),
            fetchAPI('/products/categories')
        ]);
        
        const modalTitle = document.getElementById('appModalLabel');
        const modalBody = document.getElementById('app-modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        
        modalTitle.textContent = 'Add New Product';
        
        modalBody.innerHTML = `
            <form id="add-product-form">
                <div class="mb-3">
                    <label for="product-name" class="form-label">Product Name*</label>
                    <input type="text" class="form-control" id="product-name" required>
                </div>
                <div class="mb-3">
                    <label for="product-shop" class="form-label">Shop*</label>
                    <select class="form-select" id="product-shop" required>
                        <option value="">-- Select Shop --</option>
                        ${shops.map(shop => `<option value="${shop.shop_id}">${shop.name}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="product-category" class="form-label">Category</label>
                    <select class="form-select" id="product-category">
                        <option value="">-- Select Category --</option>
                        ${categories.map(cat => `<option value="${cat.category_id}">${cat.name}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="product-price" class="form-label">Price*</label>
                    <div class="input-group">
                        <span class="input-group-text">Rs.</span>
                        <input type="number" class="form-control" id="product-price" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="product-description" class="form-label">Description</label>
                    <textarea class="form-control" id="product-description" rows="3"></textarea>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="product-available" checked>
                    <label class="form-check-label" for="product-available">
                        Available for sale
                    </label>
                </div>
            </form>
        `;
        
        confirmBtn.textContent = 'Add Product';
        confirmBtn.style.display = 'block';
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', async function() {
            const form = document.getElementById('add-product-form');
            
            // Basic validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            try {
                const productData = {
                    name: document.getElementById('product-name').value,
                    shop_id: document.getElementById('product-shop').value,
                    category_id: document.getElementById('product-category').value || null,
                    price: document.getElementById('product-price').value,
                    description: document.getElementById('product-description').value,
                    is_available: document.getElementById('product-available').checked
                };
                
                // Send API request to create product
                const result = await fetchAPI('/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                
                // Close modal and show success message
                appModal.hide();
                showSuccessMessage(`Product "${result.name}" has been added successfully`);
                
                // Reload products list
                setupProductsManagement();
                
            } catch (error) {
                console.error('Error adding product:', error);
                showErrorMessage('Failed to add product. Please try again.');
            }
        });
        
        appModal.show();
        
    } catch (error) {
        console.error('Error preparing add product form:', error);
        showErrorMessage('Failed to prepare product form. Please try again.');
    }
}

// Function to show the edit product form
async function showEditProductForm(productId) {
    try {
        // Fetch product data, shops, and categories
        const [product, shops, categories] = await Promise.all([
            fetchAPI(`/products/${productId}`),
            fetchAPI('/shops'),
            fetchAPI('/products/categories')
        ]);
        
        const modalTitle = document.getElementById('appModalLabel');
        const modalBody = document.getElementById('app-modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        
        modalTitle.textContent = 'Edit Product';
        
        modalBody.innerHTML = `
            <form id="edit-product-form">
                <div class="mb-3">
                    <label for="product-name" class="form-label">Product Name*</label>
                    <input type="text" class="form-control" id="product-name" value="${product.name}" required>
                </div>
                <div class="mb-3">
                    <label for="product-shop" class="form-label">Shop*</label>
                    <select class="form-select" id="product-shop" required>
                        <option value="">-- Select Shop --</option>
                        ${shops.map(shop => 
                            `<option value="${shop.shop_id}" ${shop.shop_id === product.shop_id ? 'selected' : ''}>${shop.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="product-category" class="form-label">Category</label>
                    <select class="form-select" id="product-category">
                        <option value="">-- Select Category --</option>
                        ${categories.map(cat => 
                            `<option value="${cat.category_id}" ${cat.category_id === product.category_id ? 'selected' : ''}>${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="product-price" class="form-label">Price*</label>
                    <div class="input-group">
                        <span class="input-group-text">Rs.</span>
                        <input type="number" class="form-control" id="product-price" min="0" step="0.01" value="${product.price}" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="product-description" class="form-label">Description</label>
                    <textarea class="form-control" id="product-description" rows="3">${product.description || ''}</textarea>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="product-available" ${product.is_available ? 'checked' : ''}>
                    <label class="form-check-label" for="product-available">
                        Available for sale
                    </label>
                </div>
            </form>
        `;
        
        confirmBtn.textContent = 'Save Changes';
        confirmBtn.style.display = 'block';
        
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', async function() {
            const form = document.getElementById('edit-product-form');
            
            // Basic validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            try {
                const productData = {
                    name: document.getElementById('product-name').value,
                    shop_id: document.getElementById('product-shop').value,
                    category_id: document.getElementById('product-category').value || null,
                    price: document.getElementById('product-price').value,
                    description: document.getElementById('product-description').value,
                    is_available: document.getElementById('product-available').checked
                };
                
                // Send API request to update product
                const result = await fetchAPI(`/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                
                // Close modal and show success message
                appModal.hide();
                showSuccessMessage(`Product "${result.name}" has been updated successfully`);
                
                // Reload products list
                setupProductsManagement();
                
            } catch (error) {
                console.error('Error updating product:', error);
                showErrorMessage('Failed to update product. Please try again.');
            }
        });
        
        appModal.show();
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showErrorMessage('Failed to load product details. Please try again.');
    }
}

// Function to show delete product confirmation
function showDeleteProductConfirmation(productId) {
    showConfirmationDialog(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        async function() {
            try {
                // Send API request to delete product
                await fetchAPI(`/products/${productId}`, {
                    method: 'DELETE'
                });
                
                showSuccessMessage('Product deleted successfully');
                
                // Reload products list
                setupProductsManagement();
                
            } catch (error) {
                console.error('Error deleting product:', error);
                showErrorMessage('Failed to delete product. It may be associated with existing orders.');
            }
        }
    );
}
        
    } catch (error) {
        console.error('Error setting up products management:', error);
        document.getElementById('manage-products-container').innerHTML = 
            '<div class="alert alert-danger">Failed to load products data. Please try again later.</div>';
    }
}

async function setupOrdersManagement() {
    try {
        const manageOrdersContainer = document.getElementById('manage-orders-container');
        manageOrdersContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        const orders = await fetchAPI('/orders');
        
        let html = `
            <div class="mb-3">
                <h3>Manage Orders</h3>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        orders.forEach(order => {
            html += `
                <tr>
                    <td>${order.order_id}</td>
                    <td>${order.customer_name}</td>
                    <td>${formatDate(order.order_date)}</td>
                    <td>${formatCurrency(order.total_amount)}</td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-order-btn" data-order-id="${order.order_id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <div class="dropdown d-inline-block">
                            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                Update
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item update-order-status" data-order-id="${order.order_id}" data-status="Pending" href="#">Mark as Pending</a></li>
                                <li><a class="dropdown-item update-order-status" data-order-id="${order.order_id}" data-status="Processing" href="#">Mark as Processing</a></li>
                                <li><a class="dropdown-item update-order-status" data-order-id="${order.order_id}" data-status="Completed" href="#">Mark as Completed</a></li>
                                <li><a class="dropdown-item update-order-status" data-order-id="${order.order_id}" data-status="Cancelled" href="#">Mark as Cancelled</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        manageOrdersContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.view-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                loadOrderDetails(orderId);
            });
        });
        
        document.querySelectorAll('.update-order-status').forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                
                const orderId = this.getAttribute('data-order-id');
                const status = this.getAttribute('data-status');
                
                try {
                    await fetchAPI(`/orders/${orderId}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status })
                    });
                    
                    showSuccessMessage(`Order #${orderId} status updated to ${status}`);
                    setupOrdersManagement(); // Reload the table
                } catch (error) {
                    console.error('Error updating order status:', error);
                    showErrorMessage('Failed to update order status');
                }
            });
        });
        
    } catch (error) {
        console.error('Error setting up orders management:', error);
        document.getElementById('manage-orders-container').innerHTML = 
            '<div class="alert alert-danger">Failed to load orders data. Please try again later.</div>';
    }
}

function setupDeliveryManagement() {
    const manageDeliveryContainer = document.getElementById('manage-delivery-container');
    
    manageDeliveryContainer.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Active Deliveries</h5>
                    </div>
                    <div class="card-body">
                        <div id="admin-active-deliveries">
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Completed Deliveries</h5>
                    </div>
                    <div class="card-body">
                        <div id="admin-completed-deliveries">
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load the data
    loadAdminActiveDeliveries();
    loadAdminCompletedDeliveries();
}

function setupReportsManagement() {
    const reportsContainer = document.getElementById('reports-container');
    
    reportsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Shop Sales Report</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="report-shop" class="form-label">Select Shop</label>
                            <select id="report-shop" class="form-select">
                                <option value="">All Shops</option>
                                <!-- Shops will be loaded dynamically -->
                            </select>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="report-start-date" class="form-label">Start Date</label>
                                <input type="date" id="report-start-date" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label for="report-end-date" class="form-label">End Date</label>
                                <input type="date" id="report-end-date" class="form-control">
                            </div>
                        </div>
                        <button id="generate-sales-report" class="btn btn-primary">
                            <i class="bi bi-bar-chart"></i> Generate Report
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Popular Products Report</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="popular-shop" class="form-label">Select Shop</label>
                            <select id="popular-shop" class="form-select">
                                <option value="">All Shops</option>
                                <!-- Shops will be loaded dynamically -->
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="product-limit" class="form-label">Number of Products</label>
                            <input type="number" id="product-limit" class="form-control" value="5" min="1" max="20">
                        </div>
                        <button id="generate-popular-report" class="btn btn-primary">
                            <i class="bi bi-trophy"></i> Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Report Results</h5>
                    </div>
                    <div class="card-body">
                        <div id="report-results">
                            <p class="text-muted">Select a report type and generate to see results.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load shops for report dropdowns
    loadShopsForReports();
}

async function loadShopsForReports() {
    try {
        const shops = await fetchAPI('/shops');
        
        const shopSelects = document.querySelectorAll('#report-shop, #popular-shop');
        
        shopSelects.forEach(select => {
            let html = '<option value="">All Shops</option>';
            
            shops.forEach(shop => {
                html += `<option value="${shop.shop_id}">${shop.name}</option>`;
            });
            
            select.innerHTML = html;
        });
        
        // Add event listeners for report generation
        document.getElementById('generate-sales-report').addEventListener('click', generateSalesReport);
        document.getElementById('generate-popular-report').addEventListener('click', generatePopularProductsReport);
        
    } catch (error) {
        console.error('Error loading shops for reports:', error);
    }
}

// Helper functions for reports
async function generateSalesReport() {
    try {
        const shopId = document.getElementById('report-shop').value;
        const startDate = document.getElementById('report-start-date').value || 
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = document.getElementById('report-end-date').value || 
                        new Date().toISOString().split('T')[0];
        
        const resultsContainer = document.getElementById('report-results');
        resultsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating sales report...</p>
            </div>
        `;
        
        // If all shops selected, we need to get data for each shop
        if (!shopId) {
            const shops = await fetchAPI('/shops');
            let totalSales = 0;
            const shopSales = [];
            
            // Get sales for each shop
            for (const shop of shops) {
                const result = await fetchAPI(`/shops/${shop.shop_id}/sales?start_date=${startDate}&end_date=${endDate}`);
                totalSales += parseFloat(result.total_sales);
                shopSales.push({
                    shop_name: shop.name,
                    shop_id: shop.shop_id,
                    total_sales: parseFloat(result.total_sales)
                });
            }
            
            // Sort by sales descending
            shopSales.sort((a, b) => b.total_sales - a.total_sales);
            
            // Generate report HTML
            let html = `
                <h4>Sales Report for All Shops</h4>
                <p><strong>Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>
                <p><strong>Total Sales:</strong> ${formatCurrency(totalSales)}</p>
                
                <div class="table-responsive mt-4">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Shop</th>
                                <th>Total Sales</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            shopSales.forEach(shop => {
                const percentage = totalSales > 0 ? ((shop.total_sales / totalSales) * 100).toFixed(1) : 0;
                
                html += `
                    <tr>
                        <td>${shop.shop_name}</td>
                        <td>${formatCurrency(shop.total_sales)}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            resultsContainer.innerHTML = html;
        } else {
            // Get sales for specific shop
            const shop = await fetchAPI(`/shops/${shopId}`);
            const sales = await fetchAPI(`/shops/${shopId}/sales?start_date=${startDate}&end_date=${endDate}`);
            
            // Generate report HTML
            let html = `
                <h4>Sales Report for ${shop.name}</h4>
                <p><strong>Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>
                <p><strong>Total Sales:</strong> ${formatCurrency(sales.total_sales)}</p>
                
                <div class="alert alert-info mt-4">
                    <i class="bi bi-info-circle"></i> For detailed product breakdown, please use the Popular Products Report.
                </div>
            `;
            
            resultsContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error generating sales report:', error);
        document.getElementById('report-results').innerHTML = 
            '<div class="alert alert-danger">Failed to generate sales report. Please try again later.</div>';
    }
}

async function generatePopularProductsReport() {
    try {
        const shopId = document.getElementById('popular-shop').value;
        const limit = document.getElementById('product-limit').value || 5;
        
        const resultsContainer = document.getElementById('report-results');
        resultsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating popular products report...</p>
            </div>
        `;
        
        if (!shopId) {
            // For all shops, we'll need to combine data
            const shops = await fetchAPI('/shops');
            let allPopularProducts = [];
            
            // Get popular products for each shop
            for (const shop of shops) {
                try {
                    const products = await fetchAPI(`/shops/${shop.shop_id}/popular-products?limit=${limit}`);
                    
                    // Add shop name to each product
                    products.forEach(product => {
                        product.shop_name = shop.name;
                        allPopularProducts.push(product);
                    });
                } catch (err) {
                    console.error(`Error fetching popular products for shop ${shop.shop_id}:`, err);
                }
            }
            
            // Sort by total ordered descending
            allPopularProducts.sort((a, b) => b.total_ordered - a.total_ordered);
            
            // Limit to the top products
            allPopularProducts = allPopularProducts.slice(0, limit);
            
            // Generate report HTML
            let html = `
                <h4>Popular Products Across All Shops</h4>
                <p>Showing top ${limit} most ordered products</p>
                
                <div class="table-responsive mt-4">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Product</th>
                                <th>Shop</th>
                                <th>Total Orders</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            allPopularProducts.forEach((product, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${product.product_name}</td>
                        <td>${product.shop_name}</td>
                        <td>${product.total_ordered}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            resultsContainer.innerHTML = html;
        } else {
            // Get popular products for specific shop
            const shop = await fetchAPI(`/shops/${shopId}`);
            const popularProducts = await fetchAPI(`/shops/${shopId}/popular-products?limit=${limit}`);
            
            // Generate report HTML
            let html = `
                <h4>Popular Products for ${shop.name}</h4>
                <p>Showing top ${limit} most ordered products</p>
            `;
            
            if (popularProducts.length === 0) {
                html += '<div class="alert alert-info mt-3">No order data available for this shop.</div>';
            } else {
                html += `
                    <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Product</th>
                                    <th>Total Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                popularProducts.forEach((product, index) => {
                    html += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${product.product_name}</td>
                            <td>${product.total_ordered}</td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            resultsContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error generating popular products report:', error);
        document.getElementById('report-results').innerHTML = 
            '<div class="alert alert-danger">Failed to generate popular products report. Please try again later.</div>';
    }
}

// Helper function for delivery status badge color
function getDeliveryStatusBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'bg-warning text-dark';
        case 'Assigned': return 'bg-info';
        case 'Out for Delivery': return 'bg-primary';
        case 'Delivered': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const role = document.getElementById('signup-role').value;
    // Here you can also send extra info if wanted (customer_id, etc.)

    const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if (res.ok) {
        alert('Signup Successful! You can now login.');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('signupModal')).hide();
    } else {
        alert(data.error || 'Signup failed!');
    }
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        alert('Login successful! Redirecting...');
        // Save role in localStorage so you can use it for dynamic routing
        localStorage.setItem('user_role', data.user.role);
        localStorage.setItem('username', data.user.username);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal')).hide();
        // Redirect to dashboard according to role
        redirectToRoleSection(data.user.role);
    } else {
        alert(data.error || 'Login failed!');
    }
});

// Function to handle custom post-login redirects (demo version)
// You can customize these sections or show/hide parts of your SPA accordingly
function redirectToRoleSection(role) {
    if (role === 'student') {
        window.location.hash = '#student-dashboard';
        // Or showStudentDashboard();
    } else if (role === 'owner') {
        window.location.hash = '#owner-dashboard';
        // Or showOwnerDashboard();
    } else if (role === 'employee') {
        window.location.hash = '#employee-dashboard';
        // Or showEmployeeDashboard();
    } else {
        window.location.reload(); // fallback
    }
}
