const express = require('express')
const User = require('../models/user')

const mongoose = require('mongoose')

const Authenticate = require('../middleware/auth')
const router = express.Router()

/*
    POST
*/
// User sign up
router.post('/signup', (req,res) => {
console.log('HIT')
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
    .then(() => user.createAuthToken())
    .then(token => {
        res.status(200)
        .header('x-auth', token)
        .json({
            email: data.userEmail,
            added: true
        })
    })
    .catch(err => {
        console.log('catch:\n',err)
        res.status(400).json({
            email: data.userEmail,
            error: err,
            added: false
        })
    })

});


// Login
router.post('/login', (req,res) => {

    let data = {}
    data.email = req.body.email
    data.password = req.body.password

    User.findByCredentials(data.email, data.password)
    .then(user => {return user.createAuthToken()})
    .then(token => {
        res.status(200)
        .header('x-auth', token)
        .json({
            loggedIn: true
        })
    })
    .catch(err => {
        console.log(`ERROR:\n${err}`)
        res.send(400).json({
            loggedIn: false
        })
    })

})


module.exports = router;