const router = require("express").Router()
const {User} = require('../db/User')
const {Course} = require('../db/Course')
const {Schedule} = require('../db/Schedule')
const auth = require('../middlewares/auth')

router.post('/', auth.validateCookie, async (req, res) =>{
    let {name} = req.body;
    if (name) {
        req.name = name;
        if (Schedule.findSchedule(req)!=null) {
            res.status(400).send({error:"Schedule already exists"});
        }
        else {
            res.status(201).send("Schedule created");
            await Schedule.createSchedule(req);
        }
    }
    else res.status(400).send({error:"Invalid Schedule Name"})
})



module.exports = router;