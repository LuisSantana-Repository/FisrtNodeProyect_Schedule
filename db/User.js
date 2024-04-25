
const {mongoose} = require("./connectdb")
const bcrypt = require("bcryptjs")
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        userType: {
            //0: Student
            //1: Profesor
            //2: admin
            type: Number,
            required: true
        },

        Completed: [{
            //classes completed
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            default: []
        }],
        Passing: [
            //Clases he is passing
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class',
                default: []
            }
        ],
        Available: [{
            //Clases he can take
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            default: []
        }]
    }
)
// userSchema.statics.removeImage = async(email,imageId)=>{
//     const user = await User.findOneAndUpdate({email},{$pull:{images: imageId}}, {new:true}) 
    
//     return user;
// }

// userSchema.statics.addImageV2 = async (email, imageId)=>{
//     const user = await User.findOneAndUpdate({email},{$push:{images: imageId}}, {new:true}) 
//     return user;
// }

UserSchema.statics.findUsers = async (filter={}, 
     isAdmin = false,)=>{
    let proj = isAdmin? {}: {name:1, email:1, _id:0} ;

    let docs =  User.find(filter,proj).sort({name:1})
                     //.populate('images', 'name url -_id')
    let count = User.find(filter).count()

    // we removed the await in previous lines to execute both queries and wait for both 
    // it is not the same than wait the first to finish to execute the second. 
    let resp = await Promise.all([docs, count])
    let users = resp[0];
    let total =  resp[1];    
    console.log(resp[0], resp[1]);
    return {users, total}
}

UserSchema.statics.saveUser = async (userData)=>{
    let hash = bcrypt.hashSync(userData.password, 10)
    userData.password = hash;
    let newUser = User(userData);
    return await newUser.save()
}

UserSchema.statics.findUser  = async(email)=>{
    let user = await User.findOne({email})
        .populate('Completed')
        .populate('Passing')
        .populate('Available');

    //console.log(user)
    return user;
}


UserSchema.statics.updateUser= async (email, UserData)=>{
    delete UserData.email
    if (UserData.password){
        let hash = bcrypt.hashSync(UserData.password, 10)
        UserData.password = hash; 
    }
    let updatedUser = await User.findOneAndUpdate({email},
                                {$set: UserData},
                                {new:true}
                            )
    return updatedUser;
}
UserSchema.statics.deleteUser = async(email)=>{
    let deleted = await User.findOneAndDelete({email})
    // console.log(deleted);
    return deleted;
}

UserSchema.statics.authUser = async(email, password)=>{
    let user = await User.findOne({email})

    if(!user)
        return null

    if (bcrypt.compareSync(password, user.password)){
        return user
    }

    return null
}
let User = mongoose.model('User', UserSchema)
module.exports = {User}