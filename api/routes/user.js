const express = require('express')
const router = express.Router()

const Controller = require('../controllers/users');
const User = require('../models/user');

router.post('/signup', Controller.register(User));
router.post('/login', Controller.login(User));

//ADD LOGOUT => remove token

module.exports = router;