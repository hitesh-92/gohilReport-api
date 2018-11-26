const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

const articleLogRoutes = require('./api/routes/articleLog')


app.get('/', (req,res) => res.send({name:'HiteshGohil'}) )

// app.use('/article', articleLogRoutes)


app.use((req, res, next) => {
    res.status(404).json({error: 'Error - APP.js!!!!'});
    next(error);
});

module.exports = {app};