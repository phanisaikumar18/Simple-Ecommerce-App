const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// Public: List products with pagination/search
router.get('/', async (req, res) => {
  const { name, category, page = 1, limit = 5, sort } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE 1';
  const params = [];

  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (sort === 'price_asc') query += ' ORDER BY price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price DESC';
  else if (sort === 'newest') query += ' ORDER BY created_at DESC';

  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  try {
    const [products] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1';
    const countParams = [];

    if (name) {
      countQuery += ' AND name LIKE ?';
      countParams.push(`%${name}%`);
    }

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    const [[{ count }]] = await db.query(countQuery, countParams);

    res.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
});

// Admin: Add a new product
router.post('/', authenticate, roleMiddleware('admin'), async (req, res) => {
  const { name, price, category, description } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    await db.query(
      'INSERT INTO products (name, price, category, description) VALUES (?, ?, ?, ?)',
      [name, price, category, description || '']
    );
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding product' });
  }
});

// Admin: Update a product
router.put('/:id', authenticate, roleMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description } = req.body;
  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, category = ?, description = ? WHERE id = ?',
      [name, price, category, description, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Admin: Delete a product
router.delete('/:id', authenticate, roleMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
