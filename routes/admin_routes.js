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

admin_router.post('/updateProduct' , auth.isLogIn , productController.updateProduct)

admin_router.get('/viewBanner' , auth.isLogIn , bannerController.viewBanner)

admin_router.get('/addBanner' , auth.isLogIn , bannerController.showAddBanner)

admin_router.post('/insertBanner' , auth.isLogIn , upload.single('image') , bannerController.insertBanner)

admin_router.get('/deleteBanner/:id' , auth.isLogIn , auth.isLogIn , bannerController.deleteBanner)

admin_router.get('/unlistProduct/:id' , auth.isLogIn , adminController.unlistProduct)

admin_router.get('/listProduct/:id' , auth.isLogIn , adminController.listProduct)

admin_router.get('/viewOrders' , auth.isLogIn , adminController.viewOrders)

admin_router.post('/updateProductImage' , auth.isLogIn , upload.array('image' , 4) , productController.updateProductImage)

admin_router.get('/viewCoupons' , adminController.viewCoupons)

admin_router.post('/addCoupon' , auth.isLogIn , adminController.addCoupon)

admin_router.post('/deleteCoupon', auth.isLogIn , adminController.deleteCoupon)

admin_router.get('/viewSingleOrder/:orderId' , auth.isLogIn , adminController.viewSingleOrder)

admin_router.post('/changeOrderStatus/:status/:orderId' , auth.isLogIn , adminController.changeOrderStatus)

admin_router.get('/updateChart' , auth.isLogIn ,adminController.updateChart)

admin_router.get('/updateDonut' , auth.isLogIn , adminController.updateDonut)

admin_router.get('/viewSalesReport' , auth.isLogIn , adminController.viewSalesReport)

admin_router.post('/getSalesReport' , auth.isLogIn , adminController.getSalesReport)

admin_router.get('/viewReturnRequests/:orderId' , auth.isLogIn , adminController.viewReturnRequests)

admin_router.post('/changeReturnStatus/:status' , auth.isLogIn , adminController.changeReturnStatus)

module.exports = admin_router