const {
    Types: { ObjectId }
} = require('mongoose');

const register = (User) => (req, res) => {

    let data = {
        email: req.body.email,
        added: false
    }


    const user = new User({
        _id: new ObjectId(),
        email: data.email,
        password: req.body.password,
        createdAt: Date.now()
    })

    user.save()
    .then(user => {
        if(user) data.added = true
        res.status(200).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(400).json(data)
    })

}

module.exports = { register }
