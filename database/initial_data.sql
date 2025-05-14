
-- Initial data for GIKIHub Tuck Area Management System

-- Categories
INSERT INTO categories (name, description) VALUES
('Food', 'All food items including meals and snacks'),
('Beverages', 'All drinks including hot and cold beverages'),
('Stationery', 'Office and school supplies'),
('Snacks', 'Light snacks and packaged food items'),
('Fruits', 'Fresh fruits and fruit-related items'),
('General', 'Miscellaneous items for everyday use');

-- Shops
INSERT INTO shops (name, shop_type, location, contact_number, opening_time, closing_time, description) VALUES
('Raju', 'Restaurant', 'Tuck Area, South Block', '0333-1234567', '08:00', '22:00', 'Popular for biryani and Pakistani cuisine'),
('Hot and Spicy', 'Restaurant', 'Tuck Area, Central Block', '0333-2345678', '08:00', '22:00', 'Specializes in spicy fast food items'),
('Ayan', 'Restaurant', 'Tuck Area, North Block', '0333-3456789', '08:00', '22:00', 'Known for burgers and sandwiches'),
('Asrar Bucks', 'Cafe', 'Tuck Area, West Block', '0333-4567890', '08:00', '23:00', 'Premium coffee and tea shop'),
('Tea Time', 'Cafe', 'Tuck Area, East Block', '0333-5678901', '08:00', '23:00', 'Affordable tea and refreshments'),
('Smoothie Station', 'Cafe', 'Tuck Area, Central Block', '0333-6789012', '09:00', '22:00', 'Fresh juices and milkshakes'),
('GIKI Stationery', 'Stationery', 'Tuck Area, Academic Block', '0333-7890123', '09:00', '21:00', 'All academic supplies and printing services'),
('Campus General Store', 'General Store', 'Tuck Area, Main Block', '0333-8901234', '08:00', '23:00', 'Everyday essentials and groceries'),
('Student Mart', 'General Store', 'Tuck Area, Hostel Area', '0333-9012345', '08:00', '23:00', 'Student essentials and snacks'),
('Fresh Fruits', 'Fruit Shop', 'Tuck Area, South Block', '0333-0123456', '09:00', '20:00', 'Fresh seasonal fruits and fruit chaat');

-- Employees
INSERT INTO employees (shop_id, first_name, last_name, role, contact_number, email, joining_date) VALUES
(1, 'Ahmad', 'Khan', 'Manager', '0311-1234567', 'ahmad.khan@example.com', '2023-01-10'),
(1, 'Ali', 'Ahmed', 'Cook', '0311-2345678', 'ali.ahmed@example.com', '2023-02-15'),
(2, 'Bilal', 'Hassan', 'Manager', '0311-3456789', 'bilal.hassan@example.com', '2023-01-05'),
(2, 'Farhan', 'Ali', 'Waiter', '0311-4567890', 'farhan.ali@example.com', '2023-03-01'),
(3, 'Hassan', 'Raza', 'Manager', '0311-5678901', 'hassan.raza@example.com', '2023-02-10'),
(4, 'Imran', 'Shah', 'Barista', '0311-6789012', 'imran.shah@example.com', '2023-01-15'),
(5, 'Kamran', 'Akmal', 'Owner', '0311-7890123', 'kamran.akmal@example.com', '2022-12-01'),
(6, 'Nasir', 'Jamshed', 'Manager', '0311-8901234', 'nasir.jamshed@example.com', '2023-02-01'),
(7, 'Omar', 'Akmal', 'Salesperson', '0311-9012345', 'omar.akmal@example.com', '2023-01-20'),
(8, 'Qadir', 'Hussain', 'Manager', '0311-0123456', 'qadir.hussain@example.com', '2022-11-15'),
(9, 'Rizwan', 'Khan', 'Salesperson', '0312-1234567', 'rizwan.khan@example.com', '2023-03-01'),
(10, 'Saad', 'Ahmed', 'Owner', '0312-2345678', 'saad.ahmed@example.com', '2022-12-15');

-- Products for Raju (Restaurant)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(1, 1, 'Biryani', 'Spicy chicken biryani with raita', 250.00, TRUE),
(1, 1, 'Karahi', 'Chicken karahi with naan', 350.00, TRUE),
(1, 1, 'Daal Chawal', 'Daal with plain rice', 150.00, TRUE),
(1, 2, 'Soft Drink (Can)', 'Assorted soft drinks', 80.00, TRUE),
(1, 2, 'Mineral Water', '500ml bottled water', 50.00, TRUE);

