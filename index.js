const path = require('path')
const express = require('express')
const app = express() //connect db after app.use initialization
const morgan = require('morgan')
const {connectToDatabase} = require('./config/mongoose')
const secretKey = process.env.SESSION_SECRET_KEY

/*----connecting to database----*/
connectToDatabase()

/*----no cache---*/
const nocache = require("nocache");
app.use(nocache());

//requiring admin and user routes
const adminRoutes = require("./routes/admin_routes")
const userRoutes = require('./routes/user_routes')
const session = require('express-session')

//express parsers
app.use(express.json())
app.use(express.urlencoded({extended : true}))

//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: secretKey, 
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

//static
app.use(express.static(path.join(__dirname , 'public')))

//view engine
app.set('view engine' , 'ejs')

//admin route
app.use('/admin' , adminRoutes)

//user route
app.use('/' , userRoutes)

//error handler for undefined routes
app.use((req , res , next) =>{
    res.render('error')
})

// error handler for dynamic errors
app.set('views' , './views')
app.use((err, req, res, next) => {
    console.error(err.stack);
    // res.status(500).send(err.stack);
    res.render('error')
  });

// app.use(morgan('dev'))
app.listen(3000 , () =>{
    console.log('server has started at port 3000');
})
