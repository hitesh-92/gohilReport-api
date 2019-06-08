const express = require('express')
const router = express.Router()

const Controller = require('../controllers/users');
const User = require('../models/user')
// const mongoose = require('mongoose')


router.post('/signup', Controller.register(User) );

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
