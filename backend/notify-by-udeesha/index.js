const express = require('express');
const dotenv = require('dotenv');
const notificationRoutes= require('./Routes/NotificationRoute');

dotenv.config();

app.use(express.json());

app.use('/notifications', notificationRoutes);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})