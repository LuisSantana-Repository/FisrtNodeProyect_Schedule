const router = require("express").Router()
const {User} = require('../db/User')
const {Class} = require('../db/Class')
const {Schedule} = require('../db/Schedule')
const auth = require('../middlewares/auth')
const {nanoid} = require('nanoid')
const fs = require('fs')
const { password } = require("../db/config")
const bcrypt = require("bcryptjs")

// console.log(users);
router.get('/', auth.validateCookie, auth.requiredAdmin, async (req,res)=>{
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



router.get('/classes',auth.validateCookie, async (req, res)=>{
    //console.log(req.params.id);
    let email = req.email
    let {name} = req.query
    let user = await User.findUser(email)
    let user2 = await User.findOne({email})
    let notIn = await Class.findCLasesNotInUser(user2)
    let UserID = req.email;
    let schedules = await Schedule.find({UserID}).populate({path: "Courses", 
                                                    populate: [
                                                        {
                                                            path: "classID",
                                                            model: "Class"
                                                        }
                                                    ]});
    //console.log(schedules)
    let clasesInscribed = []
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    let Available = user.Available;
    if(schedules){
        //console.log(schedules.length)
        for (let index = 0; index < schedules.length; index++) {
            //console.log(schedules[index])
            let temp = schedules[index]
            if(temp.Courses){
                for (let i = 0; i < temp.Courses.length; i++) {
                    clasesInscribed.push(schedules[index].Courses[i].classID)
                }
            }
        }
        //console.log("Before Filter:", clasesInscribed)
        clasesInscribed = clasesInscribed.filter((item, index) => clasesInscribed.indexOf(item) == index);
        //console.log("After Filter:", clasesInscribed)
        //console.log(Available)

        Available =Available.filter(u => {
            // Check if any element in clasesInscribed has the same _id as u
            return !clasesInscribed.some(o => {
                //console.log(u._id, o._id, o._id.equals(u._id));
                return o._id.equals(u._id);
            });
        });
        let Completed = user.Completed
        if(name){
            Completed = Completed.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
            Available = Available.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
            notIn = notIn.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
            clasesInscribed = clasesInscribed.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
        }
        res.send({"Completed":Completed,Available,notIn,clasesInscribed})
        return
        //console.log(clasesInscribed);
    }
    

    //console.log(schedules)
    //console.log(user)
    
    res.send({"Completed":user.Completed,Available,notIn,clasesInscribed})
})

router.get('/getme',auth.validateCookie, async (req, res)=>{
    console.log(req.params.id);
    let email = req.email
    let proj = {name:1, email:1, userType:1, _id:0} ;
    let user = await User.findOne({email},proj)
    console.log(user)
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    res.send(user)
})


router.post('/',auth.validateCookie,auth.requiredAdmin,async (req,res)=>{
    console.log(req.body);
    let {name, email, password,userType,Curiculum } = req.body;
    if( name && name.trim() && email && email.trim() && Number.isInteger(userType) && userType>=0 && userType<3){
        
        // let user = users.find(u => u.email == email)
        let user = await User.findUser(email)
        if(user){
            res.status(400).send({error: 'User exists'})
            return 
        }
        let userObj;
        
        if(userType==0){
            let Available = await Class.filterClassesToHaveAllRequirements([],Curiculum)
            Available = Available.map(obj => obj._id)
            console.log(Available)
            userObj = {name, email, uid: nanoid(6), password, userType, Available}
        }
        else{
            userObj = {name, email, uid: nanoid(6), password, userType}
        }
        if(userType==1 || userType==0){
            if(Curiculum && (Curiculum=="ISC" || Curiculum=="IDC")){
                userObj.Curiculum = Curiculum; 
                console.log(userObj)
            }else{
                res.status(400).send({error:"DOES NOT HAVE A CURRICULUM"})
                return
            }
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



//update in schedule cart, for the user that has inscribed thsi class and he says its completed in this fucntion
router.put('/completedPassingClass',auth.validateCookie,async (req,res)=>{
    let user = await User.findUser(req.email)
    let {ClassID} = req.body;
    if(ClassID){
        let newclass = await Class.findClass(ClassID)
        if(newclass){
            let id = newclass._id
            console.log(id)
            console.log(user)
            console.log(user.Completed.includes(id))
            if(user.Completed.includes(id)){
                res.status(404).send({error: 'Already Completed'})
                return
            }else{
                user.Completed.push(id)
                user.Passing = user.Passing.filter(item => item !== id);
            }
        }else{
            res.status(404).send({error: 'Class dosent exist'})
            return
        }
        
    }else{
        res.status(404).send({error:"NO information prvided"})
        return
    }
    
    let updatedUser = await User.updateUser(user.email, user);
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )
    res.send(updatedUser)
})



//for when the schedule is made and the persone doing it decides to impelemnt passing in user
router.put('/addPassingClass',auth.validateCookie,async (req,res) =>{
    let user = await User.findUser(req.email)
    let {ClassID} = req.body;
    if(ClassID){
        let newclass = await Class.findClass(ClassID)
        if(newclass){
            let id = newclass._id
            console.log(id)
            console.log(user)
            console.log(user.Passing.includes(id))
            if(user.Passing.includes(id)){
                res.status(404).send({error: 'Already Passing'})
                return
            }else{
                user.Passing.push(id)
                user.Available = user.Available.filter(item => item !== id);
            }
        }else{
            res.status(404).send({error: 'Class dosent exist'})
            return
        }
        
    }else{
        res.status(404).send({error:"NO information prvided"})
        return
    }
    
    let updatedUser = await User.updateUser(user.email, user);
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )
    res.send(updatedUser)

})


//add form avaliable array to completed array
router.put('/addAvailableClass',auth.validateCookie,async (req,res)=>{
    let email = req.email
    let user = await User.findOne({email})
    let {ClassID} = req.body;
    if(ClassID){
        let newclass = await Class.findClass(ClassID)
        if(newclass){
            let id = newclass._id
            //console.log(id)
            //console.log(user)
            //console.log(user.Completed.includes(id))
            

            //abandonCourse
            if(user.Completed.includes(id)){
                res.status(404).send({error: 'Already inscribed'})
                return
            }else{
                if((user.Available.includes(id))){
                    //console.log( user.Available.includes(id))
                    let schedules = await Schedule.find({"UserID":email}).populate({path: "Courses", 
                                            populate: [
                                                {
                                                    path: "classID",
                                                    model: "Class"
                                                }
                                            ]});      
                    if(schedules){
                            for (let i = 0; i < schedules.length; i++) {
                                if(schedules[i].Courses){
                                    // schedules[i].Courses.some( u => {
                                    //     console.log(u.classID._id,id,u.classID._id.equals(id))
                                    //     return u.classID._id.equals(id)
                                    // })
                                    let ScheduleID
                                    if(schedules[i].Courses.some( u => {
                                        ScheduleID= u.id
                                        return u.classID._id.equals(id)

                                    })) {
                                        console.log(schedules[i])
                                        req.name=schedules[i].name;
                                        console.log(await Schedule.abandonCourse(req,ScheduleID))
                                    }
                                }
                        }
                    }
                    
                    user.Completed.push(id)
                    user.Available = await Class.filterClassesToHaveAllRequirements(user.Completed,user.Curiculum)
                    
                }else{
                    //console.log(user)
                    res.status(404).send({error: 'You shoudnt be able to complete this class'})
                    return
                }
                
            }
        }else{
            res.status(404).send({error: 'Class dosent exist'})
            return
        }
        
    }
    delete user.password;
    //console.log(user)
    let updatedUser = await User.updateUser(user.email, user);
    res.send(updatedUser)
}
)
//updating an existent object
router.put('/:email',auth.validateCookie,auth.requiredAdmin, async (req,res)=>{
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
            let hash = bcrypt.hashSync(password, 10)
            password = hash; 
            console.log(hash)
            user.password = password
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
                user.Available = await Class.filterClassesToHaveAllRequirements(user.Completed,user.Curiculum)
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

router.put('/Password/test',auth.validateCookie,async(req,res)=>{
    let {old,password} = req.body;
    let user = await User.authUser(req.email, old)
    console.log("SEARCHING FOR A USSEERRRRR")
    if(!user){
        res.status(401).send({error: "Password not correct"})
        return
    }
    if(password){
        let hash = bcrypt.hashSync(password, 10)
        password = hash; 
        console.log(hash)
        user.password = password
        let updatedUser = await User.updateUser(req.email, user);
        res.send(updatedUser)
        return
    }

    res.status(404).send({error: 'Password not recived'})
    return
})

router.delete('/:email', auth.validateCookie, auth.requiredAdmin, async (req, res)=>{
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