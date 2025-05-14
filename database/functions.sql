
-- Functions for GIKIHub Tuck Area Management System

-- 1. Get total sales for a shop within a date range
CREATE OR REPLACE FUNCTION get_shop_sales(shop_id_param INTEGER, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    total_sales DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) INTO total_sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE p.shop_id = shop_id_param
    AND o.status = 'Completed'
    AND o.order_date::DATE BETWEEN start_date AND end_date;
    
    RETURN total_sales;
END;
$$ LANGUAGE plpgsql;

-- 2. Get popular products for a shop
CREATE OR REPLACE FUNCTION get_popular_products(shop_id_param INTEGER, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    product_id INTEGER,
    product_name VARCHAR,
    total_ordered INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0)::INTEGER AS total_ordered
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
    WHERE p.shop_id = shop_id_param
    AND o.status = 'Completed'
    GROUP BY p.product_id, p.name
    ORDER BY total_ordered DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a new order with items
-- Update the create_order function if needed
CREATE OR REPLACE FUNCTION create_order(
    customer_id_param INTEGER,
    product_ids INTEGER[],
    quantities INTEGER[],
    payment_method_param VARCHAR DEFAULT 'Cash',
    special_instructions_param TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    new_order_id INTEGER;
    i INTEGER;
    current_product_id INTEGER;
    current_quantity INTEGER;
    current_price DECIMAL(10, 2);
BEGIN
    -- Create new order
    INSERT INTO orders (customer_id, payment_method, special_instructions)
    VALUES (customer_id_param, payment_method_param, special_instructions_param)
    RETURNING order_id INTO new_order_id;
    
    -- Add order items
    FOR i IN 1..array_length(product_ids, 1) LOOP
        current_product_id := product_ids[i];
        current_quantity := quantities[i];
        
        -- Get product price
        SELECT price INTO current_price
        FROM products
        WHERE product_id = current_product_id;
        
        -- Add order item
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (new_order_id, current_product_id, current_quantity, current_price);
    END LOOP;
    
    -- Create delivery record - Make sure this part is working!
    INSERT INTO delivery (order_id, delivery_status)
    VALUES (new_order_id, 'Pending');
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Calculate average delivery time for a shop
CREATE OR REPLACE FUNCTION avg_delivery_time(shop_id_param INTEGER)
RETURNS INTERVAL AS $$
DECLARE
    avg_time INTERVAL;
BEGIN
    SELECT AVG(d.delivery_time - o.order_date) INTO avg_time
    FROM delivery d
    JOIN orders o ON d.order_id = o.order_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE p.shop_id = shop_id_param
    AND d.delivery_status = 'Delivered'
    AND d.delivery_time IS NOT NULL;
    
    RETURN avg_time;
END;
$$ LANGUAGE plpgsql;
