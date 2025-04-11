import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Typography, Box, Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility, CloudUpload } from '@mui/icons-materi
al';
import { fetchAssignments, deleteAssignment } from '../../services/assignmentService';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getAssignments = async () => {
      try {
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getAssignments();
  }, []);

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(id);
        setAssignments(assignments.filter(assignment => assignment.id !== id));
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  // Calculate if an assignment is past due
  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) return <Typography>Loading assignments...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Assignments</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/assignments/create')}
        >
          Create Assignment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No assignments found</TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.courseId}</TableCell>
                  <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {isPastDue(assignment.dueDate) ? (
                      <Chip label="Past Due" color="error" size="small" />
                    ) : (
                      <Chip label="Active" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<CloudUpload />}
                      onClick={() => navigate(`/assignments/${assignment.id}/submit`)}
                      sx={{ mr: 1 }}
                    >
                      Submit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Edit />}
                      onClick={() => navigate(`/assignments/edit/${assignment.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Delete />}
                      onClick={() => handleDeleteAssignment(assignment.id)}
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

export default AssignmentList;
