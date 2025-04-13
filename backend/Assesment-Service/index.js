const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const quizRoutes = require('./routes/quiz.routes');
// Uncomment as you implement these routes
// const assignmentRoutes = require('./routes/assignment.routes');
// const gradingRoutes = require('./routes/grading.routes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Assessment Service API' });
});

// Register routes
app.use('/api/quizzes', quizRoutes);
// Uncomment as you implement these routes
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/grading', gradingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Assessment Service API is available at http://localhost:${PORT}`);
});