const express = require('express')
const app = express()

app.get('/', (req,res) => res.send({name:'HiteshGohil'}) )

module.exports = app;