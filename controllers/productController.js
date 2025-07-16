const conn = require('../config/db');

// View all products (with optional search and pagination)
exports.getAllProducts = (req, res) => {
  const { name, category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM products WHERE 1`;
  const params = [];

  if (name) {
    sql += ` AND name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (category) {
    sql += ` AND category LIKE ?`;
    params.push(`%${category}%`);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  conn.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Add product (admin only)
exports.addProduct = (req, res) => {
  const { name, description, price, category, stock } = req.body;
  conn.query(
    'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, category, stock],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('✅ Product added');
    }
  );
};

// Update product (admin only)
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;
  conn.query(
    'UPDATE products SET name=?, description=?, price=?, category=?, stock=? WHERE id=?',
    [name, description, price, category, stock, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('✅ Product updated');
    }
  );
};

// Delete product (admin only)
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  conn.query('DELETE FROM products WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('🗑️ Product deleted');
  });
};

// routes/productRoutes.js or controllers/productController.js
router.get('/', async (req, res) => {
  const { name = '', category = '', page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [products] = await db.query(`
      SELECT * FROM products
      WHERE name LIKE ? AND category LIKE ?
      LIMIT ? OFFSET ?
    `, [`%${name}%`, `%${category}%`, Number(limit), Number(offset)]);

    const [countRes] = await db.query(`
      SELECT COUNT(*) as count FROM products
      WHERE name LIKE ? AND category LIKE ?
    `, [`%${name}%`, `%${category}%`]);

    res.json({
      products,
      total: countRes[0].count,
      page: Number(page),
      pages: Math.ceil(countRes[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
});
