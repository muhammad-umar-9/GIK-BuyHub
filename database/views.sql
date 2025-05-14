
-- Views for GIKIHub Tuck Area Management System

-- 1. Active orders with details
CREATE OR REPLACE VIEW active_orders_view AS
SELECT 
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    c.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.phone,
    c.hostel,
    c.room_number,
    d.delivery_id,
    d.delivery_status,
    COALESCE(e.first_name || ' ' || e.last_name, 'Unassigned') AS delivery_person
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN delivery d ON o.order_id = d.order_id
LEFT JOIN employees e ON d.employee_id = e.employee_id
WHERE o.status IN ('Pending', 'Processing')
ORDER BY o.order_date;

-- 2. Shop products with category info
CREATE OR REPLACE VIEW shop_products_view AS
SELECT 
    p.product_id,
    p.name AS product_name,
    p.description,
    p.price,
    p.is_available,
    s.shop_id,
    s.name AS shop_name,
    c.category_id,
    c.name AS category_name
FROM products p
JOIN shops s ON p.shop_id = s.shop_id
LEFT JOIN categories c ON p.category_id = c.category_id
ORDER BY s.name, c.name, p.name;

-- 3. Order items with product details
CREATE OR REPLACE VIEW order_items_details AS
SELECT 
    oi.order_item_id,
    oi.order_id,
    o.order_date,
    o.status AS order_status,
    oi.product_id,
    p.name AS product_name,
    s.shop_id,
    s.name AS shop_name,
    oi.quantity,
    oi.unit_price,
    oi.subtotal,
    c.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN shops s ON p.shop_id = s.shop_id
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC;

-- 4. Shop sales summary
CREATE OR REPLACE VIEW shop_sales_summary AS
SELECT 
    s.shop_id,
    s.name AS shop_name,
    s.shop_type,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(oi.subtotal), 0) AS total_sales,
    COALESCE(COUNT(DISTINCT CASE WHEN o.status = 'Completed' THEN o.order_id END), 0) AS completed_orders,
    COALESCE(COUNT(DISTINCT CASE WHEN o.status = 'Cancelled' THEN o.order_id END), 0) AS cancelled_orders,
    COALESCE(SUM(CASE WHEN o.status = 'Completed' THEN oi.subtotal ELSE 0 END), 0) AS completed_sales
FROM shops s
LEFT JOIN products p ON s.shop_id = p.shop_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id
GROUP BY s.shop_id, s.name, s.shop_type
ORDER BY total_sales DESC;
