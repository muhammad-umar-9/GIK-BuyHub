// backend/routes/delivery.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Helper function to convert database results to a consistent format
function formatDelivery(row) {
  if (db.type === 'postgres') {
    return { ...row, delivery_id: row.delivery_id }; // Use delivery_id for consistency
  }
  // Add other database types as needed (e.g., MongoDB)
  return row;
}

router.get('/', async (req, res) => {
  if (db.type === 'mongodb') {
    router.get('/', async (req, res) => {
        try {
            const mongo = await db.connect();
            const docs = await mongo.collection('delivery').find({}).toArray();

            // Map MongoDB's _id to delivery_id for frontend compatibility
            const deliveries = docs.map(doc => ({ delivery_id: doc._id.toString(), ...doc }));
            res.json(deliveries);
        } catch (error) {
            console.error("Error fetching deliveries from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch deliveries from MongoDB' });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            const doc = await mongo.collection('delivery').findOne({ _id: db.ObjectId(req.params.id) });
                            
            if (!doc) return res.status(404).json({ error: 'Delivery not found' });
            res.json({ delivery_id: doc._id.toString(), ...doc });
        } catch (error) {
            console.error("Error fetching from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch delivery from MongoDB' });
        }
    });

    router.post('/', async (req, res) => {
        try {
             const mongo = await db.connect();
            const result = await mongo.collection('delivery').insertOne(req.body);

            res.status(201).json({ delivery_id: result.insertedId.toString(), ...req.body }); // Return created delivery
        } catch (error) {
            console.error("Error creating delivery:", error);
            res.status(500).json({ error: 'Failed to create delivery' });
        }
    });


    router.put('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('delivery').updateOne({ _id: db.ObjectId(req.params.id) }, { $set: req.body });
            
            const updatedDelivery = await mongo.collection('delivery').findOne({ _id: db.ObjectId(req.params.id) });
            
            res.json({ delivery_id: updatedDelivery._id.toString(), ...updatedDelivery });
        } catch (error) {
            console.error("Error updating delivery:", error);
            res.status(500).json({ error: 'Failed to update delivery' });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('delivery').deleteOne({ _id: db.ObjectId(req.params.id) });
            res.json({ message: 'Delivery deleted' });
        } catch (error) {
            console.error("Error deleting delivery:", error);
            res.status(500).json({ error: 'Failed to delete delivery' });
        }
    });

} else {
    try {
      const { status } = req.query; // For filtering by status

      let query = 'SELECT d.*, o.order_date, o.total_amount, c.first_name || \' \' || c.last_name AS customer_name, c.hostel, c.room_number, e.first_name || \' \' || e.last_name AS delivery_person FROM delivery d JOIN orders o ON d.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id LEFT JOIN employees e ON d.employee_id = e.employee_id';
      const values = [];

      if (status) {
        query += ' WHERE d.delivery_status = ANY($1)';
        values.push(status.split(',')); // Allow multiple statuses
      }

      query += ' ORDER BY d.assigned_time DESC';
      const result = await db.query(query, values);


      res.json(result.rows.map(formatDelivery)); // Format before sending
    } catch (err) {
      console.error('Error fetching deliveries (PostgreSQL):', err);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  }
});


router.get('/:id', async (req, res) => {
    if (db.type === 'mongodb') {

    } else {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid delivery ID' });
            }

             const result = await db.query(`
                SELECT d.*, o.order_date, o.total_amount, o.special_instructions,
                c.first_name || ' ' || c.last_name AS customer_name,
                c.phone AS customer_phone, c.hostel, c.room_number,
                e.first_name || ' ' || e.last_name AS delivery_person,
                e.contact_number AS delivery_person_phone
                FROM delivery d
                JOIN orders o ON d.order_id = o.order_id
                JOIN customers c ON o.customer_id = c.customer_id
                LEFT JOIN employees e ON d.employee_id = e.employee_id
                WHERE d.delivery_id = $1
             `, [id]);


            if (!result.rows[0]) { return res.status(404).json({error: "Delivery not found"});}

            const delivery = {...result.rows[0]};
            const itemResult = await db.query(`SELECT oi.*, p.name AS product_name
                FROM order_items oi JOIN products p ON oi.product_id=p.product_id WHERE oi.order_id = $1`, [delivery.order_id]);
            
            delivery.items = itemResult.rows;
             res.status(200).json(delivery)



        } catch (err) {
            console.error("Error fetching delivery from PostgreSQL:", err);
            res.status(500).json({error: "Failed to fetch delivery"});
        }
    }
});


router.get('/personnel/available', async (req, res) => {
  // ... (MongoDB implementation if needed) ...
  
  if (!db || db.type !== 'mongodb') { // PostgreSQL implementation
        try {
            const personnel = await db.query('SELECT *, employee_id FROM employees WHERE role IN ($1, $2, $3) ORDER BY first_name, last_name', ['Delivery', 'Waiter', 'Cook']);
            res.json(personnel.rows);
        } catch (error) {
            console.error('Error fetching available personnel from PostgreSQL:', error);
            res.status(500).json({error: 'Failed to fetch personnel'});
        }
    }
});



router.post('/:deliveryId/assign', async (req, res) => {
    const { deliveryId } = req.params;
    const { employee_id } = req.body;

    if (db.type === 'mongodb') {
         // ... MongoDB implementation ...
    } else {
        // Call the assign_delivery_person procedure
        try {
            const id = parseInt(deliveryId, 10); // Parse to integer
            if (isNaN(id)) {
                return res.status(400).json({error: 'Invalid delivery ID'});
            }
            // Perform database query or other necessary operations here
            const result = await db.query(
                "SELECT assign_delivery_person($1, $2)",
                [id, employee_id]
             );
     
             res.status(200).json({message: "Delivery person assigned successfully"});
        } catch (err) {
            console.error("Error assigning the delivery person (PostGres)", err);
             res.status(500).json({error: "Failed to assign delivery person!"});
        }
    }
});



router.post('/:id/complete', async (req , res)=>{
    const {id} = req.params;
    const {delivery_notes} = req.body;
    if (db.type === 'mongodb'){

    } else {

 try {
     const deliveryId = parseInt(id, 10);
            if (isNaN(deliveryId)) {
                return res.status(400).json({error: 'Invalid delivery ID'});
            }

        const result = await db.query(
                "SELECT complete_delivery($1, $2)",
                [deliveryId, delivery_notes]
             );

             res.status(200).json({message: "Delivery marked as completed successfully!"});
        } catch (error) {
              console.error("Error completing delivery (postgres)", err);
             res.status(500).json({error: "Failed to complete delivery!"});

        }

    }
});


// Update delivery location
router.patch('/:id/location', async (req, res) => {
   if (db.type === 'mongodb') {

   } else {

       try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid delivery ID' });
            }
            const {delivery_location} = req.body;

             const result = await db.query(
                'UPDATE delivery SET delivery_location = $1 WHERE delivery_id = $2 RETURNING *',
                [delivery_location, id]
             );

             if (!result.rows[0]) { return res.status(404).json({error: "Delivery not found"});}
             res.status(200).json(result.rows[0]);


        } catch (err) {
               console.error("Error updaing location(PostGres)", err);
             res.status(500).json({error: "Failed to update location!"});
        }

   }
});




module.exports = router;
