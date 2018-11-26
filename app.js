const express = require('express')
const app = express()

const articleLogRoutes = require('./api/routes/articleLog')


app.get('/', (req,res) => res.send({name:'HiteshGohil'}) )

app.use('/article', articleLogRoutes)

module.exports = app;