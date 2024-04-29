const {mongoose} = require("./connectdb")

const ClassroomSchema = new mongoose.Schema(
    {
        classroomID:{
            type: String,
            required:true
        },
        maxStudents:{
            type: Number,
            required:true
        },
        building:{
            type: String,
            required:true
        },
        number:{
            type: Number,
            required:true
        },
    }
)

ClassroomSchema.statics.findClassroom = async (filters={})=>{
    let docs = await Classroom.find(filters).sort(ClassroomID);
    return docs;
}

let Classroom = mongoose.model('Classroom', ClassroomSchema)

module.exports = {Classroom}