const router = require('express').Router()
const productController = require('../controllers/productController')

router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)
router.get('/category/:categoryId', productController.getProductsByCategoryId)
router.post('/', productController.createProduct)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

module.exports = router