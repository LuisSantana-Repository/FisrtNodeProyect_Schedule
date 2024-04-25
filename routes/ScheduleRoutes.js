const router = require("express").Router()
const auth = require('../middlewares/auth')
const {Schedule} = require ('../db/Schedule')
const {nanoid} = require('nanoid')
const fs = require('fs')
const { error } = require("console")





module.exports = router;