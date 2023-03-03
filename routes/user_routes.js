const express = require('express')
const user_router = express()
const userController = require('../controllers/user_controller')


user_router.set('views' , './views/user')


user_router.get('/' , userController.viewUserHome) /*view user home page*/

user_router.get('/userLogin' , userController.viewUserLogin) /*view user login page*/

user_router.post('/userLogin' , userController.verifyUser)/*post login*/

user_router.get('/userHome' , userController.viewUserHome)

user_router.get('/viewUserSignup' , userController.viewUserSignup)

user_router.post('/userSignup' , userController.sendOtp)

user_router.post('/verifyOtp' , userController.verifyOtp)

user_router.post('/verifyUser' , userController.verifyUser) /*verify user after login post login*/

user_router.get('/userLogout' , userController.userLogout)

user_router.get('/viewSingleProduct/:id' , userController.viewSingleProduct)

user_router.get('/viewAllProducts/:id' , userController.viewProducts)

user_router.get('/viewCart' , userController.viewCart)

user_router.get('/addToCart/:id' , userController.addToCart)

user_router.post('/changeQuantity' , userController.changeQuantity)

user_router.get('/viewwishlist' , userController.viewWishList)

user_router.get('/userProfile' , userController.viewUserProfile)

user_router.post('/changePassword' , userController.changePassword)

user_router.get('/deleteFromCart/:id' , userController.deleteFromCart)

user_router.get('/viewAddresses' , userController.viewAddresses)

user_router.post('/insertAddress' , userController.insertAddress)

user_router.get('/deleteAddress/:id' , userController.deleteAddress)

user_router.post('/editAddress' , userController.editAddress)

user_router.get('/viewCheckoutPage' , userController.viewCheckoutPage)

user_router.post('/placeOrder' , userController.placeOrder)


module.exports = user_router