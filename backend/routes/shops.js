
const express = require('express');
const db = require('../db');
const router = express.Router();

if (db.type === 'mongodb') {
    router.get('/', async (req, res) => {
        try {
            const mongo = await db.connect();
            const docs = await mongo.collection('shops').find({}).toArray();
            res.json(docs.map(doc => ({ shop_id: doc._id.toString(), ...doc })));
        } catch (error) {
            console.error("Error fetching from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch shops from MongoDB' });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            const doc = await mongo.collection('shops').findOne({ _id: db.ObjectId(req.params.id) });
            if (!doc) return res.status(404).json({ error: 'Shop not found' });
            res.json({ shop_id: doc._id.toString(), ...doc });
        } catch (error) {
            console.error("Error fetching from MongoDB:", error);
            res.status(500).json({ error: 'Failed to fetch shop from MongoDB' });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const mongo = await db.connect();
            const result = await mongo.collection('shops').insertOne(req.body);
            res.status(201).json({ shop_id: result.insertedId.toString(), ...req.body });
        } catch (error) {
            console.error("Error inserting into MongoDB:", error);
            res.status(500).json({ error: 'Failed to create shop in MongoDB' });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('shops').updateOne({ _id: db.ObjectId(req.params.id) }, { $set: req.body });
            const updatedShop = await mongo.collection('shops').findOne({ _id: db.ObjectId(req.params.id) });
            res.json({ id: updatedShop._id.toString(), ...updatedShop }); // Send back the updated shop
        } catch (error) {
            console.error("Error updating in MongoDB:", error);
            res.status(500).json({ error: 'Failed to update shop in MongoDB' });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const mongo = await db.connect();
            await mongo.collection('shops').deleteOne({ _id: db.ObjectId(req.params.id) });
            res.json({ message: 'Shop deleted from MongoDB' });
        } catch (error) {
            console.error("Error deleting from MongoDB:", error);
            res.status(500).json({ error: 'Failed to delete shop from MongoDB' });
        }
    });

} else {
    // PostgreSQL routes
    router.get('/', async (req, res) => {
        try {
            const result = await db.query('SELECT *, shop_id FROM shops ORDER BY name');
            res.json(result.rows);
        } catch (error) {
            console.error("Failed to fetch shops from Postgres:", error);
            res.status(500).send("Failed to fetch shops from Postgres");
        }
    });
    
    router.get('/:id', async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    return res.status(400).json({ error: "Invalid shop ID. Must be a number for Postgres." });
                }
                const result = await db.query('SELECT *, shop_id FROM shops WHERE shop_id = $1', [id]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: "Shop not found in Postgres" });
                }
                res.json(result.rows[0]);
            } catch (error) {
                console.error("Failed to fetch shop from Postgres:", error);
                res.status(500).send("Failed to fetch shops from Postgres");
            }
        });
        
    router.post('/', async (req, res) => {
        try {
            const { name, shop_type, location, contact_number } = req.body;
            const result = await db.query(
                'INSERT INTO shops (name, shop_type, location, contact_number) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, shop_type, location, contact_number]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Failed to add a shop to Postgres:", error);
            res.status(500).send("Failed to create shop to Postgres");
        }
    });


    router.put('/:id', async (req, res) => {
        try {
            const shopId = parseInt(req.params.id);
            if (isNaN(shopId)) {
                return res.status(400).json({ error: "Invalid shop ID. Must be a number." });
            }
            const { name, shop_type, location, contact_number} = req.body;
            const result = await db.query(
                'UPDATE shops SET name = $1, shop_type = $2, location = $3, contact_number = $4  WHERE shop_id = $5 RETURNING *',
                [name, shop_type, location, contact_number, shopId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Shop not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Failed to update a shop to Postgres:", error);
            res.status(500).send("Failed to update shop to Postgres");
        }
    });

    router.delete('/:id', async (req, res) => {
        
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    return res.status(400).json({ error: "Invalid shop ID. Must be a number for Postgres." });
                }
                await db.query('DELETE FROM shops WHERE shop_id = $1', [id]);
                res.status(204).end();
            } catch (error) {
                console.error("Failed to delete shop from Postgres:", error);
                res.status(500).send("Failed to fetch shops from Postgres");
            }
        });
}

module.exports = router;
