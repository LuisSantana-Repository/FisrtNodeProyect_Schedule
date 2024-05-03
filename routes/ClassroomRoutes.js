const router = require("express").Router()
const {Classroom} = require('../db/Classroom')

router.post('/', async (req, res) =>{
    for (let x = 100; x<=300; x+=100){
        for (let i = x; i<(x+20); i++){
            //await Classroom.addClassroom({maxStudents:24, building: "D", number: i})
    }}
    res.send("ADDED")
})

router.get('/', async (req, res) =>{
    let response = await Classroom.findClassroom()
    res.send(response)
})

router.delete('/', async (req, res) =>{
    for (let x = 100; x<=300; x+=100){
        for (let i = x; i<(x+20); i++){
            //await Classroom.deleteClassroom({building: "A", number: i})
    }}
    res.send("DELETED")
})

module.exports = router;