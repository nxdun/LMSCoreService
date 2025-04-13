import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Radio, RadioGroup, 
  FormControlLabel, FormControl, FormLabel, TextField,
  Card, CardContent, Divider, LinearProgress, Alert
} from '@mui/material';
import { getQuizById, submitQuizAttempt } from '../../services/quizService';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  
  // Mock user ID - would come from auth context in a real app
  const userId = "user123";

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizById(id);
        setQuiz(data);
        setAnswers(data.questions.map(q => ({ questionId: q.id, answer: '' })));
        
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60);
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(answers.map(a => 
      a.questionId === questionId ? { ...a, answer: value } : a
    ));
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    
    const confirmSubmit = isAutoSubmit || window.confirm(
      "Are you sure you want to submit your answers? You cannot change them after submission."
    );
    
    if (confirmSubmit) {
      setSubmitting(true);
      try {
        await submitQuizAttempt(id, userId, answers);
        navigate(`/quizzes/${id}/result`);
      } catch (error) {
        console.error('Failed to submit quiz:', error);
        setSubmitting(false);
      }
    }
  };

  if (loading) return <Typography>Loading quiz...</Typography>;
  if (!quiz) return <Typography>Quiz not found</Typography>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">{quiz.title}</Typography>
        {quiz.description && (
          <Typography variant="body1" sx={{ mt: 1 }}>{quiz.description}</Typography>
        )}
        
        {timeRemaining !== null && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color={timeRemaining < 60 ? "error" : "text.primary"}>
              Time Remaining: {formatTime(timeRemaining)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(timeRemaining / (quiz.timeLimit * 60)) * 100} 
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </Paper>

      {quiz.questions.map((question, index) => (
        <Card key={question.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Question {index + 1} ({question.points} points)
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
              {question.content}
            </Typography>

            {question.type === 'multiple-choice' && (
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers.find(a => a.questionId === question.id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  {question.options.map((option, i) => (
                    <FormControlLabel 
                      key={i} 
                      value={option} 
                      control={<Radio />} 
                      label={option} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {question.type === 'true-false' && (
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers.find(a => a.questionId === question.id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  <FormControlLabel value="true" control={<Radio />} label="True" />
                  <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
              </FormControl>
            )}

            {question.type === 'essay' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Answer"
                value={answers.find(a => a.questionId === question.id)?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            )}

            {question.type === 'short-answer' && (
              <TextField
                fullWidth
                label="Your Answer"
                value={answers.find(a => a.questionId === question.id)?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/quizzes')}
        >
          Exit Quiz
        </Button>
        <Button 
          variant="contained" 
          onClick={() => handleSubmit()}
          disabled={submitting}
        >
          Submit Quiz
        </Button>
      </Box>
    </Box>
  );
};

export default QuizAttempt;
