// backend/routes/products.js
const express = require('express');
const db = require('../db');
const router = express.Router();

if (db.type === 'mongodb') {
  router.get('/', async (req, res) => {
      try {
          const mongo = await db.connect();
          const docs = await mongo.collection('products').find({}).toArray();
          res.json(docs.map(doc => ({ product_id: doc._id.toString(), ...doc }))); // Map _id to product_id
      } catch (error) {
          console.error("Error fetching from MongoDB:", error);
          res.status(500).json({ error: 'Failed to fetch products from MongoDB' });
      }
  });
  
  router.get('/:id', async (req, res) => {
      try {
          const mongo = await db.connect();
          const doc = await mongo.collection('products').findOne({ _id: db.ObjectId(req.params.id) });
          if (!doc) return res.status(404).json({ error: 'Product not found' });
          res.json({ product_id: doc._id.toString(), ...doc });
      } catch (error) {
          console.error("Error fetching from MongoDB:", error);
          res.status(500).json({ error: 'Failed to fetch product from MongoDB' });
      }
  });

  router.post('/', async (req, res) => {
      try {
          const mongo = await db.connect();
          const result = await mongo.collection('products').insertOne(req.body);
          res.status(201).json({ product_id: result.insertedId.toString(), ...req.body });
      } catch (error) {
          console.error("Error adding product:", error);
          res.status(500).json({ error: 'Failed to add product' });
      }
  });

  router.put('/:id', async (req, res) => {
      try {
          const mongo = await db.connect();
          await mongo.collection('products').updateOne({ _id: db.ObjectId(req.params.id) }, { $set: req.body });
          const updatedProduct = await mongo.collection('products').findOne({ _id: db.ObjectId(req.params.id) });
          res.json({ product_id: updatedProduct._id.toString(), ...updatedProduct });
      } catch (error) {
          console.error("Error updating product:", error);
          res.status(500).json({ error: 'Failed to update product' });
      }
  });

  router.delete('/:id', async (req, res) => {
      try {
          const mongo = await db.connect();
          await mongo.collection('products').deleteOne({ _id: db.ObjectId(req.params.id) });
          res.json({ message: 'Product deleted' });
      } catch (error) {
          console.error("Error deleting product:", error);
          res.status(500).json({ error: 'Failed to delete product' });
      }
  });
  
  router.get('/categories', async (req, res) => {
    try {
      const mongo = await db.connect();
      const categories = await mongo.collection('categories').find({}).toArray();
      res.json(categories.map(category => ({ category_id: category._id.toString(), ...category })));
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });


} else {
  // Postgres routes…
  router.get('/', async (req, res) => {
        try {
            const result = await db.query('SELECT *, product_id FROM products');
            res.json(result.rows);
        } catch (error) {
            console.error("Error fetching products from Postgres:", error);
            res.status(500).send("Error fetching products from Postgres");
        }
    });
    router.get('/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid product ID. Must be a number." });
            }
            const result = await db.query('SELECT * FROM products WHERE product_id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Failed to fetch product from Postgres:", error);
            res.status(500).send("Failed to fetch product from Postgres");
        }
    });

    router.post('/', async (req, res) => {
        try {
            const { name, shop_id, category_id, price, description , is_available} = req.body;
            const result = await db.query(
                'INSERT INTO products (name, shop_id, category_id, price, description, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, shop_id, category_id, price, description, is_available]
            );
            console.log(result.rows[0]);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Failed to add a product to Postgres:", error);
            res.status(500).send("Failed to create product to Postgres");
        }
    });


    router.put('/:id', async (req, res) => {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                return res.status(400).json({ error: "Invalid product ID. Must be a number." });
            }
            const { name, shop_id, category_id, price, description, is_available} = req.body;
            const result = await db.query(
                'UPDATE products SET name = $1, shop_id = $2, category_id = $3, price = $4, description = $5, is_available=$6 WHERE product_id = $7 RETURNING *',
                [name, shop_id, category_id, price, description, is_available, productId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Failed to update a product to Postgres:", error);
            res.status(500).send("Failed to update product to Postgres");
        }
    });

    router.delete('/:id', async (req, res) => {
        
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    return res.status(400).json({ error: "Invalid Product ID. Must be a number for Postgres." });
                }
                await db.query('DELETE FROM products WHERE product_id = $1', [id]);
                res.status(204).end();
            } catch (error) {
                console.error("Failed to delete Product from Postgres:", error);
                res.status(500).send("Failed to fetch product from Postgres");
            }
        });
  router.get('/categories', async (req, res) => {
    try {
      const result = await db.query('SELECT *, category_id FROM categories');
      res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
}

module.exports = router;
