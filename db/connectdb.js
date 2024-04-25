const mongoose = require('mongoose');
const config = require('./config.js')
mongoose.connect(config.getUrl(), {
    useNewUrlParser: true
}).then(()=>console.log("conected to db"))
.catch(err=>console.log("not conected to db",err))

module.exports = {mongoose}