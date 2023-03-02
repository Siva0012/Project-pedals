const Admin = require('../models/admin_model')
const Products = require('../models/products_model')
const Categories = require('../models/category_model')
const Users = require('../models/user_model')
const Orders = require('../models/order_model')


/*------------loads admin login page------------*/
const adminLogin = async(req,res , next) =>{

    try{
        res.render('admin_login')
        
    }catch(error){
        next(error)
        console.log(error.message);/*------errr handlimg middlware*/
    }
}

/*----------------------Loads add category page----------------------*/
const addCategory = async (req , res , next) =>{ 
    try{
        res.render('add_categories')
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
        res.render('admin_panel')
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
        res.render('view_users' , {userData : userData})
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
        const proData = await Products.updateOne({ _id : proId} , {listed : 'true'})
        res.redirect('/admin/viewProducts')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------view orders-----------*/
const viewOrders = async (req , res , next) =>{

    try{
        let orderDetails = []
        const orderData = await Orders.find({})

        for(let i = 0 ; i<orderData.length ; i ++){
            await Orders.findOne({_id : orderData[i]._id}).populate("product.productId").populate("userId")
            .then((response) =>{

                orderDetails.push(response)
            })
        }
        orderDetails = orderDetails.reverse()

        res.render('view_orders' , {orderDetails : orderDetails})

    }catch(error){
        next(error)
        console.log(error.message);
    }
}




module.exports = {adminLogin , adminVerify , adminPanel , viewUsers , blockUser , unblockUser , addCategory ,addProducts , unlistProduct , listProduct , viewOrders}

