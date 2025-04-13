import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'\;

// Fetch all quizzes
export const fetchQuizzes = async () => {
  const response = await axios.get(`${API_URL}/quizzes`);
  return response.data;
};

// Get a single quiz by ID
export const getQuizById = async (id) => {
  const response = await axios.get(`${API_URL}/quizzes/${id}`);
  return response.data;
};

// Create a new quiz
export const createQuiz = async (quizData) => {
  const response = await axios.post(`${API_URL}/quizzes`, quizData);
  return response.data;
};

// Update an existing quiz
export const updateQuiz = async (id, quizData) => {
  const response = await axios.put(`${API_URL}/quizzes/${id}`, quizData);
  return response.data;
};

// Delete a quiz
export const deleteQuiz = async (id) => {
  const response = await axios.delete(`${API_URL}/quizzes/${id}`);
  return response.data;
};

// Submit a quiz attempt
export const submitQuizAttempt = async (quizId, userId, answers) => {
  const response = await axios.post(`${API_URL}/quizzes/${quizId}/attempt`, {
    userId,
    answers
  });
  return response.data;
};

// Get quiz attempts by user
export const getQuizAttemptsByUser = async (userId) => {
  const response = await axios.get(`${API_URL}/quizzes/attempts/user/${userId}`);
  return response.data;
};
