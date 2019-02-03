const User = require('../models/user')

const Authenticate = (req, res, next) => {

    console.log('AUTH')

    const token = req.header('x-auth');

    User.findByToken(token)
    .then(user => {

        console.log('Auth - user returned')

        if (!user) {
            console.log('Auth - not user')
            return Promise.reject()
        }

        req.user = user;
        req.token = token;
        next();

    })
    .catch(err => {

        console.log('Auth - ERROR')

        res.status(401).json({
            error: err,
            message: 'Error Processing Log In'
        })
    });

};


module.exports = Authenticate;