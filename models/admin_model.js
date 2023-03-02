const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({

    adminname : {
        type : String,
        required : true
    },
    password : {
        type : String,
        require : true
    }

})

module.exports = mongoose.model('Admin' , adminSchema)

