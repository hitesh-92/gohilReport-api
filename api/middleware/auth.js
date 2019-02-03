const User = require('../models/user')

const Authenticate = (req, res, next) => {

    const token = req.header('x-auth');

    User.findByToken(token)
    .then(user => {

        if (!user) return Promise.reject()

        req.user = user;
        req.token = token;
        next();        

    })
    .catch(err => {
        res.status(401).json({
            error: err,
            message: 'Error Processing Log In'
        })
    });

};


module.exports = Authenticate;

// module.exports = (res, req, next) => {
//     //pass anything through
//     try {
//         next()
//     } catch (error) {
//         return res.status(404).json({error: '**Need auth**'})
//     }
// }