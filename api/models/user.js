const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true,
        minlength: 10
    },
    createdAt: {
        type: String
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        },
    ]

})

UserSchema.pre('save', function(next){

    var user = this;

    const changedPassword = user.isModified('password')

    const hashPassword = () => {
        bcrypt.genSalt(1, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }

    if(changedPassword) hashPassword()
    else next()

});

UserSchema.methods.createAuthToken = function(){

    var user = this;
    const access = 'auth';

    const tokenData = {
        data: {
            _id: user._id.toHexString(),
            access
        },
        exp: Math.floor(Date.now() / 1000) + (60 * 15)
    };

    const token = jwt.sign(tokenData, process.env.xJWT).toString()

    user.tokens = user.tokens.concat({access, token})

    return user.save().then(() => { return token })
};








module.exports = mongoose.model('user', UserSchema);