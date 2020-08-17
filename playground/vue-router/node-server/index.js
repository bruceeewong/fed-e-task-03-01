const path = require('path')
const express = require('express')
const history = require('connect-history-api-fallback')

const app = express()
app.use(history())
app.use(express.static(path.resolve(__dirname, '../www/demo')))

app.listen('3000', () => {
  console.log('server is running at port 3000')
})