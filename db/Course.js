const {mongoose} = require("./connectdb")

const CourseSchema = new mongoose.Schema(
    {
        professorName:{
            type: String,
            default: "Not Assigned"
        },
        classroomID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
            default: "Not Assigned"
        },
        classID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            default: "Not Assigned"
        },
        studentCount:{
            type: Number,
            required:true
        },
        days: [
            {
                type: String
            }
        ],
        time: [
            {
                type: String
            }
        ]
    }
)

CourseSchema.statics.addCourse = async (courseData)=>{
    let newCourse = Course(courseData);
    return await newCourse.save();
}

CourseSchema.statics.findCourses = async (filters={})=>{
    let docs = await Course.find(filters)
                            .populate('classroomID')
                            .populate('classID');
    // console.log(filters, docs);
    return docs;
}

CourseSchema.statics.findCourse = async (filters={})=>{
    let docs = await Course.findOne(filters);
    return docs==null?false:docs;
}

CourseSchema.statics.updateCourse = async (courseID, courseData)=>{
    let course = await Course.findOneAndUpdate({courseID},
                                {$set: courseData},
                                {new:true}
                            )
    return course;
}

CourseSchema.statics.addOneUser = async (courseID)=>{
    
}

CourseSchema.statics.removeOneUser = async (courseID)=>{
    
}

let Course = mongoose.model('Course', CourseSchema)

// Course.addCourse({
//     professorID: "846552",
//     classroomID: "231568",
//     classID: "2548732",
//     studentCount: 21,
//     days: ["Monday", "Thursday"],
//     time: ["11:00-13:00", "9:00-11:00"]
// })


module.exports = {Course}