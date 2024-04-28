const router = require("express").Router()
const {User} = require('../db/User')
const {Class} = require('../db/Class')
const auth = require('../middlewares/auth')
const fs = require('fs')
const { error } = require("console")


router.get('/', auth.validateCookie, auth.requiredAdmin, async (req,res)=>{
    let {name,pageNumber} = req.query;
    let filters= {}
    if(name){
        filters.name = new RegExp(name,'i') //  /name/i 
    }
    let filteredClass = await Class.findClasses(filters,pageNumber)
    res.send(filteredClass)
})


router.get('/populate/:id',auth.validateCookie, auth.requiredAdmin, async (req,res)=>{
    let id = req.params.id
    if(id){
        let temclass = await Class.findClass(id)
        if(temclass){
            res.send(temclass)
        }else{
            res.status(400).send({error:"No Class exist"})
        }
    }else{
        res.status(400).send({error:"No id send"})
    }
})






module.exports = router;