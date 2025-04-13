import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Typography, Box, Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { fetchQuizzes, deleteQuiz } from '../../services/quizService';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getQuizzes = async () => {
      try {
        const data = await fetchQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getQuizzes();
  }, []);

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(id);
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    }
  };

  if (loading) return <Typography>Loading quizzes...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Quizzes</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/quizzes/create')}
        >
          Create Quiz
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Time Limit</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No quizzes found</TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.description}</TableCell>
                  <TableCell>{quiz.timeLimit} minutes</TableCell>
                  <TableCell>{new Date(quiz.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Edit />}
                      onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Delete />}
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuizList;
