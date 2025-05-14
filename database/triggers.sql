
-- Triggers for GIKIHub Tuck Area Management System

-- 1. Update order total amount when order items are added, updated, or deleted
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_total_trigger ON order_items;
CREATE TRIGGER update_order_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- 2. Automatically update status when delivery is completed
CREATE OR REPLACE FUNCTION update_order_status_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_status = 'Delivered' AND OLD.delivery_status != 'Delivered' THEN
        UPDATE orders
        SET status = 'Completed'
        WHERE order_id = NEW.order_id;
        
        -- Set delivery time when marked as delivered
        NEW.delivery_time = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delivery_update_trigger ON delivery;
CREATE TRIGGER delivery_update_trigger
BEFORE UPDATE ON delivery
FOR EACH ROW EXECUTE FUNCTION update_order_status_on_delivery();

-- 3. Log product price changes
CREATE TABLE product_price_log (
    log_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE OR REPLACE FUNCTION log_product_price_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price != OLD.price THEN
        INSERT INTO product_price_log (product_id, old_price, new_price)
        VALUES (NEW.product_id, OLD.price, NEW.price);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_price_change_trigger ON products;
CREATE TRIGGER product_price_change_trigger
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION log_product_price_changes();

-- 4. Prevent deleting shops with active orders
CREATE OR REPLACE FUNCTION prevent_shop_deletion()
RETURNS TRIGGER AS $$
DECLARE
    active_orders INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_orders
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE p.shop_id = OLD.shop_id
    AND o.status IN ('Pending', 'Processing');
    
    IF active_orders > 0 THEN
        RAISE EXCEPTION 'Cannot delete shop with active orders';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shop_delete_check ON shops;
CREATE TRIGGER shop_delete_check
BEFORE DELETE ON shops
FOR EACH ROW EXECUTE FUNCTION prevent_shop_deletion();
