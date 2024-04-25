const {mongoose} = require("./connectdb")

const ClassSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required:true
        },
        subject:{
            type: String,
            required:true
        },
        credits:{
            type: Number,
            required:true
        },
        requirements:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class',
                default: []
            }
        ]
    }
)

ClassSchema.statics.saveClass = async (userData)=>{
    let newClass = Class(userData);
    return await newClass.save()
}

ClassSchema.statics.findClass  = async(_id)=>{
    let student = await Class.findOne({_id})
    return student;
}
ClassSchema.statics.findClassesWhithRequirements= async(cursadas = []) =>{
    //console.log("Cursadas:",cursadas)
    let query = {};
    if(cursadas.length==0){
       //console.log("asdasDA")
        query.requirements = { $size: 0 };
    }else{
        query._id ={ $nin: cursadas }  // Excluir las clases ya cursadas usando sus IDs

        query.$or = [
            { requirements: { $in: cursadas } },  // Clases donde los requisitos incluyen al menos uno cursado
            { requirements: { $size: 0 } }  // Clases donde no hay requisitos
        ];
        //console.log(doc)
        
    }

    let doc = await Class.find(query);
    //console.log(doc)
    return doc;
}
ClassSchema.statics.filterClassesToHaveAllRequirements= async (cursadas)=>{
    //console.log(cursadas);
    if(!cursadas){
        let doc = Class.findClassesWhithRequirements();
        return await Class.findClassesWhithRequirements();
    }else{
        let doc = await Class.findClassesWhithRequirements(cursadas);
        let set = new Set(cursadas)
        //console.log(doc)
        doc.filter(clase =>{
            if(clase.requirements.length ==0){
                return clase
            }
            let requisitosCumplidos = clase.requirements.every(id => set.has(id));
            if (requisitosCumplidos ) {
                return clase;
            }
        }
        )

        return doc
    }
}

let Class = mongoose.model('Class', ClassSchema)


// Class.saveClass(
//     {
//         name: "Programacion Orientada a objetos",
//         subject: "ISC",
//         credits: 8,
//         requirements : ['6626eaec231f0c9486f06dd4']
//     }
// );
// async function findUsers(){
//     let docs = await Class.filterClassesToHaveAllRequirements(['6626eaec231f0c9486f06dd4'])
//     console.log(docs);
// }
// findUsers()


module.exports = {Class}