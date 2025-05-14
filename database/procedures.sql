
-- Procedures for GIKIHub Tuck Area Management System

-- 1. Assign delivery person to an order
CREATE OR REPLACE PROCEDURE assign_delivery_person(
    order_id_param INTEGER,
    employee_id_param INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE delivery
    SET employee_id = employee_id_param,
        delivery_status = 'Assigned',
        assigned_time = CURRENT_TIMESTAMP
    WHERE order_id = order_id_param;
    
    -- Update order status
    UPDATE orders
    SET status = 'Processing'
    WHERE order_id = order_id_param;
    
    COMMIT;
END;
$$;

-- 2. Complete an order delivery
CREATE OR REPLACE PROCEDURE complete_delivery(
    delivery_id_param INTEGER,
    delivery_notes_param TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE delivery
    SET delivery_status = 'Delivered',
        delivery_time = CURRENT_TIMESTAMP,
        delivery_notes = COALESCE(delivery_notes_param, delivery_notes)
    WHERE delivery_id = delivery_id_param;
    
    -- Order status will be automatically updated by trigger
    
    COMMIT;
END;
$$;

-- 3. Cancel an order
CREATE OR REPLACE PROCEDURE cancel_order(
    order_id_param INTEGER,
    cancellation_reason TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update order status
    UPDATE orders
    SET status = 'Cancelled',
        special_instructions = CASE 
            WHEN special_instructions IS NULL OR special_instructions = '' 
            THEN 'Cancellation reason: ' || COALESCE(cancellation_reason, 'Not provided')
            ELSE special_instructions || ' | Cancellation reason: ' || COALESCE(cancellation_reason, 'Not provided')
        END
    WHERE order_id = order_id_param;
    
    -- Update delivery status if exists
    UPDATE delivery
    SET delivery_status = 'Cancelled'
    WHERE order_id = order_id_param;
    
    COMMIT;
END;
$$;

-- 4. Add multiple products to a shop
CREATE OR REPLACE PROCEDURE add_shop_products(
    shop_id_param INTEGER,
    names VARCHAR[],
    prices DECIMAL[],
    category_ids INTEGER[],
    descriptions TEXT[] DEFAULT NULL,
    is_availables BOOLEAN[] DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    i INTEGER;
    current_description TEXT;
    current_is_available BOOLEAN;
BEGIN
    FOR i IN 1..array_length(names, 1) LOOP
        -- Handle default values
        current_description := NULL;
        IF descriptions IS NOT NULL AND i <= array_length(descriptions, 1) THEN
            current_description := descriptions[i];
        END IF;
        
        current_is_available := TRUE;
        IF is_availables IS NOT NULL AND i <= array_length(is_availables, 1) THEN
            current_is_available := is_availables[i];
        END IF;
        
        -- Insert product
        INSERT INTO products (shop_id, name, price, category_id, description, is_available)
        VALUES (
            shop_id_param, 
            names[i], 
            prices[i], 
            category_ids[i], 
            current_description, 
            current_is_available
        );
    END LOOP;
    
    COMMIT;
END;
$$;
