const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// ✅ Add item to cart (customer only)
router.post('/add', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;

  try {
    // Check if item already exists
    const [rows] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (rows.length > 0) {
      // If item exists, update quantity
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, user_id, product_id]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
    }

    res.send('Item added to cart');
  } catch (err) {
    res.status(500).send('Error adding to cart');
  }
});

// 🔄 Update quantity (customer only)
router.put('/update', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;

  try {
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );
    res.send('Cart item updated');
  } catch (err) {
    res.status(500).send('Error updating cart');
  }
});

// ❌ Remove item (customer only)
router.delete('/remove/:product_id', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;
  const product_id = req.params.product_id;

  try {
    await db.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    res.send('Item removed from cart');
  } catch (err) {
    res.status(500).send('Error removing from cart');
  }
});

// 📦 View cart items (customer only)
router.get('/', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT c.id, p.name, p.price, c.quantity, (p.price * c.quantity) AS total
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [user_id]);

    res.json(rows);
  } catch (err) {
    res.status(500).send('Error fetching cart');
  }
});

module.exports = router;

