const {mongoose} = require("./connectdb")

const CourseSchema = new mongoose.Schema(
    {
        professorID:{
            type: String,
            required:true
        },
        classroomID:{
            type: String,
            required:true
        },
        classID:{
            type: String,
            required:true
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
    let newCourse = User(courseData);
    return await newCourse.save();
}

let Course = mongoose.model('Course', CourseSchema)

Course.addCourse({
    professorID: "846552",
    classroomID: "231568",
    classID: "2548732",
    studentCount: 21,
    days: ["Monday", "Thursday"],
    time: ["11:00-13:00", "9:00-11:00"]
})

module.exports = {Course}