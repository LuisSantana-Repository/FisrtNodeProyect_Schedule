const router = require("express").Router()
const {User} = require('../db/User')
const {Class} = require('../db/Class')
const auth = require('../middlewares/auth')
const {nanoid} = require('nanoid')
const fs = require('fs')
const { password } = require("../db/config")

// console.log(users);
router.get('/', auth.validateHeader, auth.requiredAdmin, async (req,res)=>{
    console.log(req.query);
   
    let filters = {}
   
    // console.log(filteredUsers);
    let {name, userType} = req.query;
    console.log(name,userType);

    if(name){
        filters.name = new RegExp(name,'i') //  /name/i 
    }

    userType = parseInt(userType, 10);
    if(!isNaN(userType)){
        filters.userType = userType;
    }
    console.log(filters)
    let filteredUser = await User.findUsers(filters,req.admin)
    console.log(filteredUser)
    res.send(filteredUser)

    // if(!req.admin){
    //     filteredUsers = filteredUsers.map(u => ({name: u.name}))
    // }

    
})


//shoud be require token but not jet done correctly on html
router.get('/:email',auth.validateHeader, auth.requiredAdmin, async (req, res)=>{
    console.log(req.params.id);
    let user = await User.findUser(req.params.email)
    console.log(user)
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    res.send(user)
})



router.post('/',auth.validateHeader,auth.requiredAdmin,async (req,res)=>{
    console.log(req.body);
    let {name, email, password,userType } = req.body;
    if( name && name.trim() && email && email.trim() && Number.isInteger(userType) && userType>=0 && userType<3){
        
        // let user = users.find(u => u.email == email)
        let user = await User.findUser(email)
        if(user){
            res.status(400).send({error: 'User exists'})
            return 
        }
        let userObj;
        if(userType==0){
            let Available = await Class.filterClassesToHaveAllRequirements()
            Available = Available.map(obj => obj._id)
            console.log(Available)
            userObj = {name, email, uid: nanoid(6), password, userType, Available}
        }
        else{
            userObj = {name, email, uid: nanoid(6), password, userType}
        }
        let newUser = await User.saveUser(userObj)
        //users.push(userObj)
        //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )

        res.status(201).send(newUser)
        return
    }
    console.log(userType)
    let error = ''
    if(name == undefined || !name.trim())
        error += 'name is invalid;'
    if(email == undefined || !email.trim())
        error += 'email is invalid'
    if(userType== undefined ){
        error+='UserType Invalid'
    }

    res.status(400).send({error})

})


//updating an existent object
router.put('/:email',auth.validateHeader, async (req,res)=>{
    //search for the id
    // let user = users.find( u => u.id == req.params.id)
    let user  = await User.findUser(req.params.email)

    //if not found 
    if (!user){
        // return 404 not found 
        res.status(404).send({error: 'User not found'})
        return
    }
       
    //if found
        // update data z
    let {name, password,ClassID} = req.body;
    if(name){
        user.name = name;
    }
    //user.email = req.params.email;
    if(password){
        if(!password){
            delete user.password
        }else{
            user.password = password
        }
    }
    if(ClassID){
        let newclass = await Class.findClass(ClassID)
        if(newclass){
            let id = newclass._id
            console.log(id)
            console.log(user)
            console.log(user.Completed.includes(id))
            if(user.Completed.includes(id)){
                res.status(404).send({error: 'Already inscribed'})
                return
            }else{
                user.Completed.push(id)
                user.Available = await Class.filterClassesToHaveAllRequirements(user.Completed)
            }
        }else{
            res.status(404).send({error: 'Class dosent exist'})
            return
        }
        
    }
    
    let updatedUser = await User.updateUser(user.email, user);
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )
    res.send(updatedUser)
})

router.delete('/:email', auth.validateHeader, auth.requiredAdmin, async (req, res)=>{
    // search for the id
    // let pos= users.findIndex(u => u.id == req.params.id)
    
    let user = await User.findUser(req.params.email)

    // if not found return 404
    if(!user){
        res.status(404).send({error: 'User not found'})
        return
    }

    let deletedUser = await User.deleteUser(req.params.email)
    //let deletedUser = users.splice(pos,1)
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )
    res.send({deletedUser})
})

module.exports = router;