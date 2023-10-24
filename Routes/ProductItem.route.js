const productVariantsController = require('../controller/ProductItem.controller');
const { userGuard, adminGuard } = require('../middleware/auth.middleware')


const productVariant = (app) => {
    // Create a product variant
    app.post('/api/product-variant/',userGuard, adminGuard, productVariantsController.createProductVariant);

    // Get all product variants for a product
    app.get('/api/product-variant/:productId', productVariantsController.getProductVariantsByProductId);

    // Update a product variant
    app.put('/api/product-variant/:id',userGuard, adminGuard, productVariantsController.updateProductVariant);

    // Delete a product variant
    app.delete('/api/product-variant/:id',userGuard, adminGuard, productVariantsController.deleteProductVariant);
}



module.exports = productVariant;
