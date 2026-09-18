const express = require('express')
const app = express()
const db = require('./db');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json())


const userRoutes = require('./routes/userRoutes')

app.use('/user', userRoutes);



app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
})