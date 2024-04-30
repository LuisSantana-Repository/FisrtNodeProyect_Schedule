const {mongoose} = require("./connectdb")

const scheduleSchema = new mongoose.Schema(
    {
        UserID: {
            type: String,
            required: true
        },
        name:{
            type: String,
            required: true
        },
        Courses: [{
            type: String,
            default: []
        }]
    }
) 

scheduleSchema.statics.findSchedule = async (req) =>{
    //console.log({"UserID":req.email, "name":req.name})
    let doc = await Schedule.findOne({"UserID":req.email, "name":req.name});
    //console.log(doc);
    return doc;
}

scheduleSchema.statics.findSchedules = async (req) =>{
    //console.log({"UserID":req.email})
    let doc = await Schedule.find({"UserID":req.email});
    //console.log(doc);
    return doc;
}

scheduleSchema.statics.createSchedule = async (req) =>{
    let newSchedule = Schedule({"UserID":req.email, "name":req.name});
    return await newSchedule.save();
}

scheduleSchema.statics.pushCourse = async (req, courseID) =>{
    let current = await Schedule.findOne({"UserID":req.email, "name":req.name});
    current.Courses.push(courseID);
    return await Schedule.findOneAndUpdate({"UserID":req.email, "name":req.name},
        {$set: current},
        {new:true}
    );
}

scheduleSchema.statics.abandonCourse = async (req, courseID) =>{
    let current = await Schedule.findOne({"UserID":req.email, "name":req.name});
    current.Courses = current.Courses.filter((c)=> c!=courseID);
    return await Schedule.findOneAndUpdate({"UserID":req.email, "name":req.name},
        {$set: current},
        {new:true}
    );
}

scheduleSchema.statics.deleteSchedule = async (req) =>{
    return await Schedule.findOneAndDelete({"UserID":req.email, "name":req.name});
}


let Schedule = mongoose.model('Schedule', scheduleSchema);


module.exports = {Schedule}