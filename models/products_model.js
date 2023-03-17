const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const productSchema = mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        stock : {
            type : Number,
            required :true
        },
        images : {
            type : Array,
        },
        description : {
            type : String,
            required : true
        },
        category : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Categories',
            required : true
        },
        categoryName : {
            type : String,
            required : true
        },
        listed : {
            type : Boolean,
            default : true,
        }
        
               
    }
)

module.exports = new mongoose.model('Product' , productSchema)