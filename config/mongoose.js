const mongoose = require('mongoose')
require('dotenv').config()


let connectToDatabase = () =>{

    const url = process.env.MONGODB_URL
    mongoose.connect(url , 
    {
        useNewUrlParser : true,
        useUnifiedTopology : true
    }
    ).then(() =>{
        console.log('connected to server');
    }).catch(err => console.log("Error connecting to server" + err))
}

module.exports = {connectToDatabase}
