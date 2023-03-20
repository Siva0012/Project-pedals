const Products = require('../models/products_model')
const Users = require('../models/user_model')
const Category = require('../models/category_model')
const Banners = require('../models/banner_model')
const Orders = require('../models/order_model')
const Coupons = require('../models/coupons_model')
const session = require('express-session')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const moment = require('moment')
const crypto = require('crypto')

// Razor pay
const Razorpay = require('razorpay')
const instance = new Razorpay({
    key_id: 'rzp_test_eIwPjzr9pgCA29',
    key_secret: 'Aic4NzfdPjZk1oVOmKINZuUx',
  });


require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const Noty = require('noty')
const { response } = require('../routes/user_routes')
const { default: mongoose } = require('mongoose')
const { reverse } = require('dns')
const { ObjectId } = require('mongodb')


/*--------loads user login page--------*/
const viewUserLogin = (req , res , next) =>{
    try{
        if(req.session.user_id){
            res.redirect('/')
        }else{
            res.render('user_login')
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}


/*---------loads user home page---------*/
const viewUserHome = async (req , res , next) =>{
    try{
        
        if(req.session.user_id){
            const userData = await Users.findOne({ _id : req.session.user_id})
            if(!userData.block){
                const userName = userData.userName
                const productData = await Products.find({}).populate('category').exec() /*-----fetching product data------*/
                const catData = await Category.find({}) /*--------fetching category data-------*/
                const bannerData = await Banners.find({})
                const cartData = await Users.findOne({ _id : req.session.user_id}).populate('cart.productId')
                res.render('user_home' , {productData : productData , catData : catData , userName : userName , bannerData : bannerData , cartData : cartData})
            }else{
                req.session.user_id = null
                req.session.user = null
                res.redirect('/')
            }
            
        }else{
            
            const productData = await Products.find({}).exec()
            const catData = await Category.find({})
            const bannerData = await Banners.find({})
            res.render('user_home' , {productData : productData , catData : catData , bannerData : bannerData})
        }
        
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}


/*---------loads user signup page---------*/
const viewUserSignup = async (req , res , next) =>{

    try{
        res.render('user_signup')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------loads OTP entering page and send OTP--------*/
const sendOtp = async (req , res , next) =>{
    req.session.user = req.body
    const phone = req.session.user.phone
    req.session.user.countryCode = '+91'
    const countryCode = req.session.user.countryCode
    try{

        /*---sending otp---*/
        const otpResponse = await client.verify.v2
        .services(serviceSid)
        .verifications.create({
            to : `${countryCode}${phone}`,
            channel : 'sms',
        })
        res.render('user_otp')

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------post method for otp verification--------*/
const verifyOtp = async (req , res , next) => {
  const phone = req.session.user.phone;
  const countryCode = req.session.user.countryCode;
  const otp = req.body.otp
  const userData = req.session.user;
  try {
    /*-----------------verifying OTP--------------------------*/
    const isVerified = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: `${countryCode}${phone}`,
        code: otp,
      })
      .then(async (verificationResponse) => {
        if (verificationResponse.status === "approved") {
          userData.password = await bcrypt.hash(userData.password, 10);
          const users = new Users({
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
          });
          const userDetails = await users.save();
          req.session.user_id = userDetails._id /*--------session created for user------*/
          if (userDetails) {
            res.redirect('/')
          }
        } else {
        
             res.render('user_otp' , {message : 'Invalid OTP'})
             message = undefined
        }
      });
  } catch (error) {
    next(error)
    console.log(error.message);
  }
};


/*------verify user and login----------*/
const verifyUser = async (req , res , next) =>{

    const bodyUserName = req.body.userName
    const bodyPassword = req.body.password
    try{

        const userDataResponse = await Users.findOne({userName : bodyUserName})

            if (userDataResponse) {
              if (!userDataResponse.block) {
                bcrypt.compare(bodyPassword , userDataResponse.password).then((status) => {
                    if (status) {
                        req.session.user_id = userDataResponse._id; /*Creating user session*/
                        res.redirect("/");
                    } else {
                      res.render("user_login", {loginError: "Invalid credentials"});
                    }
                  });
              } else {
                res.render("user_login", {
                  isBlocked: "You have been blocked by the admin",
                });
                isBlocked = undefined;
              }
            } else {
              res.render("user_login", { loginError: "Invalid credentials" });
              loginError = undefined;
            }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------user logout-------*/
const userLogout = async (req , res , next) =>{

    try{
        req.session.user_id = null
        req.session.user = null
        res.redirect('/')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------loads view product page*/
const viewSingleProduct = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const bodyId = req.params.id
            const prodId = bodyId.toString()
            const userData = await Users.findOne({ _id : req.session.user_id})
            const userName = userData.userName
            const proData = await Products.findOne({_id : prodId})
            const catData = await Category.find({}).exec() /*--------fetching category data-------*/
            const proRes = await Users.findOne({ _id : req.session.user_id , 'cart.productId' : prodId} , {'productId.$' : 1})
            let isExist = undefined
            if(proRes){
                isExist = true
            }
            res.render('single_product' , {proData : proData , catData : catData , userName : userName , isExist : isExist})

        }else{
            const prodId = req.params.id
            const proData = await Products.findOne({_id : prodId})
            const catData = await Category.find({}).exec() /*--------fetching category data-------*/
            res.render('single_product' , {proData : proData , catData : catData})
            
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------view products page-----------*/
const viewProducts = async (req , res , next) =>{
    
    try{

        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({ _id : req.session.user_id})
            if(!userData.block){
                const catId = req.params.id
                const userName = userData.userName
                const showProducts =await Products.find({ category : catId , listed : true , stock : {$gt : 0}})
                
                const catData = await Category.find({})
                //category name
                const catDetails = await Category.findOne({ _id : catId })
                const catName = catDetails.name
                const cartData = await Users.findOne({ _id : req.session.user_id}).populate('cart.productId')
                res.render('viewall_products' , {userName : userName , showProducts : showProducts ,  catData : catData , cartData : cartData , userData : userData , catName : catName , catId : catId})
            }else{
                req.session.user_id = null
                req.session.user = null
                res.redirect('/')
            }
             
        }else{
            const catId = req.params.id
            const showProducts =await Products.find({ category : catId , listed : true , stock : {$gt : 0}})
            const catData = await Category.find({})
            const catDetails = await Category.findOne({ _id : catId })
            const catName = catDetails.name
            res.render('viewall_products' , {showProducts : showProducts , catData : catData , catName : catName , catId : catId}) 
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------view cart page------*/
const viewCart = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({_id : userId})
            const userName = userData.userName

            /*=========updating changes in cart=========*/    

            /*-------------updated user cart-------------*/
            const updatedCart = await Users.findOne({ _id : userId} , {cart : 1})

            /*--------------reducing each total product amount to cart total--------*/
            const cartTotal = updatedCart.cart.reduce(
                (total , item) => total + item.totalProductAmount, 0
            )

            /*--------------pushing total cart amount to user cart---------*/
            const totalCartPrice = await Users.updateOne(
                { _id : userId} , {totalCartAmount : cartTotal}
            )

            const proData = await Users.findOne({ _id : req.session.user_id}).populate('cart.productId')
            const catData = await Category.find({})
            res.render('cart_page' , {userName : userName , catData : catData , proData : proData})
        }else{
           
            res.redirect('/userLogin')
           
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------add to cart----------*/
const addToCart = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const proId = req.params.id
            const productData = await Products.findOne({ _id : proId})
            /*-----------updating user data with new product and it's price----------*/
            await Users.updateOne(
                {_id : userId},
                {$push : {cart : {productId : proId , totalProductAmount : productData.price}}}
                )
            
            res.redirect('/viewCart')
        }else{

            res.redirect('/userLogin')
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------Add to cart from wishlist---------*/
const addFromWish = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const productId = req.params.id
            const userId = req.session.user_id
            const proData = await Products.findOne({ _id : productId})

            //checking for existing product
            await Users.findOne(
                { _id : userId , 'cart.productId' : productId}
            )
            .then( async (response) =>{
                if(!response){
                    //add to cart
                    await Users.updateOne(
                        { _id : userId },
                        { $push : {cart : {productId : productId , totalProductAmount : proData.price}}}
                    )
                    res.json({success : true})
                }else{
                    res.json({success : false})
                }
            })
            
        }

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------change quantity-------------*/
const changeQuantity = async (req , res , next) =>{

    const proId = req.body.productId
    const proPrice = req.body.productPrice
    const count = req.body.count
    const userId = req.session.user_id
    await Users.updateOne({ _id : userId , "cart.productId" : proId } , {$inc : {'cart.$.quantity' : count}})
    
    const cartData = await Users.findOne({ _id : userId , "cart.productId" : proId} , {'cart.$' : 1})
    const totalProductAmount = proPrice * cartData.cart[0].quantity
    await Users.updateOne({ _id : userId , "cart.productId" : proId} , {$set : {"cart.$.totalProductAmount" : totalProductAmount}})//
    const updatedCart = await Users.findOne({ _id : userId} , {cart : 1})
    const totalCartAmount = updatedCart.cart.reduce((total , item) => total + item.totalProductAmount , 0)

    await Users.updateOne({ _id : userId} , {totalCartAmount : totalCartAmount})
    res.json({success : true , totalProductAmount , totalCartAmount})
}

/*--------------view wishlist page-----------*/
const viewWishList = async (req , res , next) =>{

    try {
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({_id : userId})
            const userName = userData.userName
            const catData = await Category.find({})
            const wishData = await Users.findOne({ _id : userId }).populate('wishlist.productId')
            res.render('wishlist_page' , {userName : userName , catData : catData , wishData : wishData} )
        }else{
            res.redirect('/userLogin')
        }
        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

/*---------------user profile page-------------*/
const viewUserProfile = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userData = await Users.findOne({ _id : req.session.user_id})
            const userName = userData.userName
            const catData = await Category.find({})
            res.render('user_profile' , {catData : catData , userName : userName , userData : userData})
        }else{
            res.redirect('/')
        }
            
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------------change user password-------------------*/
const changePassword = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const currentPassword = req.body.currentPassword
            const newPassword = req.body.newPassword
            await Users.findOne({ _id : userId})
            .then((response) =>{
                bcrypt.compare(currentPassword , response.password)
                .then(async (status) =>{
                    if(status){
                        const password = await bcrypt.hash(newPassword , 10)
                        await Users.updateOne({ _id : userId} , {$set : {password : password}})
                        res.json({message : 'password changed successfully'})
                    }else{
                        res.json({error : 'You entered wrong current password'})
                    }
                })
            })
        }else{
            redirect('/')
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------------delete product form cart----------*/
const deleteFromCart = async (req , res , next) =>{

    try{
        const userId = req.session.user_id
        const proId = req.params.id
        await Users.updateOne(
            {_id : userId},
            {$pull : {cart : {productId : proId}}}
        )
        /*-------------updated user cart-------------*/
        const updatedCart = await Users.findOne({ _id : userId} , {cart : 1})
        /*--------------reducing each total product amount to cart total--------*/
        const cartTotal = updatedCart.cart.reduce(
            (total , item) => total + item.totalProductAmount, 0
        )
        /*--------------pushing total cart amount to user cart---------*/
        const totalCartPrice = await Users.updateOne(
            { _id : userId} , {totalCartAmount : cartTotal}
        )
        .then(async () =>{
            const userData = await Users.findOne({ _id : userId})
            res.json(userData)
        })
        
            

        // res.redirect('/viewCart')

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------------view addresses-----------------*/
const viewAddresses = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({ _id : userId})
            const catData = await Category.find({})
            res.render('view_addresses' , {userData : userData , catData : catData})
        }else{
            res.redirect('/')
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const insertAddress = async (req , res ,next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const newAddress = {
                name : req.body.name,
                phone : req.body.phone,
                addressline : req.body.addressline,
                city : req.body.city,
                state : req.body.state,
                pincode : req.body.pincode,
                alternatePhone : req.body.alternatePhone
            }

            const response = await Users.findOneAndUpdate(
                { _id : userId},
                {$push : {addresses : newAddress}}
            )

            console.log(response);
            res.json({success : true})

        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------delete address-------------*/
const deleteAddress = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const addressId = req.params.id
            const userId = req.session.user_id
            const response = await Users.findOneAndUpdate(
                { _id : userId },
                {$pull : {addresses : {_id : addressId}}},
                {new : true}
            )
            res.json({success : true})
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------edit address----------------*/
const editAddress = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const updatedAddress = {
                name : req.body.name,
                phone : req.body.phone,
                addressline : req.body.addressline,
                city : req.body.city,
                state : req.body.state,
                pincode : req.body.pincode,
                alternatePhone : req.body.alternatePhone
            }
            const addressId = req.body.addressId
            await Users.findByIdAndUpdate(userId, { $set: { "addresses.$[elem]": updatedAddress } }, { arrayFilters: [{ "elem._id": addressId }], new: true })
            res.redirect('/viewAddresses')
        }        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------view checkout page--------*/
const viewCheckoutPage = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({ _id : userId})
            const catData = await Category.find({})
            const proData = await Users.findOne({ _id : userId}).populate('cart.productId')
            res.render('checkout_page' , {userData : userData , catData : catData , proData : proData})
        }
       
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------place order--------------*/
const placeOrder = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await Users.findOne({ _id : userId})
            const userName = userData.userName
            const catData = await Category.find({})
            const deliveryAddress = req.body.address
            const paymentMethod = req.body.paymentMethod
            const orderData = req.body
            const orderDetails = []
            orderData.products = orderDetails
            if(!Array.isArray(orderData.productId)){
                orderData.productId = [orderData.productId]
            }
            if(!Array.isArray(orderData.productTotalAmount)){
                orderData.productTotalAmount = [orderData.productTotalAmount]
            }
            if(!Array.isArray(orderData.productQuantity)){
                orderData.productQuantity = [orderData.productQuantity]
            }
            if(!Array.isArray(orderData.totalCartAmount)){
                orderData.totalCartAmount = [orderData.totalCartAmount]
            }
            if(!Array.isArray(orderData.productPrice)){
                orderData.productPrice = [orderData.productPrice]
            }

            for(let i = 0 ; i<orderData.productId.length ; i++){
                const productId = orderData.productId[i]
                const productTotalAmount = orderData.productTotalAmount[i]
                const quantity = orderData.productQuantity[i]
                const price = orderData.productPrice[i]
                orderDetails.push({productId : productId , productTotalAmount : productTotalAmount , quantity : quantity , price : price})
            }
            /*----checking payment method---*/
            if(paymentMethod === "cod"){

                const orderSummary = new Orders( {
                    userId : userId,
                    orderId : `orderId_${uuidv4()}`,
                    deliveryAddress : deliveryAddress,
                    product : orderDetails,
                    total : orderData.totalCartAmount[0],
                    paymentType : paymentMethod,
                    status : `confirmed`
                })
                await orderSummary.save()
                .then( async (response , error) =>{
                    if(error){
                        console.log('order submission failed');
                    }else{

                        /*-------Changing cart amount--------*/
                        const userUpdate = await Users.updateOne({ _id : userId} , {$set : {totalCartAmount : '0'}})

                        /*-----Empty cart-----*/
                        const orderData = await Orders.findOne({ _id : response._id}).populate('product.productId')
                        const emptyCart = []
                        await Users.updateOne({_id : userId} , {$set : {cart : emptyCart}})
                        .then((response) =>{
                            res.json({success : true , orderData : orderData})
                        })


                    }
                })
            }else{
                const totalCartAmount = Number(req.body.totalCartAmount[0])
                // const orderId = `orderId-${uuidv4()}`
                const orderId = `orderId-${uuidv4()}`.substring(0, 40);
                req.session.orderId = orderId // saving orderId to session

                /*------Razor pay instance-----*/
                const options = {
                    amount: totalCartAmount * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: orderId
                  };
                  instance.orders.create(options, async function(err, order) {
                    if(err){
                        console.log(err);
                    }else{
                        const orderSummary = new Orders( { /*----Saving order to the database----*/
                            userId : userId,
                            orderId : orderId,
                            deliveryAddress : deliveryAddress,
                            product : orderDetails,
                            total : orderData.totalCartAmount[0],
                            paymentType : paymentMethod,
                            status : 'pending'
                        })
                        let newOrderId 
                        await orderSummary.save()
                        .then((response , error) =>{
                            if(error){
                                console.log('failed order submission');
                            }else{
                                newOrderId = response._id        
                            }
                        })

                        res.json({success : false , order : order , orderId : newOrderId})
                    }
                  });
            }
            
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------verify payment--------*/
const verifyPayment = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const {payment , order , orderId} = req.body
            const sessionOrderId = req.session.orderId
            let hash = crypto.createHmac('sha256', 'Aic4NzfdPjZk1oVOmKINZuUx') /* creating hash code using sha256 algorithm */
            hash.update(order.id + "|" + payment.razorpay_payment_id , 'Aic4NzfdPjZk1oVOmKINZuUx' )
            hash = hash.digest('hex')

            if(hash == payment.razorpay_signature){
                await Orders.findOne({ orderId : sessionOrderId })
                .then((response) =>{
                })

                /*------Empty cart------*/
                const emptyCart = []
                await Users.updateOne({_id : userId} , {$set : {cart : emptyCart}})
                .then((response) =>{
                })
                /*------Changing total cart amount------*/
                const userUpdate = await Users.updateOne({ _id : userId} , {$set : {totalCartAmount : '0'}})

                /*------changing order status to ordered-----*/
                await Orders.updateOne({ orderId : sessionOrderId } , {$set : {status : "ordered"}})
                .then((response , err) =>{
                    if(err){
                        console.log('failed to update in success payment');
                    }else{
                        res.json({success : true})
                    }
                })
                
            }else{
                /*-------changing order status to payment failed-----*/
                await Orders.updateOne({ orderId : session } , {$set : {status : "Payment failed"}})
                .then((response , err) =>{
                    if(err){
                        console.log('failed to update in failed payment');
                    }else{
                        res.json({success : false})
                    }
                })
            }
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*==========================================================================verify payment by comparing two idssss left===================*/

/*--------cod order confirm page------*/
const viewCodConfirm = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const orderId = req.params.orderId
            const catData = await Category.find({})
            const userData = await Users.findOne({ _id : userId})
            const orderData = await Orders.findOne({ _id : orderId}).populate('product.productId')
            const userName = userData.userName
            res.render('cod_order_confirm' , {userData : userData , userName : userName , catData : catData , orderData : orderData , moment : moment })
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const redeemCoupon = async (req , res , next) =>{

    try{

        if(req.session.user_id){

            const userId = req.session.user_id
            const couponCode = req.body.couponCode
            const userData = await Users.findOne({ _id : userId})
            const coupon = await Coupons.findOne({couponCode : couponCode});
    
            /*------coupon checking parameters-----*/
            const totalCartAmount = userData.totalCartAmount
            const currentDate = new Date()
            if(!coupon){
                return res.json({error : 'No coupon exists!!!'})
            }else{
                const expiryDate = coupon.expiryDate
                const minPurchaseAmount = coupon.minPurchaseAmount
                const maxDiscountPercentage = coupon.percentageDiscount / 100
                const maxDiscountAmount = coupon.maxDiscount
                const isClaimed = await Coupons.findOne({ couponCode : couponCode, claimedUsers: {$elemMatch: {userId: userId}}});
                if(isClaimed){
                    return res.json({claimed : 'Already claimed'})
                }else{
                    if(currentDate <= expiryDate){
                        if(totalCartAmount >= minPurchaseAmount){
    
                            const availableDiscountAmount = totalCartAmount * maxDiscountPercentage
                            let discountGained
                            if(availableDiscountAmount >= maxDiscountAmount){
                                discountGained = maxDiscountAmount
                            }else{
                                discountGained = availableDiscountAmount
                            }
                            const oldCartAmount = totalCartAmount
                            const newTotalCartAmount = totalCartAmount - discountGained
    
                            const discountAmount = oldCartAmount - newTotalCartAmount
                            return res.json({message : 'Coupon applied!' , oldCartAmount : oldCartAmount , newTotalCartAmount : newTotalCartAmount , couponCode : couponCode , discountAmount : discountAmount})
    
                        }else{
                            return res.json({minimumAmount : `Minimum purchase amount is Rs.${minPurchaseAmount}`})
                        }
                    }else{
                        return res.json({couponExpired: 'The coupon has expired!'})
                    }
    
                }
            }
        }else{
            redirect('/')
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------Add to wishlist-------*/
const addToWishlist = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const proId = req.params.proId

            await Users.updateOne({ _id : userId} , {$push : {wishlist : {productId : proId}}} , {new : true})
            .then((response) =>{
                res.json(response)
            })
        }

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------Remove from wishlist-------*/
const removeFromWishlist = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const productId = req.params.proId

            await Users.updateOne(
                { _id : userId},
                {$pull : {wishlist : {productId : productId}}}
            )
            .then(response =>{
                res.json(response)
            })

        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----Delete from wishlist-----*/
const deleteFormWishlist = async (req , res , next) =>{

    try{

        if(req.session.user_id){
            const userId = req.session.user_id
            const proId = req.params.proId
            await Users.updateOne({ _id: userId }, { $pull: { wishlist: { productId: proId } } }, { new: true })
            await Products.updateOne({ _id : proId} , {$push : {wishlistedUsers : {userId : userId}}} , {new : true})
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------view orders--------*/
const viewOrders = async (req , res , next) =>{

    try{
        if(req.session.user_id){
            const userId = (req.session.user_id) 
            const catData = await Category.find({})
            const userData = await Users.findOne({ _id : userId})
            const orderDetails = await Orders.find({}).populate('userId').populate('product.productId')
            let orderData = []
            for(let i = 0 ; i < orderDetails.length ; i++){
                if(orderDetails[i].userId._id.equals(userId)){
                    orderData[i] = orderDetails[i]
                }
            }

            orderData = orderData.reverse()
            const userName = userData.userName
            res.render('view_orders' , {catData : catData , userName : userName , orderData : orderData , moment : moment})
        }else{
            res.render('user_login')
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------Request for return-----*/
const returnRequest = async (req , res , next) =>{

    try{

        const{orderId , productId} = req.body
        await Orders.updateOne(
            { _id : orderId , 'product.productId' : productId},
            {$set : {status : 'requested for return' , 'product.$.orderStatus' : "requestedReturn"}}
        )
        .exec()
        .then((response) =>{
            if(response){
                res.json({success : true})
            }
        })


    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const searchProducts = async (req , res , next) =>{

    try{
        let payload = req.body.payload
        let catId = req.body.catId
        let searchKey = new RegExp(payload , "i")
        let search = await Products.find({name : searchKey , category : catId})
        search = search.slice(0 , 4)
        res.send({payload : search})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

module.exports = {
    viewUserLogin,
    viewUserHome,
    viewUserSignup,
    sendOtp,
    verifyOtp,
    verifyUser,
    userLogout,
    viewSingleProduct,
    viewProducts,
    viewCart,
    addToCart,
    changeQuantity,
    viewWishList,
    addFromWish,
    viewUserProfile,
    deleteFromCart,
    viewAddresses,
    insertAddress,
    deleteAddress,
    editAddress,
    viewCheckoutPage,
    changePassword,
    redeemCoupon,
    addToWishlist,
    removeFromWishlist,
    searchProducts,
    viewOrders,
    returnRequest
}