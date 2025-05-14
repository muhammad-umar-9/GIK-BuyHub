
// delivery.js - JavaScript file for delivery-related functionality

// Load all deliveries
async function loadDeliveries() {
    try {
        console.log("Beginning loadDeliveries function");
        // Debug: Log the API call
        console.log("About to fetch deliveries with status=Pending,Assigned");
        
        const deliveryContainer = document.getElementById('delivery-container');
        deliveryContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        // Get active deliveries
        const deliveries = await fetchAPI('/delivery?status=Pending,Assigned');
        console.log("Deliveries API response:", deliveries);
        
        // Don't filter the results - backend already filtered by status
        const activeDeliveries = deliveries;
        console.log("Active deliveries count:", activeDeliveries.length);
        
        if (activeDeliveries.length === 0) {
            deliveryContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> No active deliveries found.
                </div>
                <p class="text-center">
                    <a href="#" onclick="showOrders(); return false;" class="btn btn-primary">
                        <i class="bi bi-cart"></i> Place an Order
                    </a>
                </p>
            `;
            return;
        }
        
        let html = `
            <div class="alert alert-info mb-4">
                <i class="bi bi-info-circle me-2"></i> You have ${activeDeliveries.length} active ${activeDeliveries.length === 1 ? 'delivery' : 'deliveries'}.
            </div>
            
            <div class="row">
        `;
        
        activeDeliveries.forEach(delivery => {
            html += `
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Order #${delivery.order_id}</h5>
                                <span class="badge bg-light text-dark">${delivery.delivery_status}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Ordered:</strong> ${formatDate(delivery.order_date)}</p>
                            <p><strong>Customer:</strong> ${delivery.customer_name || 'Unknown'}</p>
                            <p><strong>Location:</strong> ${delivery.hostel || 'N/A'}, ${delivery.room_number || 'N/A'}</p>
                            <p><strong>Amount:</strong> ${formatCurrency(delivery.total_amount)}</p>
                            <p><strong>Delivery Person:</strong> ${delivery.delivery_person || 'Not assigned yet'}</p>
                            
                            <div class="progress mb-3">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                     role="progressbar" 
                                     style="width: ${getDeliveryProgressPercentage(delivery.delivery_status)}%" 
                                     aria-valuenow="${getDeliveryProgressPercentage(delivery.delivery_status)}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                    ${delivery.delivery_status}
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <button class="btn btn-primary view-delivery-btn" data-delivery-id="${delivery.delivery_id}">
                                    <i class="bi bi-eye"></i> Track Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
            
        // Add completed deliveries section if needed
        html += `
            <div class="mt-4">
                <h4>Completed Deliveries</h4>
                <p class="text-muted">To view your completed deliveries, check the "Completed Orders" section.</p>
                <button class="btn btn-outline-primary" id="view-completed-orders-btn">
                    <i class="bi bi-clock-history"></i> View Completed Orders
                </button>
            </div>
        `;
        
        deliveryContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.view-delivery-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-delivery-id');
                loadDeliveryDetails(deliveryId);
            });
        });
        
        document.getElementById('view-completed-orders-btn').addEventListener('click', function() {
            showOrders();
            document.getElementById('completed-orders-tab').click();
        });
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        document.getElementById('delivery-container').innerHTML = 
            '<div class="alert alert-danger">Failed to load deliveries. Please try again later.</div>';
    }
}

// Get delivery progress percentage based on status
function getDeliveryProgressPercentage(status) {
    switch (status) {
        case 'Pending': return 25;
        case 'Assigned': return 50;
        case 'Out for Delivery': return 75;
        case 'Delivered': return 100;
        case 'Cancelled': return 100;
        default: return 0;
    }
}

