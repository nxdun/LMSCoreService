const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a quiz
async function createQuiz(quizData) {
  const { questions, ...quizInfo } = quizData;
  
  const quiz = await prisma.quiz.create({
    data: {
      ...quizInfo,
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

module.exports = {
  createQuiz,
  submitQuizAttempt,
  // Export other methods
};