// 🔐 Role Controller

// ليش؟ صلاحيات

// Functions:
// createRole
// getAllRoles

// 🔑 Permission Controller

// Functions:
// createPermission
// getAllPermissions
// createPermissionToRole
// getRolePermissions

// 👤 Users Controller

// Functions:

// createUser
// loginUser
// getAllUsers
// getUserById
// updateUser
// deleteUser

// 🏫 Class Controller

// Functions:

// createClass
// getAllClasses
// getClassById
// updateClass
// deleteClass
// getTeacherClasses

// 👩‍🎓 ClassStudent Controller (Relation Table)

// Functions:

// addStudentToClass
// removeStudentFromClass
// getStudentClasses

// 🔤 Letters Controller

// Functions:

// createLetter
// getAllLetters
// getLetterById
// updateLetter
// deleteLetter

// 📚 LetterLessons Controller

// Functions:
//==========================
// createLesson
// getLessonsByLetter
// getLessonById
// deleteLesson

// 🎥 VideoLessons Controller

// Functions:

// addVideoLesson
// getVideoLessonsByLetter
// getVideoLessonById

// 🎮 GamesLessons Controller

// Functions:

// addGameLesson
// getGamesByLetter
// getGameById
//  saveGameResult,
//  getStudentGameResults,
//  getStudentResultsByLetter,
//  getStudentProgress,

// ❓ QuestionsLessons Controller

// Functions:

// addQuestion
// getQuestionsByLesson
// updateQuestion
// deleteQuestion

// 📈 UserProgress Controller

// Functions:

//upsertUserProgress,
//getUserProgressByLetter,
//getUserProgressSummary,

// ✍️ StudentAnswers Controller

// Functions:

//addStudentAnswer,
//getAnswersByLessonAndUser,
//getLessonResult,
//getLastAnswerByQuestion,
// submitAnswer,

// 🧮 StudentLessonResult Controller

// Functions:

// submitLessonResult
// getLessonResult
// getUserLessonResults
