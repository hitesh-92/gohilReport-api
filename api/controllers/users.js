const {
  Types: {
    ObjectId
  }
} = require('mongoose');

module.exports = {
  register,
  login,
  logout
};

function register(User) {
  return function handleUserRegistration(req, res) {

    let data = {
      email: req.body.email,
      added: false
    }

    var user = new User({
      _id: new ObjectId(),
      email: data.email,
      password: req.body.password,
      createdAt: Date.now()
    })

    user.save()
      .then(user => {
        if (user) data.added = true
        res.status(200).json(data)
      })
      .catch(err => {
        data.error = err
        res.status(400).json(data)
      })

  }
}

function login(User) {
  return function handleUserLogin(req, res) {

    let data = {
      email: req.body.email,
      loggedIn: false
    }

    const findUser = async (email, password) => {
      const user = await User.findByCredentials(email, password)
      if (user === false) return false
      else return user
    }

    findUser(data.email, req.body.password)
      .then(async (user) => {

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

  }
};

function logout(User){
  return async function handleUserLogout(req, res){

    { // validation
      const hasEmail = req.body.hasOwnProperty('email');
      if( !hasEmail ) return;
      req.body.email = req.body.email.trim();
    }

    const token = req.headers['x-auth'];

    const [validUser, validateUserEmail, logoutUser] = await findUserByToken(token);

    if( !validUser ) return;

    const validEmail = validateUserEmail(req.body.email);
    if( !validEmail ) return res.status(400).json({ loggedOut: false }).end();

    await logoutUser();
    return res.json({loggedOut: true});

    // -----

    async function findUserByToken(token){
      var user;

      try {
        user = await User.findByToken(token);
      } catch (e) {
        user = null;
      } finally {
        if( user === null ) return [false, null, null];
        return [true, handleEmailValidation, handleLogout];
      }

      // ----

      function handleEmailValidation(input_email){
        const { email } = user;
        if( input_email !== email ) return false;
        return true;
      };

      async function handleLogout(){
        return await removeUserAuthToken(user);
      };

    };

    async function removeUserAuthToken (user){

      const { tokens, _id } = user;
      const updatedTokens = tokens.filter(filterAuthTokens);

      // console.log(`update data ==> \nid:${_id}\ntokens:${updatedTokens}`)

      const updated = await updateUserTokens(_id, updatedTokens);

    };

    function filterAuthTokens(token){
      if( token.access !== 'auth' ) return token;
    };

    async function updateUserTokens(id, tokens){
      return await User.updateOne(
        { '_id': id },
        { $set : { tokens: tokens } }
      );
    };

  }
};
