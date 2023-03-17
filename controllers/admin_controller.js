const Admin = require('../models/admin_model')
const Products = require('../models/products_model')
const Categories = require('../models/category_model')
const Users = require('../models/user_model')
const Orders = require('../models/order_model')
const Coupons = require('../models/coupons_model')
const moment = require('moment')
const { response } = require('../routes/user_routes')
const { default: mongoose } = require('mongoose')


/*------------loads admin login page------------*/
const adminLogin = async(req,res , next) =>{

    try{
        res.render('admin_login')
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------------------Loads add category page----------------------*/
const addCategory = async (req , res , next) =>{ 
    try{
        const adminData = await Admin.findOne({})
        res.render('add_categories' , {adminData : adminData})
    }
    catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------------post request for login--------------*/
const adminVerify = async (req , res , next) =>{
    try{
        
        const adminname = req.body.adminname
        const password = req.body.password
        const adminData = await Admin.findOne({adminname : adminname , password : password})
        if(adminData){
            
            req.session.admin_id = adminData._id /*-----session created for admin-----*/
            res.redirect('/admin/adminPanel')
        }else{
            res.render('admin_login' , {loginError : 'wrong username or password'} )
            loginError = undefined
        }
       
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const adminPanel = async (req , res , next)=> {
    try{

        const totalSales = await Orders.find(
            {status : 'delivered'}
        ).count()
        console.log('total sales' , totalSales);
        const revenue = await Orders.aggregate(
            [
                {
                    $match : {status : "delivered"}
                },
                {
                    $group : { _id : null , total : {$sum : "$total"}}
                }
            ]
        )

        // recent orders
        const now = new Date()
        const weekStart = new Date(now.getFullYear() , now.getMonth() , now.getDate() - 6 , 0 , 0 , 0 )
        const weekEnd = new Date(now.getFullYear() , now.getMonth() , now.getDate() , 23 , 59 , 59 , 999)

        console.log('this is weekstart' , weekStart);
        console.log('this is weekend' , weekEnd);

        let recentData = await Orders.aggregate(
            [
                {
                    $match : {status : "delivered"}
                },
                {
                    $lookup : {
                        from : 'users',
                        localField : 'userId',
                        foreignField : '_id',
                        as : 'user'
                    }
                },
                {
                    $project : {
                        _id : 1,
                        orderId : 1,
                        date : 1,
                        total : 1,
                        paymentType : 1,
                        status : 1,
                        user : {$arrayElemAt : ['$user' , 0]}
                    }
                }

            ]
        )

        recentData = recentData.reverse()
        const adminData = await Admin.findOne({})

            res.render('admin_panel' , {totalSales : totalSales , revenue : revenue[0].total , recentData : recentData , moment : moment , adminData : adminData})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------------loading product viewing page----------------*/
const addProducts = async (req , res , next) =>{ 

    try{
        const catagoryData = await Categories.find({})
        res.render('add_products' , {catagoryData})
    }catch(error){
        next(error)
        console.log(error);
    }
}

/*---------------loads view users page--------------------*/
const viewUsers = async (req , res , next) =>{

    try{
        const userData = await Users.find({}).exec()
        const adminData = await Admin.findOne({})
        res.render('view_users' , {userData : userData , adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------------block users--------------------------*/
const blockUser = async (req , res , next) =>{

    try{

        const userId = req.params.id
        const blockResponse = await Users.updateOne({ _id : userId} , {block : 'true'})
        res.redirect('/admin/viewUsers')
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------------unblock users------------------------*/
const unblockUser = async (req , res , next) =>{

    try{
        const userId = req.params.id
        const unblockResponse = await Users.updateOne({_id : userId} , {$set : {block : 'false'}})
        res.redirect('/admin/viewUsers')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------------unlist product-----------------*/
const unlistProduct = async(req , res , next) =>{

    try{
        const proId = req.params.id
        const proData = await Products.updateOne({ _id : proId} ,  {listed : 'false'})
        res.redirect('/admin/viewProducts')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------list product------------*/
const listProduct = async (req , res , next) =>{

    try{
        const proId = req.params.id
        const adminData = await Admin.findOne({})
        const proData = await Products.updateOne({ _id : proId} , {listed : 'true'})
        res.redirect('/admin/viewProducts' , {adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------view orders-----------*/
const viewOrders = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        let orderDetails = []
        const orderData = await Orders.find({})

        for(let i = 0 ; i<orderData.length ; i ++){
            await Orders.findOne({_id : orderData[i]._id}).populate("product.productId").populate("userId")
            .then((response) =>{

                orderDetails.push(response)
            })
        }
        orderDetails = orderDetails.reverse() /*===================================adminData to all function and check discount amount by ordering something, after that, check wallet payment options conditions like if cod and online there are difference==================================*/

        res.render('view_orders' , {orderDetails : orderDetails , moment : moment , adminData : adminData})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------view single order--------*/
const viewSingleOrder = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        const orderId =  req.params.orderId
        console.log('this is orderId in viewSingleOrderrr' , orderId);

        const orderData = await Orders.findOne({ _id : orderId}).populate('product.productId').populate('userId')
        console.log('this is the orderData in viewSingleOrder' , orderData);
        res.render('view_single_order' , {orderData : orderData , moment : moment , adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}


const viewCoupons = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        await Coupons.find()
        .then((response) =>{
            res.render('view_coupons' , {couponData : response , moment : moment , adminData : adminData})
        })

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const addCoupon = async (req , res , next) =>{

    try{
        
        const{couponCode , expiryDate , maxDiscount , minPurchaseAmount , percentageDiscount} = req.body
        const newCoupon = new Coupons( {
            couponCode : couponCode,
            expiryDate : expiryDate,
            percentageDiscount : percentageDiscount,
            maxDiscount : maxDiscount,
            minPurchaseAmount : minPurchaseAmount,
            percentageDiscount : percentageDiscount
        })

        await newCoupon.save()
        .then((response) =>{
            console.log('Successfully added new coupon' , response);
        })

        return res.json({response : `Added coupon : ${couponCode}`})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------Delete coupon--------*/
const deleteCoupon = async (req , res , next) =>{

    try{
        console.log('this is req.body in serverside' , req.body);
        const couponId = req.body.couponId
        await Coupons.findByIdAndDelete(couponId)
        .then((response) =>{
            console.log('this is response after deletion' , response);
            res.json(response )
        })
    }catch(error){
        console.log(error.message);
    }
}

/*------change order status-----*/
const changeOrderStatus = async (req , res , next) =>{

    try{
        const status = req.params.status
        console.log(status);
        const orderId = req.params.orderId
        if(status === "returnaccepted"){
            const response = await Orders.findOneAndUpdate({ _id : orderId} , {$set : {status : "return accepted"}}).populate('product.prodcutId')
            console.log('this is response in return accepted' , response);
            console.log('this is products in the same' , response.product);
        }else if(status === "returndeclined"){
            const response = await Orders.updateOne({ _id : orderId} , {$set : {status : "return declined"}})
        }else if(status === "delivered"){
            const response = await Orders.updateOne({ _id : orderId , 'product.productId' : {$exists : true} } , {$set : {status : status , deliveredDate : Date.now() , 'product.$[].orderStatus' : status }})
        }else{
            const respsonse = await Orders.updateOne({ _id : orderId} , {$set : {status : status }})
        }
        if(response){
            res.json(response)
        }

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------view return requests--------*/
const viewReturnRequests = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        const orderId = req.params.orderId
        const orderData = await Orders.findOne({ _id : orderId }).populate("product.productId")
        res.render('view_return_requests' , {orderData : orderData , moment : moment , adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*----------Change return status---------*/
const changeReturnStatus = async (req , res , next) =>{

    try{
        const status = req.params.status
        const{orderId , productId , userId} = req.body

        if(status === "accept"){
            await Orders.updateOne({ _id : orderId , 'product.productId' : productId} , {$set : {'product.$.orderStatus' : "return accepted"}})
            //finding quantity of the product
            const orderData = await Orders.aggregate([
                { $match: { _id : mongoose.Types.ObjectId(orderId) } },
                { $unwind: '$product' },
                { $match: { 'product.productId': mongoose.Types.ObjectId(productId) } },
                { $project: { quantity: '$product.quantity' } }
              ])
            
              const quantity = orderData[0].quantity
            //updating stock of the product
              await Products.updateOne({ _id : productId} , {$inc : {stock : quantity}})
            //order details for total amount
              const orderDetails = await Orders.findOne({ _id : orderId })
            //updating wallet of user
              await Users.updateOne({ _id : userId} , {$inc : {walletAmount : +orderDetails.total}})
        }else{
            // decline return request
            await Orders.updateOne({ _id : orderId , 'product.productId' : productId} , {$set : {'product.$.orderStatus' : "return declined"}})
        }

        res.json({sucess : true})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-------Update chart-------*/
const updateChart = async (req, res, next) => {

    try {

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        console.log('this is oneweekago' , oneWeekAgo);
        const salesPerDay = await Orders.aggregate([
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {
                                    $and: [
                                        { paymentType: "online" },
                                        { status: { $not: { $eq: "pending" } } },
                                    ],
                                },
                                { $and: [{ paymentType: "cod" }, { status: "delivered" }] },
                            ],
                        },
                        { date: { $gte: oneWeekAgo } },
                    ],
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$date",
                        },
                    },
                    sales: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        res.json({ salesPerDay })

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

/*--------Update donut chart--------*/
const updateDonut = async (req , res , next) =>{

    try{
        await Orders.aggregate([

            {$match : {$or : [{$and : [{paymentType : "online"} , {status : {$not : {$eq : 'pending'}}}]} , {$and : [{paymentType : "cod"} , {status : "delivered"} ] } ]}},
            {$group : {_id : "$paymentType" , count : {$sum : 1 }}}
        ])
        .then((response) =>{
            res.json(response)
        })

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------View sales report----------*/
const viewSalesReport = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        const salesReport = undefined
        res.render('sales_report' , {adminData : adminData})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------Get sales report------*/
const getSalesReport = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        console.log('this is req body inr report' , req.body);
        const {fromDate , toDate} = req.body
        
        // Set the start date to the beginning of the day
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);

        // Set the end date to the end of the day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        console.log(startDate , endDate);
        let salesReport = await Orders.find(
            {status : "delivered" , date : {$gte : startDate , $lte : endDate}}
        ).populate('userId')
        
        salesReport = salesReport.reverse()
        res.render('sales_report' , {salesReport : salesReport , moment : moment , adminData : adminData})
        // res.json({salesReport : salesReport})
        
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}



module.exports = {adminLogin , adminVerify , adminPanel , viewUsers , blockUser , unblockUser , addCategory ,addProducts , unlistProduct , listProduct , viewOrders , viewCoupons , addCoupon , viewSingleOrder , changeOrderStatus , viewReturnRequests , deleteCoupon , updateChart , updateDonut , getSalesReport , viewSalesReport , changeReturnStatus}

