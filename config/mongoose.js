const mongoose = require('mongoose')


mongoose.connect('mongodb://127.0.0.1:27017/pedals' , 
{
    useNewUrlParser : true,
    useUnifiedTopology : true
}
).then(() =>{
    console.log('connected to server');
}).catch(err => console.log("Error connecting to server" + err))
