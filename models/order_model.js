const mongoose = require('mongoose')
const {v4:uuidv4} = require('uuid')
const Product = require('../models/products_model')

const orderSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        orderId : {
            type : String,
            unique : true,
            required : true,
        },
        deliveryAddress : {
            type : String,
            required : true,
        },
        date : {
            type : Date,
            default : Date.now()
        },
        deliveredDate : {
            type : Date,
        },
        product : [
            {
                productId : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'Product',
                    required : true
                },
                quantity : {
                    type : Number,
                    required : true
                },
                price : {
                    type : Number,
                    required : true
                },
                productTotalAmount : {
                    type : Number,
                    required : true
                },
                orderStatus : {
                    type : String
                }
            }
        ],
        total : {
            type : Number,
        },
        discount : {
            type : Number,
        },
        paymentType : {
            type : String,
            required : true
        },
        status : {
            type : String,
            default : 'pending'
        }
    }
)

module.exports = mongoose.model('Order' , orderSchema)