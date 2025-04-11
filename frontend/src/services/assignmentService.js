import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'\;

// Fetch all assignments
export const fetchAssignments = async () => {
  const response = await axios.get(`${API_URL}/assignments`);
  return response.data;
};

// Get a single assignment by ID
export const getAssignmentById = async (id) => {
  const response = await axios.get(`${API_URL}/assignments/${id}`);
  return response.data;
};

// Create a new assignment
export const createAssignment = async (assignmentData) => {
  const response = await axios.post(`${API_URL}/assignments`, assignmentData);
  return response.data;
};

// Update an existing assignment
export const updateAssignment = async (id, assignmentData) => {
  const response = await axios.put(`${API_URL}/assignments/${id}`, assignmentData);
  return response.data;
};

// Delete an assignment
export const deleteAssignment = async (id) => {
  const response = await axios.delete(`${API_URL}/assignments/${id}`);
  return response.data;
};

// Submit an assignment
export const submitAssignment = async (assignmentId, userId, submissionData) => {
  const response = await axios.post(`${API_URL}/assignments/${assignmentId}/submit`, {
    userId,
    ...submissionData
  });
  return response.data;
};

// Get assignment submissions by assignment ID
export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await axios.get(`${API_URL}/assignments/${assignmentId}/submissions`);
  return response.data;
};

// Grade an assignment submission
export const gradeAssignment = async (submissionId, gradeData) => {
  const response = await axios.post(`${API_URL}/assignments/submissions/${submissionId}/grade`, gradeData);
  return response.data;
};
