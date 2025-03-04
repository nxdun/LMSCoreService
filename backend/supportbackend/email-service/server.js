const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const learner = require('./routes/learnerRoutes');

const app = express();

const cors = require('cors');

app.use(cors(
    {
        origin: ['http://localhost:3000', 'http://localhost:8076'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    }
));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


const port =  8076;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
