const express = require('express')
const User = require('../models/user')
// const ObjectId = require('mongoose').Types.ObjectId
const mongoose = require('mongoose')

const Authenticate = require('../middleware/auth')
const router = express.Router()

/*
    POST
*/
//User sign up
router.post('/signup', Authenticate, (req,res) => {

    let data = {}
    data.userEmail = req.body.email
    data.userPassword = req.body.password

    const user = new User({
        _id: mongoose.Types.ObjectId(),
        email: data.userEmail,
        password: data.userPassword,
        createdAt: Date.now()
    })

    user.save()
    .then(savedUser => {
        // res.status(200).json({
        //     email: savedUser.email,
        //     added: true
        // })
    })
    .then(() => user.createAuthToken())
    .then(token => {
        res.status(200).header('x-auth', token).json({
            email: data.userEmail,
            added: true
        })
    })
    .catch(err => {
        console.log('catch:\n',err)
        res.status(400).json({error: err, added: false})
    })

});

module.exports = router;