const router = require("express").Router()
const {Course} = require('../db/Course')
const {Class} = require("../db/Class")
const auth = require('../middlewares/auth')
const {mongoose} = require("../db/connectdb")

router.get('/',  async (req, res)=>{
    let filters = {}
    let {professorName, classID, classroomID, _id} = req.query;
    if (_id) filters._id = _id;
    if (professorName) filters.professorName = professorName;
    if (classID) filters.classID = classID;
    if (classroomID) filters.classroomID = classroomID;
    let filteredCourses = await Course.findCourses(filters);
    //console.log(filters)
    res.send(filteredCourses);
})

router.post('/', async (req, res)=>{
    return await Course.addCourse(req.body);
})

// router.post('/', async (req, res)=>{
//     let {professorID, classroomID, classID, days, time} = req.body;
//     //console.log(professorID, classroomID, classID, days, time)
//     if( professorID && professorID.trim() && classroomID && classroomID.trim() && classID && classID.trim() && days && time && days.length == time.length){
        
//         let dayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Async"];
//         let timeList = ["7:00-9:00", "9:00-11:00", "11:00-13:00", "13:00-15:00", "16:00-18:00", "18:00-20:00", "20:00-22:00", "Async"];
//         if (!days.forEach((day) => {
//             console.log(day);
//             if (!dayList.find((d)=> day == d)) {
//                 res.status(400).send({error: "Incorrect Day"});
//                 console.log(d);
//                 return false;
//             }
//             else return true;
//         })) return;
//         if (!time.forEach((times) => {
//             if (!timeList.find((t)=> times == t)) {
//                 res.status(400).send({error: "Incorrect Time"});
//                 return false;
//             }
//         })) return;

//         let course = await Course.findCourses({classroomID, days, time});
//         if (course) {
//             res.status(400).send({error: 'Cannot add course in that date'});
//             return;
//         }
        
//         let newCourse = await Course.addCourse({professorID, classroomID, classID, days, time});
//         res.status(201).send(newCourse);
//         return;
//     }
//     else res.status(400).send({error: "Missing Data"});
// })

// router.put('/', auth.requiredAdmin, async (req, res)=>{

// })

module.exports = router;