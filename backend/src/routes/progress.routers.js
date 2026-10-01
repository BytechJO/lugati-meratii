const express = require("express");

const {
  upsertUserProgress,
  getUserProgressByLetter,
  getUserProgressSummary,
  addStudentAnswer,
  getAnswersByLessonAndUser,
  getLessonResult,
  getLastAnswerByQuestion,
  submitAnswer,
  calculateLessonResult,
  getLessonResultByUser,
  markLessonCompleted,
  getAllLessonResultsByUser,
  getCurrentLessonForLetter,
  checkLetterCompletion,
  getUserLettersStatus,getStudentProgress
} = require("../controllers/progress.controller");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");

const progressRouter = express.Router();
progressRouter.post("/upsertProgress", authentication, upsertUserProgress);
progressRouter.get(
  "/progress/:user_id/letter/:letter_id",
  getUserProgressByLetter
);
progressRouter.get(
  "/progress/letter/:letter_id/current",
  authentication,
  getCurrentLessonForLetter
);
progressRouter.get("/progress/:user_id/summary", getUserProgressSummary);
progressRouter.post("/answers", addStudentAnswer);
progressRouter.get("/answers/:lessons_id/:user_id", getAnswersByLessonAndUser);
progressRouter.get("/answers/:lessons_id/:user_id/result", getLessonResult);
progressRouter.get(
  "/answers/question/:question_id/:user_id",
  getLastAnswerByQuestion
);
progressRouter.post("/student-answers/submit", authentication, submitAnswer);
progressRouter.post(
  "/student-lesson-result/calculate",
  authentication,
  calculateLessonResult
);
progressRouter.get(
  "/student-lesson-result/:lessons_id/:user_id",
  getLessonResultByUser
);
progressRouter.get(
  "/student-lesson-result/user/:user_id",
  getAllLessonResultsByUser
);
progressRouter.get("/student-lesson-result/complete", markLessonCompleted);
progressRouter.get(
  "/:letterId/completion-status",
  authentication,
  checkLetterCompletion
);
progressRouter.get("/user-status", authentication, getUserLettersStatus);
progressRouter.get ("/students/:studentId/progress",getStudentProgress)
module.exports = progressRouter;
