
// routes/orders.js
// backend/routes/orders.js
const express = require('express');
const db = require('../db');
const router = express.Router();

if (db.type === 'mongodb') {
    router.get('/active', async (req, res) => {
        try {
          const mongo = await db.connect();
          const docs = await mongo.collection('orders').find({ status: 'Active' }).toArray();
          res.json(docs.map(doc => ({ order_id: doc._id.toString(), ...doc })));
        } catch (error) {
          console.error("Error fetching active orders from MongoDB:", error);
          res.status(500).json({ error: 'Failed to fetch active orders from MongoDB' });
        }
      });
      
      router.get('/completed', async (req, res) => {
        try {
          const mongo = await db.connect();
          const docs = await mongo.collection('orders').find({ status: 'Completed' }).toArray();
          res.json(docs.map(doc => ({ order_id: doc._id.toString(), ...doc })));
        } catch (error) {
          console.error("Error fetching completed orders from MongoDB:", error);
          res.status(500).json({ error: 'Failed to fetch completed orders from MongoDB' });
        }
      });
    
    router.get('/', async (req, res) => {
        try {
            const mongo = await db.connect();
            const docs = await mongo.collection('orders').find({}).toArray();
            res.json(docs.map(doc => ({ order_id: doc._id.toString(), ...doc })));
        } catch (error) {
            console.error("Error fetching from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch orders from MongoDB' });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            const doc = await mongo.collection('orders').findOne({ _id: db.ObjectId(req.params.id) });
            if (!doc) return res.status(404).json({ error: 'Order not found' });
            res.json({ order_id: doc._id.toString(), ...doc });
        } catch (error) {
            console.error("Error fetching from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch order from MongoDB' });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const mongo = await db.connect();
            const result = await mongo.collection('orders').insertOne(req.body);
            res.status(201).json({ order_id: result.insertedId.toString(), ...req.body });
        } catch (error) {
            console.error("Error adding order:", error);
            res.status(500).json({ error: 'Failed to add order' });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('orders').updateOne({ _id: db.ObjectId(req.params.id) }, { $set: req.body });
            const updatedOrder = await mongo.collection('orders').findOne({ _id: db.ObjectId(req.params.id) });
            res.json({ order_id: updatedOrder._id.toString(), ...updatedOrder });
        } catch (error) {
            console.error("Error updating order:", error);
            res.status(500).json({ error: 'Failed to update order' });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('orders').deleteOne({ _id: db.ObjectId(req.params.id) });
            res.json({ message: 'Order deleted' });
        } catch (error) {
            console.error("Error deleting order:", error);
            res.status(500).json({ error: 'Failed to delete order' });
        }
    });


} else {
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT o.*, c.first_name || ' ' || c.last_name as customer_name,
      c.hostel, c.room_number, d.delivery_status
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN delivery d ON o.order_id = d.order_id
    `;
    
    const queryParams = [];
    
    if (status) {
      query += ` WHERE o.status = $1`;
      queryParams.push(status);
    }
    
    query += ` ORDER BY o.order_date DESC`;
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get active orders (Pending or Processing)
router.get('/active', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM active_orders_view
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active orders:', err);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
});

// Get a specific order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details
    const orderResult = await db.query(`
      SELECT o.*, c.first_name || ' ' || c.last_name as customer_name,
      c.phone, c.hostel, c.room_number, d.delivery_status, d.delivery_id
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN delivery d ON o.order_id = d.order_id
      WHERE o.order_id = $1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name, s.name as shop_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN shops s ON p.shop_id = s.shop_id
      WHERE oi.order_id = $1
    `, [id]);
    
    order.items = itemsResult.rows;
    
    res.json(order);
  } catch (err) {
    console.error(`Error fetching order with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get all customers
router.get('/customers/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM customers ORDER BY first_name, last_name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create a new customer
router.post('/customers', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, hostel, room_number } = req.body;
    
    const result = await db.query(
      'INSERT INTO customers (first_name, last_name, email, phone, address, hostel, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [first_name, last_name, email, phone, address, hostel, room_number]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { customer_id, products, payment_method, special_instructions } = req.body;
    
    // Prepare arrays for the function
    const productIds = [];
    const quantities = [];
    
    products.forEach(item => {
      productIds.push(item.product_id);
      quantities.push(item.quantity);
    });
    
    // Call the create_order function
    const result = await db.query(
      'SELECT create_order($1, $2, $3, $4, $5) as order_id',
      [customer_id, productIds, quantities, payment_method, special_instructions]
    );
    
    const orderId = result.rows[0].order_id;
    
    // Get the full order details
    const orderResult = await db.query(`
      SELECT * FROM orders WHERE order_id = $1
    `, [orderId]);
    
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating status for order with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Cancel an order
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    
    // Call the cancel_order procedure
    await db.query(
      'CALL cancel_order($1, $2)',
      [id, cancellation_reason]
    );
    
    // Get the updated order
    const result = await db.query('SELECT * FROM orders WHERE order_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ 
      message: 'Order cancelled successfully',
      order: result.rows[0] 
    });
  } catch (err) {
    console.error(`Error cancelling order with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get order items with details
router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT oi.*, p.name as product_name, s.name as shop_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN shops s ON p.shop_id = s.shop_id
      WHERE oi.order_id = $1
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching items for order with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});
}
module.exports = router;
