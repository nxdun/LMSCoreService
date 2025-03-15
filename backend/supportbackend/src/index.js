const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const learner = require('./routes/learnerRoutes');
const tickerRouter=require('./routes/TicketRoutes');
const paymentRouter=require('./routes/paymentRoutes')
const RatingRouter=require('./routes/ratingRoutes')
const app = express();
require('dotenv').config();
const cors = require('cors');

app.use(cors(
    {
        origin: ['http://localhost:3000', 'http://localhost:8070'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    }
));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
// sendTestEmail()
const db = process.env.MONGODB_URI;

mongoose
    .connect('mongodb+srv://rukshan:rukshan123@cluster0.w9lemr4.mongodb.net/AssignmentAF?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.log(err));

app.use('/api', tickerRouter);
app.use('/api', RatingRouter);
// app.use('/api', paymentRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8074;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
