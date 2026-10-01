const express = require("express");

const {
  createNewClass,
  getAllClasses,
  getClassById,
  updateClassName,
  deleteClass,
  getClassByTeacherId,
  addStudentToClass,
  removeStudentFromClass,
  getStudentClasses,
  getMyClass,
} = require("../controllers/class.controller");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const classRouter = express.Router();

classRouter.post(
  "/createNewClass",
  authentication,
  authorization("create-class"),
  createNewClass
);
classRouter.get(
  "/getAllClass",
  authentication,
  getAllClasses
);
classRouter.get("/getClassById/:id", authentication, getClassById);
classRouter.put("/updateClassName/:id", authentication, updateClassName);
classRouter.delete("/deleteClass/:id", authentication, deleteClass);
classRouter.get("/getClassByTeacherId", authentication, getClassByTeacherId);
classRouter.post("/class/join", authentication, addStudentToClass);
classRouter.put("/class/:id/student", removeStudentFromClass);
classRouter.get("/student/:id", getStudentClasses);
classRouter.get("/getMuClass/StudentClass", authentication, getMyClass);
module.exports = classRouter;
