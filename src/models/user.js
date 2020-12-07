const mongoose= require('mongoose')
const validator= require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task= require('./task')

const userschema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim :true

    },
    email: {
        type :String,
        unique:true,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new error('email is not valid')
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new error('password cannot contains "password"')
            }
        }


    },
    tokens: [{
        token: { 
            type: String,
            required: true
        }

    }],
    avatar: {
        type: Buffer
    }

},{
    timestamps:true
})

//relation between task and user so that we can find the task of each individual user
userschema.virtual('tasks',{
    ref: 'Task',
    localField :'_id',
    foreignField:'owner'
})


// to hide password and tokens from public
userschema.methods.toJSON = function(){
    const user=this
    const userobject =user.toObject()

    delete userobject.password
    delete userobject.tokens
    delete userobject.avatar

    return userobject
}

userschema.methods.generateauthtoken = async function(){
    const user=this
    const token =jwt.sign({_id: user._id.toString() },process.env.JWT_SECRET)
    user.tokens =user.tokens.concat({ token })
    await user.save()
    return token

}

userschema.statics.findByCredentials = async(email,password)=>{
    const user=await User.findOne({email})

    if(!user){
        throw new error('unable to login')

    }

    const ismatch =await bcrypt.compare(password,user.password)

    if(!ismatch){
        throw new error('unable to login')
    }

    return user
}

// hash the plain text password before saving

userschema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()

})

// delete user task when user is removed
userschema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({ owner: user._id })

    next()
})

//creating a model
const User= mongoose.model('User',userschema)

// used to interlink user.js and index.js
module.exports= User