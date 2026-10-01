const express = require("express");

const {
  createLesson,
  getLessonsByLetterId,
  getLessonById,
  deleteLesson,
  addVideoLesson,
  getVideoLessonsByLetterAndLesson,
  addGameLesson,
  createGameConfig,
  getGamesByLetter,
  getGameById,
  saveGameResult,
  getStudentGameResults,
  getStudentResultsByLetter,
  getStudentProgress,
  addQuestion,
  getQuestionsByLesson,
  updateQuestion,
  deleteQuestion,
  getLetterGamesProgress,
  getGameLessonByLetterAndType,
} = require("../controllers/lesson.controller");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const lessonRouter = express.Router();

lessonRouter.post(
  "/createLesson",

  createLesson
);
lessonRouter.get("/lessons/:letter_id", getLessonsByLetterId);
lessonRouter.get("/lessonsById/:id/lessonID", getLessonById);
lessonRouter.put("/deleteLesson/:id", deleteLesson);
lessonRouter.post("/addVideo-lessons", addVideoLesson);
lessonRouter.get(
  "/video-lessons/:letter_id/:lesson_id",
  getVideoLessonsByLetterAndLesson
);
lessonRouter.post("/lesson-games", addGameLesson);
lessonRouter.post("/game-configs", createGameConfig);
lessonRouter.get("/game-lesson/:id/letter-id", getGamesByLetter);
lessonRouter.get("/games/:id", getGameById);
lessonRouter.post("/saveGameResult", authentication, saveGameResult);
lessonRouter.get("/student-games/student/:student_id", getStudentGameResults);
lessonRouter.get(
  "/student-games/student/:student_id/letter/:letter_id",
  getStudentResultsByLetter
);
lessonRouter.get("/student-games/progress/:student_id", getStudentProgress);
lessonRouter.post("/questions", addQuestion);
lessonRouter.get("/questions", getQuestionsByLesson);

lessonRouter.put("/questions/:id", updateQuestion);
lessonRouter.delete("/questions/:id", deleteQuestion);
lessonRouter.get(
  "/:letterId/games/progress",
  authentication,
  getLetterGamesProgress
);
lessonRouter.get(
  "/games-lessons/by-letter-and-type",
  getGameLessonByLetterAndType
);
module.exports = lessonRouter;
