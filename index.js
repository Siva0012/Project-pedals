
const path = require('path')
const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('./config/mongoose')

// app.use(morgan('dev'))

/*----no cache---*/
const nocache = require("nocache");
app.use(nocache());

//requiring admin and user routes
const adminRoutes = require("./routes/admin_routes")
const userRoutes = require('./routes/user_routes')


const session = require('express-session')

//using express parsers
app.use(express.json())
app.use(express.urlencoded({extended : true}))


const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
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

// error handler
// app.set('view engine' , 'ejs')
app.set('views' , './views')

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err.stack);
    // res.render('error')
  });



app.listen(3000 , () =>{
    console.log('server started');
})
