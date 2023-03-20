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
const { default: mongoose } = require('mongoose')
const instance = new Razorpay({
    key_id: 'rzp_test_eIwPjzr9pgCA29',
    key_secret: 'Aic4NzfdPjZk1oVOmKINZuUx',
  });



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
            req.session.couponCode = req.body.couponData
            let discountAmount = Number(req.body.discountAmount) 
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

            const walletUpdate = orderData.totalCartAmount[0]

            for(let i = 0 ; i<orderData.productId.length ; i++){
                const productId = orderData.productId[i]
                const productTotalAmount = orderData.productTotalAmount[i]
                const quantity = orderData.productQuantity[i]
                const price = orderData.productPrice[i]
                orderDetails.push({productId : productId , productTotalAmount : productTotalAmount , quantity : quantity , price : price})
            }
            /*----checking payment method---*/
            if(paymentMethod === "cod"){                                                        /*-----------cod-----------*/
                const orderSummary = new Orders( {
                    userId : userId,
                    orderId : `orderId_${uuidv4()}`,
                    deliveryAddress : deliveryAddress,
                    product : orderDetails,
                    total : orderData.totalCartAmount[0],
                    paymentType : paymentMethod,
                    status : `confirmed`,
                    discount : discountAmount
                })
                await orderSummary.save()                                      //saving order
                .then( async (response , error) =>{
                    if(error){
                        console.log('order submission failed');
                    }else{

                        /*-------Changing cart amount--------*/
                        const userUpdate = await Users.updateOne({ _id : userId} , {$set : {totalCartAmount : '0'}})

                        /*-------Updating stock------*/
                        for(let i =0 ; i<req.body.productId.length ; i ++){
                            
                                let decreaseQuantity = req.body.productQuantity[i]
                                await Products.updateOne({ _id : req.body.productId[i]} , {$inc : {stock : -decreaseQuantity}})
                            
                        }

                        /*-----Empty cart-----*/
                        const orderData = await Orders.findOne({ _id : response._id}).populate('product.productId')
                        const emptyCart = []
                        await Users.updateOne({_id : userId} , {$set : {cart : emptyCart}})
                        .then((response) =>{
                            res.json({success : true , orderData : orderData})
                        })

                        /*--------Applying coupon--------*/
                        const couponCode = req.body.couponData
                        await Coupons.updateOne({couponCode : couponCode} , {$push : {claimedUsers : {userId : userId}}} , {new : true})
                        .then((response , error) =>{
                            if(error) {
                                console.log(error);
                            }else{
                                console.log('coupon update response' , response);
                            }

                        })

                    }
                })
            }else if(paymentMethod === "online"){                                                                             /*------------Online payment---------*/
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
                            status : 'pending',
                            discount :  discountAmount
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
            }else{
                
                const walletAmount = userData.walletAmount
                const orderSummary = new Orders( {
                    userId : userId,
                    orderId : `orderId_${uuidv4()}`,
                    deliveryAddress : deliveryAddress,
                    product : orderDetails,
                    total : orderData.totalCartAmount[0],
                    paymentType : paymentMethod,
                    status : `confirmed`,
                    discount : discountAmount
                })
                await orderSummary.save()                                      //saving order
                .then( async (response , error) =>{
                    if(response){
                        
                        /*----------Updating wallet amount-----------*/
                        const walletUpdateResponse = await Users.updateOne({ _id : userId } , {$inc : {walletAmount : -walletUpdate} })

                        /*-------Changing cart amount--------*/
                        const userUpdate = await Users.updateOne({ _id : userId} , {$set : {totalCartAmount : '0'}})

                        /*-------Updating stock------*/
                        for(let i =0 ; i<req.body.productId.length ; i ++){
                            
                                let decreaseQuantity = req.body.productQuantity[i]
                                await Products.updateOne({ _id : req.body.productId[i]} , {$inc : {stock : -decreaseQuantity}})
                            
                        }

                        /*-----Empty cart-----*/
                        const orderData = await Orders.findOne({ _id : response._id}).populate('product.productId')
                        const emptyCart = []
                        await Users.updateOne({_id : userId} , {$set : {cart : emptyCart}})
                        .then((response) =>{
                            res.json({success : true , orderData : orderData})
                        })

                        /*--------Applying coupon--------*/
                        const couponCode = req.body.couponData
                        await Coupons.updateOne({couponCode : couponCode} , {$push : {claimedUsers : {userId : userId}}} , {new : true})
                        .then((response , error) =>{
                            if(error) {
                                console.log(error);
                            }else{
                                console.log('coupon update response' , response);
                            }

                        })
                    }else{
                        console.log('order submission failed' , error);
                    }
                })
                
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
                    console.log('this is orderssss' , response);
                })

                /*------Empty cart------*/
                const emptyCart = []
                await Users.updateOne({_id : userId} , {$set : {cart : emptyCart}})
                .then((response) =>{
                    console.log('this is response after cart empty' , response);
                })

                /*------Changing total cart amount------*/
                const userUpdate = await Users.updateOne({ _id : userId} , {$set : {totalCartAmount : '0'}})

                /*----------Updating stock---------*/
                let productIds = []
                let productQuantity = []
                const orderDetails = await Orders.findOne({ _id : orderId}).populate('product.productId')
                for(let i = 0 ; i<orderDetails.product.length ; i++){
                    productIds[i] = orderDetails.product[i].productId._id
                    productQuantity[i] = orderDetails.product[i].quantity
                }
                for(let i = 0 ; i < productIds.length ; i++){
                    let decreaseQuantity = productQuantity[i]
                    await Products.updateOne({ _id : productIds[i]} , {$inc : {stock : -decreaseQuantity}})
                }
                
                /*------changing order status to ordered-----*/
                await Orders.updateOne({ orderId : sessionOrderId } , {$set : {status : "ordered"}})
                .then((response , err) =>{
                    if(err){
                        console.log('failed to update in success payment');
                    }else{
                        res.json({success : true})
                    }
                })

                /*--------Applying coupon-------*/
                await Coupons.updateOne({ couponCode : req.session.couponCode} , {$push : {claimedUsers : {userId : userId}}} , {new : true})
                .then((response) =>{
                    console.log('this is response after coupon updation' , response);
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

const cancelOrder = async (req , res, next) =>{

    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const orderId = req.body.orderId
            const orderData = await Orders.findOne({ _id : orderId})
            const total = orderData.total

            //changing order status
            await Orders.updateOne({ _id : orderId} , {$set : {status : "cancelled"}})
            //changing wallet amount of user
            if(orderData.paymentType == "online" || orderData.paymentType == "wallet"){
                await Users.updateOne({ _id : userId} , {$inc : {walletAmount : +total}})
            }
            res.json({success : true})
        }
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

module.exports = {
    placeOrder,
    verifyPayment,
    viewCodConfirm,
    cancelOrder
}