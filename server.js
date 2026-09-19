const express = require('express')
const app = express()
const db = require('./db');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json())

// const {jwtAuthMiddleware} = require('./jwt')


const userRoutes = require('./routes/userRoutes')
const candidate = require('./routes/candidate')

app.use('/user', userRoutes);
app.use('/candidate', candidate);



app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
})