-- Products for Hot and Spicy (Restaurant)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(2, 1, 'Zinger Burger', 'Spicy chicken zinger burger', 280.00, TRUE),
(2, 1, 'Chicken Broast', 'Crispy chicken broast with fries', 320.00, TRUE),
(2, 1, 'Chicken Shawarma', 'Chicken shawarma with garlic sauce', 200.00, TRUE),
(2, 2, 'Cold Coffee', 'Iced coffee with cream', 150.00, TRUE),
(2, 4, 'French Fries', 'Crispy french fries with ketchup', 120.00, TRUE);

-- Products for Ayan (Restaurant)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(3, 1, 'Club Sandwich', 'Triple-decker sandwich with chicken', 220.00, TRUE),
(3, 1, 'Beef Burger', 'Beef patty burger with cheese', 300.00, TRUE),
(3, 1, 'Chicken Pasta', 'Creamy chicken pasta', 280.00, TRUE),
(3, 2, 'Mint Margarita', 'Refreshing mint drink', 120.00, TRUE),
(3, 4, 'Nuggets', '8 pieces chicken nuggets', 180.00, TRUE);

-- Products for Asrar Bucks (Cafe)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(4, 2, 'Cappuccino', 'Italian coffee with steamed milk', 200.00, TRUE),
(4, 2, 'Americano', 'Strong black coffee', 180.00, TRUE),
(4, 2, 'Cafe Latte', 'Coffee with lots of milk', 220.00, TRUE),
(4, 4, 'Chocolate Muffin', 'Freshly baked muffin', 150.00, TRUE),
(4, 4, 'Cookies', 'Chocolate chip cookies (3)', 120.00, TRUE);

-- Products for Tea Time (Cafe)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(5, 2, 'Doodh Patti', 'Milk tea Pakistani style', 60.00, TRUE),
(5, 2, 'Green Tea', 'Herbal green tea', 80.00, TRUE),
(5, 2, 'Kashmiri Chai', 'Pink tea with nuts', 120.00, TRUE),
(5, 4, 'Samosa', 'Spicy potato samosa', 40.00, TRUE),
(5, 4, 'Pakora', 'Mixed vegetable fritters (200g)', 100.00, TRUE);

-- Products for Smoothie Station (Cafe)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(6, 2, 'Mango Shake', 'Fresh mango milkshake', 150.00, TRUE),
(6, 2, 'Strawberry Shake', 'Strawberry milkshake', 150.00, TRUE),
(6, 2, 'Banana Shake', 'Fresh banana milkshake', 130.00, TRUE),
(6, 2, 'Mix Fruit Juice', 'Assorted fruits juice', 160.00, TRUE),
(6, 2, 'Oreo Shake', 'Milkshake with oreo cookies', 180.00, TRUE);

-- Products for GIKI Stationery (Stationery)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(7, 3, 'Notebook (100 pages)', 'Ruled notebook', 120.00, TRUE),
(7, 3, 'Pen (Blue/Black)', 'Ball point pen', 30.00, TRUE),
(7, 3, 'Printing (B&W)', 'Per page black & white printing', 5.00, TRUE),
(7, 3, 'Printing (Color)', 'Per page color printing', 20.00, TRUE),
(7, 3, 'Engineering Drawing Set', 'Complete set with compass', 350.00, TRUE);

-- Products for Campus General Store (General Store)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(8, 6, 'Toothpaste', 'Colgate 100g', 180.00, TRUE),
(8, 6, 'Shampoo Sachet', 'Head & Shoulders sachet', 40.00, TRUE),
(8, 4, 'Lays (Small)', 'Potato chips', 50.00, TRUE),
(8, 4, 'Chocolate Bar', 'Dairy Milk 25g', 120.00, TRUE),
(8, 6, 'Tissue Box', 'Rose Petal tissues', 160.00, TRUE);

-- Products for Student Mart (General Store)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(9, 6, 'Detergent (Small)', 'Surf Excel 250g', 150.00, TRUE),
(9, 6, 'Soap', 'Safeguard soap', 90.00, TRUE),
(9, 4, 'Biscuits', 'Sooper biscuits', 60.00, TRUE),
(9, 4, 'Instant Noodles', 'Knorr noodles', 80.00, TRUE),
(9, 6, 'Room Freshener', 'Air freshener spray', 220.00, TRUE);

-- Products for Fresh Fruits (Fruit Shop)
INSERT INTO products (shop_id, category_id, name, description, price, is_available) VALUES
(10, 5, 'Banana (Dozen)', 'Fresh bananas', 150.00, TRUE),
(10, 5, 'Apple (1kg)', 'Fresh apples', 250.00, TRUE),
(10, 5, 'Orange (1kg)', 'Fresh oranges', 200.00, TRUE),
(10, 5, 'Fruit Chaat', 'Mixed fruit salad', 120.00, TRUE),
(10, 5, 'Pomegranate (1kg)', 'Fresh pomegranate', 300.00, TRUE);

