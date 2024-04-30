const router = require("express").Router()
const {User} = require('../db/User')
const {Course} = require('../db/Course')
const {Schedule} = require('../db/Schedule')
const auth = require('../middlewares/auth')

router.post('/', auth.validateCookie, async (req, res) =>{
    let {name} = req.body;
    if (name) {
        req.name = name;
        if (await Schedule.findSchedule(req)==null) {
            await Schedule.createSchedule(req);
            res.status(201).send("Schedule created");
        }
        else res.status(400).send({error:"Schedule already exists"});
    }
    else res.status(400).send({error:"Invalid Schedule Name"})
})

router.put('/', auth.validateCookie, async (req, res) =>{
    let {name, courseID} = req.body;
    if (name && courseID) {
        req.name = name;
        let userSchedule = await Schedule.findSchedule(req);
        if (userSchedule) {
            if (userSchedule.Courses.find((c)=>c==courseID)){
                res.status(400).send({error:"Course is already on the schedule"});
                return;
            }
            let course = await Course.findCourses({courseID});
            if (course){
                let max = 24; // TODO: find course[0].classroomID capacity
                if (course[0].studentCount<max){
                    let user = await User.findUser(req.email);
                    if (user.Completed.find((c)=> c==course.classID)) res.status(400).send({error:"You have already coursed that class"});
                    else if (user.Passing.find((c)=> c==course.classID)) res.status(400).send({error:"You are already coursing that class"});
                    else {
                        let available = true;
                        // TODO: Buscar si ya esta la(s) hora/dia ocupada de course[0]
                        if (available) {
                            let resp = await Schedule.pushCourse(req, courseID);
                            res.status(200).send(resp);
                            //Course.addOneStudent(courseID); // TODO: Completar metodo en Course.js
                        }
                        else res.status(400).send({error:"Course does not fit your schedule"});
                    }
                }
                else res.status(400).send({error:"Course is full"});
            }
            else res.status(400).send({error:"Course not found"});
        } 
        else res.status(400).send({error:"Schedule not found"});
    }
    else res.status(400).send({error:"Missing Information"});
})

router.get('/', auth.validateCookie, async (req, res) =>{
    let docs = await Schedule.findSchedules(req);
    if (!docs) {
        res.status(404).send({error:"Information not found"});
        return;
    }
    let {name} = req.query;
    if (name) {
        docs = docs.filter((s) => s.name==name);
    }
    else docs = docs.map((s) => {return s.name});
    res.status(200).send(docs);
})

router.delete('/', auth.validateCookie, async (req, res) =>{
    let {name, courseID} = req.body;
    if (name) {
        req.name = name;
        let userSchedule = await Schedule.findSchedule(req);
        if (userSchedule){
            if (courseID){
                Schedule.abandonCourse(req, courseID);
                //Course.removeOneStudent(courseID); // TODO: Completar metodo en Course.js
                res.status(200).send("Course Abandoned");
            }
            else {
                userSchedule.Courses.forEach((c)=>{
                    //Course.removeOneStudent(c); // TODO: Completar metodo en Course.js
                })
                Schedule.deleteSchedule(req);
                res.status(200).send("Schedule Deleted");
            }
        }
        else res.status(400).send({error:"Schedule not found"});
    }
    else res.status(400).send({error:"Missing Information"});
})

module.exports = router;