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

    const findUser = async (email, password) => {
        const user = await User.findByCredentials(email, password)
        if ( user === false ) return false
        else return user
    }

    findUser( data.email, req.body.password )
    .then( async (user) => {

        if (user === false) {
            data.message = 'Unable to find user'
            return res.status(404).send(data)
        }

        const token = await user.createAuthToken()

        if (!token) {
            data.message = 'Unable to authenticate user'
            res.status(401).send(data)
        } else {
            data.loggedIn = true
            data.token = token;
            res.status(200).send(data)
        }
    })
    .catch(error => {
        data.error = error
        data.message = 'Unable to login. Contact'
        res.status(400).send(data)
    })

})

//ADD LOGOUT

module.exports = router;
