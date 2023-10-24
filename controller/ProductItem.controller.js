const db = require('../config/database/db.config');

// Create a product variant
const createProductVariant = (req, res) => {
    const { product_id, size, color, color_code, amount } = req.body;
    const query = 'INSERT INTO product_items (product_id, size, color, color_code, amount) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [product_id, size, color, color_code, amount], (err, result) => {
        if (err) {
            console.error('Error creating product variant:', err);
            return res.status(500).json({ error: 'Error creating product variant' });
        }
        res.status(201).json({ message: 'Product variant created', productVariantId: result.insertId });
    });
};

// Get all product variants for a product
const getProductVariantsByProductId = (req, res) => {
    const productId = req.params.productId;
    const query = 'SELECT * FROM product_items WHERE product_id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product variants:', err);
            return res.status(500).json({ error: 'Error fetching product variants' });
        }
        res.json(results);
    });
};

// Update a product variant
const updateProductVariant = (req, res) => {
    const productVariantId = req.params.id;
    const { size, color, color_code, amount } = req.body;
    const query = 'UPDATE product_items SET size = ?, color = ?, color_code = ?, amount = ? WHERE id = ?';
    db.query(query, [size, color, color_code, amount, productVariantId], (err, result) => {
        if (err) {
            console.error('Error updating product variant:', err);
            return res.status(500).json({ error: 'Error updating product variant' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product variant not found' });
        }
        res.json({ message: 'Product variant updated' });
    });
};

// Delete a product variant
const deleteProductVariant = (req, res) => {
    const productVariantId = req.params.id;
    const query = 'DELETE FROM product_items WHERE id = ?';
    db.query(query, [productVariantId], (err, result) => {
        if (err) {
            console.error('Error deleting product variant:', err);
            return res.status(500).json({ error: 'Error deleting product variant' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product variant not found' });
        }
        res.json({ message: 'Product variant deleted' });
    });
};

module.exports = {
    createProductVariant,
    getProductVariantsByProductId,
    updateProductVariant,
    deleteProductVariant,
};