-- Customers (Students)
INSERT INTO customers (first_name, last_name, email, phone, address, hostel, room_number) VALUES
('Muhammad', 'Abdullah', 'abdullah.2023@giki.edu.pk', '0333-1111111', 'GIKI, Topi, Swabi', 'Hostel 1', 'Room 101'),
('Ahmed', 'Ali', 'ahmed.ali@giki.edu.pk', '0333-2222222', 'GIKI, Topi, Swabi', 'Hostel 2', 'Room 205'),
('Sara', 'Khan', 'sara.khan@giki.edu.pk', '0333-3333333', 'GIKI, Topi, Swabi', 'Hostel 7', 'Room 110'),
('Fatima', 'Ahmed', 'fatima.ahmed@giki.edu.pk', '0333-4444444', 'GIKI, Topi, Swabi', 'Hostel 8', 'Room 215'),
('Usman', 'Malik', 'usman.malik@giki.edu.pk', '0333-5555555', 'GIKI, Topi, Swabi', 'Hostel 3', 'Room 320'),
('Zainab', 'Hassan', 'zainab.hassan@giki.edu.pk', '0333-6666666', 'GIKI, Topi, Swabi', 'Hostel 7', 'Room 225'),
('Ali', 'Raza', 'ali.raza@giki.edu.pk', '0333-7777777', 'GIKI, Topi, Swabi', 'Hostel 4', 'Room 115'),
('Ayesha', 'Imran', 'ayesha.imran@giki.edu.pk', '0333-8888888', 'GIKI, Topi, Swabi', 'Hostel 8', 'Room 310'),
('Bilal', 'Ahmed', 'bilal.ahmed@giki.edu.pk', '0333-9999999', 'GIKI, Topi, Swabi', 'Hostel 5', 'Room 210'),
('Hina', 'Shahid', 'hina.shahid@giki.edu.pk', '0333-0000000', 'GIKI, Topi, Swabi', 'Hostel 7', 'Room 120');

-- Sample orders
-- Order 1
INSERT INTO orders (customer_id, order_date, payment_method, special_instructions) 
VALUES (1, NOW() - INTERVAL '2 HOURS', 'Cash', 'Please deliver quickly');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES 
(1, 1, 2, 250.00), -- 2 Biryanis from Raju
(1, 5, 1, 50.00);  -- 1 Mineral Water from Raju

INSERT INTO delivery (order_id, employee_id, delivery_status, delivery_location)
VALUES (1, 2, 'Delivered', 'Hostel 1, Room 101');

UPDATE delivery SET delivery_time = NOW() - INTERVAL '1 HOUR 30 MINUTES' WHERE order_id = 1;
UPDATE orders SET status = 'Completed' WHERE order_id = 1;

-- Order 2
INSERT INTO orders (customer_id, order_date, payment_method) 
VALUES (3, NOW() - INTERVAL '1 HOUR', 'Cash');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES 
(2, 11, 1, 220.00), -- 1 Club Sandwich from Ayan
(2, 14, 2, 120.00); -- 2 Mint Margaritas from Ayan

INSERT INTO delivery (order_id, employee_id, delivery_status, delivery_location)
VALUES (2, 5, 'Delivered', 'Hostel 7, Room 110');

UPDATE delivery SET delivery_time = NOW() - INTERVAL '30 MINUTES' WHERE order_id = 2;
UPDATE orders SET status = 'Completed' WHERE order_id = 2;

-- Order 3 (Active order)
INSERT INTO orders (customer_id, order_date, payment_method, special_instructions) 
VALUES (5, NOW() - INTERVAL '20 MINUTES', 'Cash', 'Extra ketchup please');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES 
(3, 6, 2, 280.00), -- 2 Zinger Burgers from Hot and Spicy
(3, 10, 1, 120.00); -- 1 French Fries from Hot and Spicy

INSERT INTO delivery (order_id, employee_id, delivery_status, delivery_location)
VALUES (3, 4, 'Assigned', 'Hostel 3, Room 320');

UPDATE orders SET status = 'Processing' WHERE order_id = 3;

-- Order 4 (Pending order)
INSERT INTO orders (customer_id, order_date, payment_method) 
VALUES (8, NOW() - INTERVAL '10 MINUTES', 'Cash');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES 
(4, 16, 2, 200.00), -- 2 Cappuccinos from Asrar Bucks
(4, 19, 3, 150.00); -- 3 Chocolate Muffins from Asrar Bucks

INSERT INTO delivery (order_id, delivery_location)
VALUES (4, 'Hostel 8, Room 310');
