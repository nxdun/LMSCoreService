const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const plagiarismService = require('./PlagiarismService');

// Create an assignment
async function createAssignment(assignmentData) {
  const assignment = await prisma.assignment.create({
    data: assignmentData
  });
  
  return assignment;
}

// Submit assignment
async function submitAssignment(assignmentId, userId, submissionData) {
  const { content, fileUrls } = submissionData;
  
  // Check for plagiarism if text content is provided
  let plagiarismScore = null;
  if (content) {
    plagiarismScore = await plagiarismService.checkPlagiarism(content, assignmentId);
  }
  
  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      userId,
      content,
      fileUrls,
      plagiarismScore
    }
  });
  
  return submission;
}

// Grade assignment
async function gradeAssignment(submissionId, gradeData) {
  const { grade, feedback } = gradeData;
  
  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { grade, feedback }
  });
  
  return submission;
}

module.exports = {
  createAssignment,
  submitAssignment,
  gradeAssignment,
  // Export other methods
};