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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courses',
            default: []
        }]
    }
) 

scheduleSchema.statics.findSchedule = async (req) =>{
    let doc = await Schedule.findOne({"UserID":req.email});
    console.log(doc);
    return doc;
}

scheduleSchema.statics.createSchedule = async (req) =>{
    let newSchedule = Schedule({"UserID":req.email, "name":req.name});
    return await newSchedule.save();
}




let Schedule = mongoose.model('Schedule', scheduleSchema)
module.exports = {Schedule}