require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const url = process.env.MONGO_URL;


app.use(express.json());

mongoose.connect(url)
    .then(() => {
        console.log('Mongoose server connected successfully');
    })
    .catch(err => {
        console.error('Mongoose connection error:', err);
    });

const usersRouter = require('./routes/users.route');
app.use("/api/users", usersRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});