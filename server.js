const express = require('express');
const UsertRoutes = require('./routes/UserRoutes')
const authRoute = require('./routes/authRoutes')
const ClassRoutes = require('./db/Class')
const path = require('path')
const app = express();
const port = process.env.PORT || 3001;
const auth = require('./middlewares/auth')


function logger(req, res, next){
    console.log("log ",req.url);
    next()
}

console.log(__dirname);

app.use(express.static(path.join(__dirname, 'public')))

//we can read the body through req.body
app.use(express.json())

app.get('/', (req,res)=>{
    res.send("hello")
})

//app.use('/api/User', logger,auth.validateToken,  UsertRoutes )
app.use('/api/User',  UsertRoutes )
app.use('/api/login', logger, authRoute )

//app.use('/api/users', logger,  userRoutes )
//app.use('/api/images', logger,  imageRoutes )
app.listen(port, ()=>console.log("running in port "+port) )