const express = require('express')

const app = express()

app.use(express.json())

app.use('/categories', require('./routes/categoryRoute'))
app.use('/products', require('./routes/productRoute'))

app.listen(3000, () => console.log('Server started on port 3000'))