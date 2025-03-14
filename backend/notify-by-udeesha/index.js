const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})