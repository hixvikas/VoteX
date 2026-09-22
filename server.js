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

// Keep unexpected server details out of API responses.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});



app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
})
