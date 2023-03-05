const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema(
    {
        couponCode : {
            type : String,
            required : true,
            unique : true
        },
        percentageDiscount : {
            type : Number,
            required : true,
            min : 0,
            max : 100
        },
        maxDiscount : {
            type : Number,
            required : true,
            min : 0
        },
        expiryDate : {
            type : Date,
            required : true
        },
        status : {
            type : String,
            enum : ['Active' , 'inActive'],
            default : 'inActive'
        },
        minPurchaseAmount : {
            type : Number,
            required : true,
            min : 0
        },
        claimedUsers : [
            {
                userId : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'User'
                }
            }
        ]
    }
)

module.exports = mongoose.model('Coupon' , couponSchema)