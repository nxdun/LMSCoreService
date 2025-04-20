const express = require('express');
const dotenv = require('dotenv');
const notificationRoutes = require('./Routes/NotificationRoute');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors(
    {
        origin: ['http://localhost:3000','http://localhost:5173/', 'http://localhost:1118'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    }
));
app.use('/notifications', notificationRoutes);

const PORT = process.env.PORT || 1114;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});