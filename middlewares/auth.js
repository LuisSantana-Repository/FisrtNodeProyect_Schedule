const {User} = require('../db/User')
const jwt = require('jsonwebtoken')


function validateHeader(req,res, next){
    let header = req.get('x-auth')
    if(!header){
        res.status(403).send({error:"No auth data"})
        return
    }

    req.token = header;

    next()
}

function validateAdmin(req, res,next){
    let pass= '23423'
    req.admin = false
    if(req.token == pass){
        req.admin = true
    }

    next()
}

function requiredAdmin(req,res, next){
    let pass= '23423'
    req.admin = false
    if(req.token == pass){
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



module.exports = {validateToken, validateHeader, validateAdmin, requiredAdmin}

