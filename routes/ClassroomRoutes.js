const router = require("express").Router()
const auth = require('../middlewares/auth')
const {Classroom} = require('../db/Classroom')

router.post('/', async (req, res) =>{
    // for (let x = 100; x<=300; x+=100){
    //     for (let i = x; i<(x+20); i++){
    //         await Classroom.addClassroom({maxStudents:24, building: "D", number: i})
    // }}
    // res.send("ADDED")
})

router.get('/', async (req, res) =>{
    let building = req.query;
    if (building){
        let response = await Classroom.findClassroom(building)
        res.send(response);
        return;
    }
    let response = await Classroom.findClassroom()
    res.send(response)
})

router.delete('/', async (req, res) =>{
    // for (let x = 100; x<=300; x+=100){
    //     for (let i = x; i<(x+20); i++){
    //         await Classroom.deleteClassroom({building: "A", number: i})
    // }}
    // res.send("DELETED")
})

// router.delete('/:id', auth.validateCookie, auth.requireAdmin ,async (req, res) =>{
//     await Classroom.deleteClassroom({_id: req.params.id});
// })

module.exports = router;