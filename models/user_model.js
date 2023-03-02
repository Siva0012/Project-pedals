const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    userName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone :{
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        required : true,
        default : Date.now()
    },
    block : {
        type : Boolean,
        required : true,
        default : false
    },
    cart : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Product',
                required : true
            },
            quantity : {
                type : Number,
                default : 1
            },
            totalProductAmount : {
                type : Number,
            }
            
        }
    ],
    wishlist : [
         {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product'
        }
    ],
    totalCartAmount : {
        type : Number,
        default : 0
    },
    addresses : [
        {   
            name : {
                type : String,
                required : true
            },
            phone : {
                type : String,
                required : true
            },
            addressline : {
                type : String,
                required : true
            },
            city : {
                type : String,
                required : true
            },
            state : {
                type : String,
                required : true
            },
            pincode : {
                type : String,
                required : true
            },
            alternatePhone : {
                type : String,
                required : true
            }
        }        
    ]

})



module.exports =  mongoose.model('User' , userSchema)