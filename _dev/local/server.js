const path = require('path')
const express = require('express')
const app = express()
const port = +process.argv[2] || 3000
const config = require('./config.json')

app.use(`/~${config.username}`, express.static(path.join(__dirname, '../..')))

app.listen(port, () => {
  console.log(`App started on port ${port}`)
})
