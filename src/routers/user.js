const express= require('express')
// used for file uploads (npm)
const multer =require('multer')
//npm used to covert all file types to png
const sharp = require('sharp')
//used to connect user.js (exports)
const User =require('../models/user')
const auth=require('../middleware/auth')

const { sendwelcomeemail, sendcancelationemail }= require('../emails/account')
const router = new express.Router()
// post(to create data) vs get(to read data)

router.post('/users',async (req,res)=>{
    //constructor
    const user= new User(req.body)
    
   
    //using async await method

    try{
        await user.save()
        sendwelcomeemail(user.email,user.name)
        const token=await user.generateauthtoken()
        res.status(201).json({user,token})
    } catch (e){
        res.status(400).json(e)

    }

    
})

router.post('/users/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateauthtoken()
        res.json({user,token})

    }catch(e){
        res.status(400).json()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()

        res.json()

    }catch(e){
        res.status(500).json()

    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens= []
        await req.user.save()
        res.json()

    }catch(e){
        res.status(500).json()
    }
})

//reading users details
//auth is the middleware here
router.get('/users/me', auth ,async (req,res)=>{
// then and catch are also know as promises
    res.json(req.user)
})


//update user
router.patch('/users/me',auth,async(req,res)=>{
    const updates= Object.keys(req.body)
    const allowedupdates = ['name','password']
    const isvalidoperation =updates.every((update)=>{
        return allowedupdates.includes(update)
    })

    if(!isvalidoperation){
        return res.status(400).json({error: 'Invalid Operations'})
    }

    try{
        updates.forEach((update)=>{
            req.user[update]= req.body[update]
            
        })
        await req.user.save()
        res.json(req.user)

    }catch(e){
        res.status(400).json(e)

    }
})

//delete user 
router.delete('/users/me',auth ,async(req,res)=>{
    try{
         await req.user.remove()
         sendcancelationemail(req.user.email , req.user.name)
         res.json(req.user)

    }catch(e){
        res.status(500).json()

    }

})

const upload=multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload the image'))

        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'),async(req,res)=>{
    //user sharp
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    res.status(200).send("successfull")
},(error,req,res,next)=>{
    res.status(400).json({error:error.message})
})

router.delete('/users/me/avatar',auth, async(req,res)=>{
    req.user.avatar= undefined
    await req.user.save()
    res.status(200).json()
})


//get avatar or profile pic on chrome
//http://localhost:3000/users/5f89a12bc631f50b441013c6(id of user)/avatar
// <img src="http://localhost:3000/users/5f89a12bc631f50b441013c6/avatar"> use in html
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user= await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
        
    }catch(e){
        res.status(404).json()
    }
})

module.exports =router 