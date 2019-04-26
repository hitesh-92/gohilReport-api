const express = require('express')
const router = express.Router()

const User = require('../models/user')

const mongoose = require('mongoose')

// const Authenticate = require('../middleware/auth')


router.post('/signup', (req,res) => {
    
    let data = { 
        email: req.body.email,
        added: false
    }

    const user = new User({
        _id: mongoose.Types.ObjectId(),
        email: data.email,
        password: req.body.password,
        createdAt: Date.now()
    })

    user.save()
    .then(user => {
        if(user) data.added = true
        res.status(200).send(data)
    })
    .catch(err => {
        data.error = err
        res.status(400).send(data)
    })

});


router.post('/login', (req,res) => {

    let data = { 
        email: req.body.email,
        loggedIn: false
    }

    User.findByCredentials(data.email, req.body.password)
    .then(user => {
        if(!user) return false
        return user.createAuthToken()
    })
    .then(token => {

        if (!token || token === null){
            return res.status(404).send(data)
        }
        else data.loggedIn = true

        res.status(200)
        .header('x-auth', token)
        .send(data)
    })
    .catch(err => {
        data.error = true
        res.status(400).send(data)
    })

})

//ADD LOGOUT

module.exports = router;