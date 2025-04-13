import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  IconButton, Divider, Card, CardContent
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { createQuiz, getQuizById, updateQuiz } from '../../services/quizService';

const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 60,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [
      { content: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '', points: 10, order: 0 }
    ]
  });

  useEffect(() => {
    if (id) {
      const fetchQuiz = async () => {
        try {
          const data = await getQuizById(id);
          setQuiz(data);
        } catch (error) {
          console.error('Failed to fetch quiz:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchQuiz();
    }
  }, [id]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz({ ...quiz, [name]: value });
  };

  const handleDateChange = (date) => {
    setQuiz({ ...quiz, dueDate: date });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    const options = [...newQuestions[questionIndex].options];
    options[optionIndex] = value;
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestions = [...quiz.questions];
    newQuestions.push({
      content: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      order: newQuestions.length
    });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...quiz.questions];
    newQuestions.splice(index, 1);
    // Update order values
    newQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options.push('');
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateQuiz(id, quiz);
      } else {
        await createQuiz(quiz);
      }
      navigate('/quizzes');
    } catch (error) {
      console.error('Failed to save quiz:', error);
    }
  };

  if (loading) return <Typography>Loading quiz data...</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" mb={3}>
        {id ? 'Edit Quiz' : 'Create New Quiz'}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Quiz Title"
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={quiz.description || ''}
              onChange={handleQuizChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Course ID"
              name="courseId"
              value={quiz.courseId}
              onChange={handleQuizChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Time Limit (minutes)"
              name="timeLimit"
              value={quiz.timeLimit}
              onChange={handleQuizChange}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Due Date"
              type="datetime-local"
              value={new Date(quiz.dueDate).toISOString().slice(0, 16)}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" mb={2}>
        Questions
      </Typography>

      {quiz.questions.map((question, qIndex) => (
        <Card key={qIndex} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Question {qIndex + 1}</Typography>
              <IconButton color="error" onClick={() => removeQuestion(qIndex)}>
                <Delete />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Question"
                  value={question.content}
                  onChange={(e) => handleQuestionChange(qIndex, 'content', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={question.type}
                    label="Question Type"
                    onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                  >
                    <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                    <MenuItem value="true-false">True/False</MenuItem>
                    <MenuItem value="essay">Essay</MenuItem>
                    <MenuItem value="short-answer">Short Answer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Points"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {question.type === 'multiple-choice' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" mb={1}>Options</Typography>
                  <Box sx={{ pl: 2 }}>
                    {question.options.map((option, oIndex) => (
                      <Box key={oIndex} sx={{ display: 'flex', mb: 2 }}>
                        <TextField
                          fullWidth
                          label={`Option ${oIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          sx={{ mr: 1 }}
                        />
                        <IconButton color="error" onClick={() => removeOption(qIndex, oIndex)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    ))}
                    <Button 
                      startIcon={<Add />} 
                      onClick={() => addOption(qIndex)}
                      sx={{ mt: 1 }}
                    >
                      Add Option
                    </Button>
                  </Box>
                </Grid>
              )}

              {question.type !== 'essay' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Correct Answer"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                    helperText={
                      question.type === 'multiple-choice'
                        ? 'Enter the correct option exactly as written above'
                        : question.type === 'true-false'
                        ? 'Enter "true" or "false"'
                        : 'Enter the expected answer'
                    }
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outlined" 
        startIcon={<Add />} 
        onClick={addQuestion}
        sx={{ mb: 4 }}
      >
        Add Question
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/quizzes')}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          startIcon={<Save />}
        >
          Save Quiz
        </Button>
      </Box>
    </Box>
  );
};

export default QuizForm;
