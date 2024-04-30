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

async function findColition(course, userSchedule){
    let available = true;
    // for (let i = 0; i<course.days.length; i++){
    //     if (!available) break; 
    //     userSchedule.Courses.forEach( async (c)=> {
    //         if (!available) return; 
    //         let currentCourse = await Course.findCourse({courseID: c}); 
    //         for (let j = 0; j<currentCourse.days.length; j++){ 
    //             if (course.days[i]==currentCourse.days[j]) {
    //                 if (course.time[i]==currentCourse.time[j]) {
    //                     console.log("Collision 0n:", course.days[i], course.time[i]);
    //                     available = false;
    //                     break;
    //                 }
    //             } 
    //         }
    //     })
    // }
    for (let i = 0; i < course.days.length; i++) {
        if (!available) break; 
        for (let c of userSchedule.Courses) {
            if (!available) break;  
            let currentCourse = await Course.findCourse({ courseID: c });
            for (let j = 0; j < currentCourse.days.length; j++) {
                if (course.days[i] == currentCourse.days[j] && course.time[i] == currentCourse.time[j]) {
                    console.log("Collision on:", course.days[i], course.time[i]);
                    available = false;
                    break;
                }
            }
        }
    }
    //console.log(available);
    return available;
}

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
            let course = await Course.findCourse({courseID});
            if (course){
                let max = 24; // TODO: find course.classroomID capacity
                if (course.studentCount<max){
                    let user = await User.findUser(req.email);
                    if (user.Completed.find((c)=> c==course.classID)) res.status(400).send({error:"You have already coursed that class"});
                    else if (user.Passing.find((c)=> c==course.classID)) res.status(400).send({error:"You are already coursing that class"});
                    else {
                        let available = await findColition(course, userSchedule);
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
    let {name, classID} = req.query;
    if (name && classID){
        req.name = name;
        let userSchedule = await Schedule.findSchedule(req);
        let foundCourses = await Course.findCourses({classID});
        let availableCourses = [];
        for (let course of  foundCourses){
            course.available = await findColition(course, userSchedule);
            if (course.available) availableCourses.push(course.courseID);
        }
        res.status(200).send(availableCourses);
        return;
    }
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