const router = require("express").Router()
const {User} = require('../db/User')
const {Course} = require('../db/Course')
const {Schedule} = require('../db/Schedule')
const auth = require('../middlewares/auth')

router.post('/', async (req, res) =>{
    console.log("hola")
    let {name} = req.body;
    console.log(name);
})



module.exports = router;