// Load delivery details
async function loadDeliveryDetails(deliveryId) {
    try {
        console.log("Loading delivery details for ID:", deliveryId);
        const delivery = await fetchAPI(`/delivery/${deliveryId}`);
        console.log("Delivery details:", delivery);
        
        const modalTitle = document.getElementById('appModalLabel');
        const modalBody = document.getElementById('app-modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        
        modalTitle.textContent = `Delivery for Order #${delivery.order_id}`;
        
        modalBody.innerHTML = `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Delivery Status</h5>
                    <span class="badge ${getDeliveryStatusBadgeClass(delivery.delivery_status)}">${delivery.delivery_status}</span>
                </div>
                
                <div class="progress mb-3">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" 
                         style="width: ${getDeliveryProgressPercentage(delivery.delivery_status)}%" 
                         aria-valuenow="${getDeliveryProgressPercentage(delivery.delivery_status)}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${delivery.delivery_status}
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Delivery Information</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Order Date:</strong> ${formatDate(delivery.order_date)}</p>
                        <p><strong>Delivery Location:</strong> ${delivery.hostel || 'N/A'}, ${delivery.room_number || 'N/A'}</p>
                        <p><strong>Customer:</strong> ${delivery.customer_name || 'Unknown'}</p>
                        <p><strong>Customer Phone:</strong> ${delivery.customer_phone || 'Not provided'}</p>
                        <p><strong>Delivery Person:</strong> ${delivery.delivery_person || 'Not assigned yet'}</p>
                        ${delivery.delivery_person_phone ? 
                            `<p><strong>Delivery Person Phone:</strong> ${delivery.delivery_person_phone}</p>` : ''}
                    </div>
                </div>
        `;
        
        // Check if items exist before rendering them
        if (delivery.items && delivery.items.length > 0) {
            modalBody.innerHTML += `
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Order Items</h6>
                    </div>
                    <div class="card-body">
                        <ul class="list-group">
            `;
            
            // Add order items
            delivery.items.forEach(item => {
                modalBody.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${item.quantity}x</strong> ${item.product_name}
                            <div class="text-muted small">From: ${item.shop_name}</div>
                        </div>
                        <span>${formatCurrency(item.subtotal)}</span>
                    </li>
                `;
            });
            
            modalBody.innerHTML += `
                        </ul>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <strong>Total:</strong>
                            <h5 class="text-primary mb-0">${formatCurrency(delivery.total_amount)}</h5>
                        </div>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML += `
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Order Items</h6>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">No items found for this order.</p>
                    </div>
                </div>
            `;
        }
        
        if (delivery.special_instructions) {
            modalBody.innerHTML += `
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Special Instructions</h6>
                    </div>
                    <div class="card-body">
                        <p>${delivery.special_instructions}</p>
                    </div>
                </div>
            `;
        }
        
        modalBody.innerHTML += '</div>';
        
        // Hide the confirm button
        confirmBtn.style.display = 'none';
        
        appModal.show();
        
    } catch (error) {
        console.error(`Error loading delivery details for ID ${deliveryId}:`, error);
        showErrorMessage('Failed to load delivery details. Please try again later.');
    }
}

// Get delivery status badge class
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

// Setup admin dashboard for delivery management
function setupDeliveryManagement() {
    const deliveryContainer = document.getElementById('manage-delivery-container');
    
    deliveryContainer.innerHTML = `
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
    
    // Load data
    loadAdminActiveDeliveries();
    loadAdminCompletedDeliveries();
}

// Load active deliveries for admin
async function loadAdminActiveDeliveries() {
    try {
        console.log("Loading admin active deliveries");
        const activeDeliveriesContainer = document.getElementById('admin-active-deliveries');
        
        if (!activeDeliveriesContainer) {
            console.error("Container admin-active-deliveries not found");
            return;
        }
        
        // Get pending and assigned deliveries
        const deliveries = await fetchAPI('/delivery?status=Pending,Assigned');
        console.log("Admin active deliveries API response:", deliveries);
        
        if (deliveries.length === 0) {
            activeDeliveriesContainer.innerHTML = '<div class="alert alert-info">No active deliveries found.</div>';
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Delivery Person</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        deliveries.forEach(delivery => {
            html += `
                <tr>
                    <td>${delivery.delivery_id}</td>
                    <td>${delivery.order_id}</td>
                    <td>${delivery.customer_name || 'Unknown'}</td>
                    <td>${delivery.hostel || 'N/A'}, ${delivery.room_number || 'N/A'}</td>
                    <td><span class="badge ${getDeliveryStatusBadgeClass(delivery.delivery_status)}">${delivery.delivery_status}</span></td>
                    <td>${delivery.delivery_person || 'Not assigned'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-delivery-details-btn" data-delivery-id="${delivery.delivery_id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${delivery.delivery_status === 'Pending' ? `
                            <button class="btn btn-sm btn-primary assign-delivery-btn" data-delivery-id="${delivery.delivery_id}">
                                <i class="bi bi-person-check"></i> Assign
                            </button>
                        ` : ''}
                        ${delivery.delivery_status === 'Assigned' ? `
                            <button class="btn btn-sm btn-success complete-delivery-btn" data-delivery-id="${delivery.delivery_id}">
                                <i class="bi bi-check-circle"></i> Complete
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        activeDeliveriesContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.view-delivery-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-delivery-id');
                loadDeliveryDetails(deliveryId);
            });
        });
        
        document.querySelectorAll('.assign-delivery-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-delivery-id');
                showAssignDeliveryPersonForm(deliveryId);
            });
        });
        
        document.querySelectorAll('.complete-delivery-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-delivery-id');
                showCompleteDeliveryForm(deliveryId);
            });
        });
        
    } catch (error) {
        console.error('Error loading active deliveries for admin:', error);
        const activeDeliveriesContainer = document.getElementById('admin-active-deliveries');
        if (activeDeliveriesContainer) {
            activeDeliveriesContainer.innerHTML = 
                '<div class="alert alert-danger">Failed to load active deliveries. Please try again later.</div>';
        }
    }
}

// Show form to assign delivery person
async function showAssignDeliveryPersonForm(deliveryId) {
    try {
        // Fetch available delivery personnel
        const personnel = await fetchAPI('/delivery/personnel/available');
        
        const modalTitle = document.getElementById('appModalLabel');
        const modalBody = document.getElementById('app-modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        
        modalTitle.textContent = 'Assign Delivery Person';
        
        modalBody.innerHTML = `
            <p>Please select a delivery person to assign to this delivery:</p>
            <div class="mb-3">
                <select id="delivery-person-select" class="form-select">
                    <option value="">-- Select Delivery Person --</option>
                    ${personnel.map(person => 
                        `<option value="${person.employee_id}">${person.first_name} ${person.last_name} (${person.role})</option>`
                    ).join('')}
                </select>
            </div>
        `;
        
        confirmBtn.style.display = 'block';
        confirmBtn.textContent = 'Assign';
        
        // Remove any existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', async function() {
            const employeeId = document.getElementById('delivery-person-select').value;
            
            if (!employeeId) {
                showErrorMessage('Please select a delivery person.');
                return;
            }
            
            try {
                await fetchAPI(`/delivery/${deliveryId}/assign`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ employee_id: employeeId })
                });
                
                appModal.hide();
                showSuccessMessage('Delivery person assigned successfully.');
                
                // Reload active deliveries
                loadAdminActiveDeliveries();
                // Also reload the deliveries page if user is on that page
                if (!document.getElementById('delivery-section').classList.contains('d-none')) {
                    loadDeliveries();
                }
                
            } catch (error) {
                console.error('Error assigning delivery person:', error);
                showErrorMessage('Failed to assign delivery person. Please try again.');
            }
        });
        
        appModal.show();
        
    } catch (error) {
        console.error('Error loading delivery personnel:', error);
        showErrorMessage('Failed to load delivery personnel. Please try again.');
    }
}

// Show form to complete delivery
function showCompleteDeliveryForm(deliveryId) {
    const modalTitle = document.getElementById('appModalLabel');
    const modalBody = document.getElementById('app-modal-body');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    modalTitle.textContent = 'Complete Delivery';
    
    modalBody.innerHTML = `
        <p>Are you sure you want to mark this delivery as complete?</p>
        <div class="mb-3">
            <label for="delivery-notes" class="form-label">Delivery Notes (Optional)</label>
            <textarea id="delivery-notes" class="form-control" rows="3" placeholder="Any notes about this delivery..."></textarea>
        </div>
    `;
    
    confirmBtn.style.display = 'block';
    confirmBtn.textContent = 'Complete Delivery';
    
    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async function() {
        try {
            const deliveryNotes = document.getElementById('delivery-notes').value;
            
            await fetchAPI(`/delivery/${deliveryId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ delivery_notes: deliveryNotes })
            });
            
            appModal.hide();
            showSuccessMessage('Delivery completed successfully.');
            
            // Reload active deliveries
            loadAdminActiveDeliveries();
            loadAdminCompletedDeliveries();
            // Also reload the deliveries page if user is on that page
            if (!document.getElementById('delivery-section').classList.contains('d-none')) {
                loadDeliveries();
            }
            
        } catch (error) {
            console.error('Error completing delivery:', error);
            showErrorMessage('Failed to complete delivery. Please try again.');
        }
    });
    
    appModal.show();
}

