const {mongoose} = require("./connectdbs")
const ScheduleSchema = new mongoose.Schema(
    {
        UserID: {
            type: String,
            required: true
        },
        Classes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classes',
            default: []
        }]
    }
)

userSchema.statics.getSchedule= async(UserID) => {
    let schedule = await Schedule.findOne({UserID})
                           //.populate('curse', 'Schedule', url');
    console.log(schedule);
    return schedule;
}

userSchema.statics.addClasses = async (UserID, ClassesID)=>{
    const schedule = await Schedule.findOne({UserID})
                                    //.populate()
    if(schedule){
        
    }else{

    }
    return {error: "user not found"}
}

userSchema.statics.createSchedule= async (UserID)=>{

}

userSchema.statics.removeClass = async(UserID,ClassesID)=>{

}


let Schedule = mongoose.model('Schedule', ScheduleSchema)
module.exports = {Schedule}