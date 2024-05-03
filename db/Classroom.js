const {mongoose} = require("./connectdb")

const ClassroomSchema = new mongoose.Schema(
    {
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
        }
    }
)

ClassroomSchema.statics.findClassroom = async (filters={})=>{
    let docs = await Classroom.find(filters).sort("building number");
    return docs;
}

ClassroomSchema.statics.addClassroom = async (classroom)=>{
    let newClassroom = Classroom(classroom);
    //if (await Classroom.find({building: newClassroom.building, number:newClassroom.building})) return;
    return await newClassroom.save();
}

ClassroomSchema.statics.deleteClassroom = async (filters={})=>{
    let docs = await Classroom.findOneAndDelete(filters);
    return docs;
}

let Classroom = mongoose.model('Classroom', ClassroomSchema)

module.exports = {Classroom}