// Load completed deliveries for admin
async function loadAdminCompletedDeliveries() {
    try {
        console.log("Loading admin completed deliveries");
        const completedDeliveriesContainer = document.getElementById('admin-completed-deliveries');
        
        if (!completedDeliveriesContainer) {
            console.error("Container admin-completed-deliveries not found");
            return;
        }
        
        // Get completed and cancelled deliveries
        const deliveries = await fetchAPI('/delivery?status=Delivered,Cancelled');
        console.log("Admin completed deliveries API response:", deliveries);
        
        // Sort by most recent first
        deliveries.sort((a, b) => new Date(b.delivery_time || b.assigned_time) - new Date(a.delivery_time || a.assigned_time));
        
        // Limit to last 10
        const recentDeliveries = deliveries.slice(0, 10);
        
        if (recentDeliveries.length === 0) {
            completedDeliveriesContainer.innerHTML = '<div class="alert alert-info">No completed deliveries found.</div>';
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Delivery Person</th>
                            <th>Status</th>
                            <th>Completed At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        recentDeliveries.forEach(delivery => {
            html += `
                <tr>
                    <td>${delivery.delivery_id}</td>
                    <td>${delivery.order_id}</td>
                    <td>${delivery.customer_name || 'Unknown'}</td>
                    <td>${delivery.delivery_person || 'N/A'}</td>
                    <td><span class="badge ${getDeliveryStatusBadgeClass(delivery.delivery_status)}">${delivery.delivery_status}</span></td>
                    <td>${delivery.delivery_time ? formatDate(delivery.delivery_time) : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-delivery-details-btn" data-delivery-id="${delivery.delivery_id}">
                            <i class="bi bi-eye"></i> Details
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
        
        completedDeliveriesContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.view-delivery-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-delivery-id');
                loadDeliveryDetails(deliveryId);
            });
        });
        
    } catch (error) {
        console.error('Error loading completed deliveries for admin:', error);
        const completedDeliveriesContainer = document.getElementById('admin-completed-deliveries');
        if (completedDeliveriesContainer) {
            completedDeliveriesContainer.innerHTML = 
                '<div class="alert alert-danger">Failed to load completed deliveries. Please try again later.</div>';
        }
    }
}

// Debug function to help troubleshoot delivery issues
function debugDeliveryCreation() {
    try {
        console.log("Checking delivery creation...");
        // Check if deliveries exist for the latest order
        fetchAPI('/orders').then(orders => {
            if (orders && orders.length > 0) {
                const latestOrder = orders[0];
                console.log("Latest order:", latestOrder);
                
                // Check if a delivery exists for this order
                fetchAPI('/delivery').then(deliveries => {
                    console.log("All deliveries:", deliveries);
                    
                    const orderDelivery = deliveries.find(d => d.order_id === latestOrder.order_id);
                    console.log("Delivery for latest order:", orderDelivery);
                    
                    if (!orderDelivery) {
                        console.error("No delivery found for latest order!");
                    }
                }).catch(err => console.error("Error fetching deliveries:", err));
            }
        }).catch(err => console.error("Error fetching orders:", err));
    } catch (error) {
        console.error("Error debugging delivery creation:", error);
    }
}

// Additional debug functions for browser console debugging
window.debugDeliveries = async function() {
    try {
        console.log("Manually checking deliveries...");
        
        // Get all active deliveries directly 
        const activeDeliveries = await fetchAPI('/delivery?status=Pending,Assigned');
        console.log("Active deliveries response:", activeDeliveries);
        
        // Check for any missing fields or null values that might cause rendering issues
        if (activeDeliveries.length > 0) {
            const fieldsToCheck = ['order_id', 'customer_name', 'hostel', 'room_number', 'total_amount', 'delivery_status'];
            const problemItems = activeDeliveries.filter(item => {
                return fieldsToCheck.some(field => !item[field]);
            });
            
            if (problemItems.length > 0) {
                console.warn("Found deliveries with missing required fields:", problemItems);
            }
        }
        
        return {
            count: activeDeliveries.length,
            deliveries: activeDeliveries
        };
    } catch (error) {
        console.error("Error in debugDeliveries:", error);
        return { error: error.message };
    }
};

// Test function to show a delivery directly
window.testDeliveryDisplay = function() {
    const mockDeliveries = [
        {
            delivery_id: 999,
            order_id: 888,
            delivery_status: 'Pending',
            order_date: new Date().toISOString(),
            customer_name: 'Test Customer',
            hostel: 'Test Hostel',
            room_number: '123',
            total_amount: 500.0,
            delivery_person: null
        }
    ];
    
    const deliveryContainer = document.getElementById('delivery-container');
    
    let html = `
        <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i> Test delivery display
        </div>
        
        <div class="row">
    `;
    
    mockDeliveries.forEach(delivery => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Test Order #${delivery.order_id}</h5>
                            <span class="badge bg-light text-dark">${delivery.delivery_status}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p><strong>Customer:</strong> ${delivery.customer_name}</p>
                        <p><strong>Location:</strong> ${delivery.hostel}, ${delivery.room_number}</p>
                        <p><strong>Amount:</strong> ${formatCurrency(delivery.total_amount)}</p>
                        <button class="btn btn-primary">Test Button</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    deliveryContainer.innerHTML = html;
    
    return "Test delivery displayed";
};

// Function to create missing delivery records
window.createMissingDeliveries = async function() {
    try {
        const orders = await fetchAPI('/orders');
        const deliveries = await fetchAPI('/delivery');
        
        // Find orders without deliveries
        const ordersWithoutDelivery = orders.filter(order => 
            !deliveries.some(d => d.order_id === order.order_id)
        );
        
        console.log(`Found ${ordersWithoutDelivery.length} orders without deliveries:`, ordersWithoutDelivery);
        
        if (ordersWithoutDelivery.length === 0) {
            return { message: "No missing delivery records found" };
        }
        
        console.log(`Creating delivery records for ${ordersWithoutDelivery.length} orders...`);
        
        // Create delivery records manually using a custom route
        const created = [];
        for (const order of ordersWithoutDelivery) {
            try {
                // You'd need to add this route to your backend
                const response = await fetchAPI(`/delivery/create-for-order/${order.order_id}`, {
                    method: 'POST'
                });
                console.log(`Created delivery for order #${order.order_id}:`, response);
                created.push(order.order_id);
            } catch (err) {
                console.error(`Failed to create delivery for order #${order.order_id}:`, err);
            }
        }
        
        console.log('Done creating missing delivery records');
        
        // Reload the delivery section if currently visible
        if (!document.getElementById('delivery-section').classList.contains('d-none')) {
            loadDeliveries();
        }
        
        return { 
            message: `Created ${created.length} missing delivery records`,
            created: created
        };
    } catch (error) {
        console.error("Error creating missing deliveries:", error);
        return { error: error.message };
    }
};
