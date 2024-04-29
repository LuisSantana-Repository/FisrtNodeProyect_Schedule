const {User} = require('../db/User')
const jwt = require('jsonwebtoken')


function validateHeader(req,res, next){
    next()
}

function validateAdmin(req, res,next){
    let email = req.email;
    let user = User.findOne({email})
    if(user.userType == 2){
        req.admin = true
    }

    next()
}

async function requiredAdmin(req,res, next){
    let email = req.email;
    let user = await User.findOne({email})
    console.log(user)
    if(user.userType == 2){
        req.admin = true
        next()
        return;
    }

    res.status(401).send({error: 'You are not admin'})

} 


function validateToken(req, res, next){
    let token = req.get('x-token')

    if(!token){
        res.status(401).send({error: "token is missing"})
        return;
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded)=>{
        if(err){
            res.status(401).send({error: err.message})
            return
        }

        req.email= decoded.email;
        req._id = decoded._id;
        next()
    })

}

function validateCookie(req,res,next){
    let token = req.cookies.access_token
    if(!token){
        res.status(401).send({error: "token is missing"})
        return;
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded)=>{
        if(err){
            res.status(401).send({error: err.message})
            return
        }

        req.email= decoded.email;
        req._id = decoded._id;
        next()
    })
}

async function requireProfessor(req, res, next){
    let email = req.email;
    let user = await User.findOne({email})
    console.log(user)
    if(user.userType == 1 && user.userType == 2){
        req.access = true
        next();
        return;
    }
    res.status(401).send({error: 'Access Unauthorized'})
} 

module.exports = {validateToken, validateHeader, validateAdmin, requiredAdmin, validateCookie, requireProfessor}

