require('./server/config.js')
require('./db/mongoose')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
// const mongoose = 
// require('./db/mongoose')

const articleLogRoutes = require('./api/routes/articleLog')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req,res) => res.send({name:'HiteshGohil'}) )

app.use('/article', articleLogRoutes)


app.use((req, res, next) => {
    res.status(404).json({error: 'Error - APP.js!!!!'})
    next(error);
});

app.listen(process.env.PORT);

module.exports = {app}