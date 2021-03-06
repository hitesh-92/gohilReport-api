const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require("moment");

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
    minlength: 8
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

UserSchema.pre('save', function(next) {

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

  if (changedPassword) hashPassword()
  else next()

});

UserSchema.methods.createAuthToken = function() {

  var user = this;
  const access = 'auth'

  const tokenData = {
    data: {
      _id: user._id.toHexString(),
      access
    }
  };

  const token = jwt.sign(tokenData, process.env.jwtSecret, {
    expiresIn: '1h'
  }).toString()

  user.tokens = user.tokens.concat({
    access,
    token
  })

  return user.save().then(() => token)
};

UserSchema.statics.findByCredentials = function(email, password) {

  var User = this;

  return User.findOne({
      email
    })
    .exec()
    .then(user => {
      if (!user) return Promise.reject()

      return new Promise((resolve, reject) => {
        bcrypt.compare(String(password), String(user.password))
          .then(result => {
            result === true ? resolve(user) : reject(false)
          })
      })
    });
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.jwtSecret)
  } catch (err) {
    return Promise.reject(err)
  }

  return User.findOne({
    '_id': decoded.data._id,
    'tokens.access': 'auth',
    'tokens.token': token
  })
};


module.exports = mongoose.model('user', UserSchema);