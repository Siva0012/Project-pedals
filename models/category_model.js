const mongoose = require('mongoose')

const categorySchema = mongoose.Schema(
    {
        name : {
            type : String,
            required :true
        },

        description : {
            type : String,
            required :true
        },

        date : {
            type : Date,
            required : true,
            default : Date.now()
        }
    }
)

module.exports = mongoose.model('Categories' , categorySchema)