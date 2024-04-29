const router = require("express").Router()
const {User} = require('../db/User')
const {Class} = require('../db/Class')
const {Course} = require('../db/Course')
const {Classroom} = require('../db/Classroom')
const auth = require('../middlewares/auth')

router.get('/', auth.validateCookie,  async (req, res)=>{
    let filters = {}
    let {professorID, classID, classroomID} = req.query;
    if (professorID) filters.professorID = professorID;
    if (classID) filters.classID = classID;
    if (classroomID) filters.classroomID = classroomID;
    let filteredCourses = await Course.findCourses(filters);
    res.send(filteredCourses);
})

router.post('/', auth.validateCookie, auth.requiredAdmin, async (req, res)=>{
    let {professorID, classroomID, classID, days, time} = req.body;
    if( professorID && professorID.trim() && classroomID && classroomID.trim() && classID && classID.trim() && days && time && days.length == time.length){
        
        let dayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Async"];
        let timeList = ["7:00-9:00", "9:00-11:00", "11:00-13:00", "13:00-15:00", "16:00-18:00", "18:00-20:00", "20:00-22:00", "Async"];
        if (!days.forEach((day) => {
            if (!dayList.find((d)=> day == d)) {
                res.status(400).send({error: "Incorrect Day"});
                return false;
            }
        })) return;
        if (!time.forEach((times) => {
            if (!timeList.find((t)=> times == t)) {
                res.status(400).send({error: "Incorrect Time"});
                return false;
            }
        })) return;

        let course = await Course.findCourses({classroomID, days, time});
        if (course) {
            res.status(400).send({error: 'Cannot add course in that date'});
            return;
        }
        let newCourse = await Course.addCourse({professorID, classroomID, classID, days, time});
        return newCourse;
    }
    else res.status(400).send({error: "Missing Data"})
})

router.put('/', auth.validateCookie, auth.requiredAdmin, async (req, res)=>{

})

module.exports = router;