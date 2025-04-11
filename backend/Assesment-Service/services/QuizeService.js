const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Create a quiz
async function createQuiz(quizData) {
  const { questions, courseId, ...quizInfo } = quizData;

  if (!courseId) {
    throw new Error("courseId is required to create a quiz.");
  }

  const quiz = await prisma.quiz.create({
    data: {
      ...quizInfo,
      courseId, // Include the courseId
      questions: {
        create: questions.map((q, index) => ({
          ...q,
          order: index
        }))
      }
    },
    include: { questions: true }
  });

  return quiz;
}

// Submit quiz attempt
async function submitQuizAttempt(quizId, userId, answers) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true }
  });
  
  // Calculate auto-graded score
  let totalPoints = 0;
  let earnedPoints = 0;
  
  quiz.questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    totalPoints += question.points;
    
    if (answer && question.type !== 'essay') {
      if (answer.answer === question.correctAnswer) {
        earnedPoints += question.points;
      }
    }
  });
  
  // Only auto-grade quiz if there are no essay questions
  const hasEssayQuestions = quiz.questions.some(q => q.type === 'essay');
  
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
      answers,
      score: hasEssayQuestions ? null : (earnedPoints / totalPoints) * 100,
      submittedAt: new Date(),
      graded: !hasEssayQuestions
    }
  });
  
  return attempt;
}

// Other methods: getQuizById, updateQuiz, deleteQuiz, getQuizAttempts, etc.
// Get quiz by ID
async function getQuizById(quizId) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true } // Include related questions
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return quiz;
}
module.exports = {
  createQuiz,
  submitQuizAttempt,
  getQuizById
  // Export other methods
};