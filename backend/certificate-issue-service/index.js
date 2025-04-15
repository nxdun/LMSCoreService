require('dotenv').config();
const express = require('express');
const app = express();
const { connectDB } = require('./config/db');
const certificateRoutes = require('./routes/certificateRoutes');

app.use(express.json());
connectDB();

app.use('/api/certificates', certificateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
