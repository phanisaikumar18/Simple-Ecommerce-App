const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ✅ Create order from cart (customer only)
router.post('/create', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;

  try {
    // 1. Get cart items
    const [cartItems] = await db.query(`
      SELECT c.product_id, c.quantity, p.price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [user_id]);

    if (cartItems.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    // 2. Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. Create order
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total) VALUES (?, ?)',
      [user_id, total]
    );

    const order_id = orderResult.insertId;

    // 4. Insert order items
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // 5. Clear cart
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);

    res.send(`✅ Order placed successfully (Order ID: ${order_id})`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to create order');
  }
});


// 🗃️ Export order history as CSV (customer only)
const { Parser } = require('json2csv');
router.get('/export', authenticate, roleMiddleware('customer'), async (req, res) => {
  const user_id = req.user.id;
  try {
    const [orders] = await db.query(`
      SELECT o.id AS order_id, o.total, o.created_at,
             p.name AS product_name, oi.quantity, oi.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [user_id]);
    if (!orders.length) return res.status(400).send('No order history');
    const fields = ['order_id', 'product_name', 'quantity', 'price', 'total', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);
    res.header('Content-Type', 'text/csv');
    res.attachment(`orders_user_${user_id}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to export orders');
  }
});

// Admin: List all orders (admin only)
router.get('/', authenticate, roleMiddleware('admin'), async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.id AS order_id, o.user_id, o.total, o.created_at,
             u.username AS username
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch orders');
  }
});


module.exports = router;
