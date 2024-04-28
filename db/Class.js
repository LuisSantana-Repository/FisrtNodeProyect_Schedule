const {mongoose} = require("./connectdb")

const ClassSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required:true
        },
        Curiculum:[
            {
                type: String,
                ref:"curiculems",
                default: ["ISC","IDC"]
            }
        ],
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
    let student = await Class.findOne({_id}).populate('requirements')
    return student;
}

ClassSchema.statics.findClassesWhithRequirements= async(cursadas = [], curriculum) =>{
    //console.log("Cursadas:",cursadas)
    let query = {};
    if (curriculum) {
        query.Curiculum = { $in: [curriculum] };
    }

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
ClassSchema.statics.filterClassesToHaveAllRequirements= async (cursadas,Curiculum)=>{
    //console.log(cursadas);
    if(!cursadas){
        let doc = Class.findClassesWhithRequirements();
        return await Class.findClassesWhithRequirements();
    }else{
        let doc = await Class.findClassesWhithRequirements(cursadas,Curiculum);
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

ClassSchema.statics.findCLasesNotIn = async(user)=>{
    let doing =[]
    console.log(user)
    doing = doing.concat(user.Completed, user.Passing,user.Available);
    let query = {
        _id: { $nin: doing }  // Exclude classes based on the combined list
    };

    let doc = await Class.find(query);
    return doc;
}

ClassSchema.statics.findClasses = async (filter={}, pageNumber=1, pageSize=10)=>{

   let docs =  Class.find(filter)
                    .sort({name:1})
                    .skip((pageNumber-1)*pageSize)
                    .limit(pageSize)
   let count = Class.find(filter).count()

   // we removed the await in previous lines to execute both queries and wait for both 
   // it is not the same than wait the first to finish to execute the second. 
   let resp = await Promise.all([docs, count])
   let users = resp[0];
   let total =  resp[1];    
   console.log(resp[0], resp[1]);
   return {users, total}
}

let Class = mongoose.model('Class', ClassSchema)


// Class.saveClass(
//     {
//         name: "INTEGRACIÓN DE SERVICIOS DE APRENDIZAJE AUTOMÁTICO",
//         Curiculum: ["ISC"],
//         credits: 8,
//         requirements:['662c0fede29d7d8889429257'
//            ]
//     }
// );

// async function findUsers(){
//     let docs = await Class.filterClassesToHaveAllRequirements(['6626eaec231f0c9486f06dd4'])
//     console.log(docs);
// }
// findUsers()


module.exports = {Class}