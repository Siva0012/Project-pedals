const express = require('express')

/*----admin router----*/
const admin_router = express() 
const path = require('path')
const auth = require('../middlewares/admin_auth') /*for session management*/
const upload = require('../middlewares/multer')/*multer*/
const adminController = require('../controllers/admin_controller')
const productController = require('../controllers/product_controller')
const categoryController = require('../controllers/category_controller')
const bannerController = require('../controllers/banner_controller')


admin_router.set('views' , './views/admin')


admin_router.get('/' , auth.isLogOut , adminController.adminLogin)

admin_router.post('/' , adminController.adminVerify)

admin_router.get('/adminPanel' , auth.isLogIn , adminController.adminPanel)

admin_router.get('/viewProducts' , auth.isLogIn , productController.viewProducts)/*changed to----------*/

admin_router.get('/addProducts' , auth.isLogIn , adminController.addProducts)

admin_router.post('/insertProducts' , upload.array('image' , 4) , productController.insertProduct)/*changed to----------*/

admin_router.get('/viewCategories' , auth.isLogIn , categoryController.viewCategories)/*changed to----------*/

admin_router.get('/addCategory' , auth.isLogIn , adminController.addCategory)

admin_router.post('/insertCategory' , auth.isLogIn , categoryController.insertCategory) /*changed to----------*/

admin_router.get('/deleteCategory/:id' , auth.isLogIn , categoryController.deleteCategory) /*changed to----------*/

admin_router.get('/deleteProduct/:id' , auth.isLogIn , productController.deleteProduct) /*changed to----------*/

admin_router.get('/adminLogout' , auth.adminLogout)

admin_router.get('/viewUsers' , auth.isLogIn , adminController.viewUsers)

admin_router.get('/blockUser/:id' , auth.isLogIn , adminController.blockUser)

admin_router.get('/unblockUser/:id' , auth.isLogIn , adminController.unblockUser)

admin_router.get('/editProduct/:id' , auth.isLogIn , productController.viewEditProduct)

admin_router.get('/deleteProductImage/:productId/:imageName' , auth.isLogIn, productController.deleteProductImages)

admin_router.post('/updateProduct' , productController.updateProduct)

admin_router.get('/viewBanner' , bannerController.viewBanner)

admin_router.get('/addBanner' , bannerController.showAddBanner)

admin_router.post('/insertBanner' , upload.single('image') , bannerController.insertBanner)

admin_router.get('/deleteBanner/:id' , bannerController.deleteBanner)

admin_router.get('/unlistProduct/:id' , adminController.unlistProduct)

admin_router.get('/listProduct/:id' , adminController.listProduct)

admin_router.get('/viewOrders' , adminController.viewOrders)

admin_router.post('/updateProductImage' , upload.array('image' , 4) , productController.updateProductImage)

module.exports = admin_router