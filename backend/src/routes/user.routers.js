const express = require("express");

const {
  register,
  login,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const usersRouter = express.Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.get("/", authentication, getUserById);
usersRouter.get("/getAll", authentication,authorization("get-allUsers"), getAllUsers);
usersRouter.put("/updateUser/:id", authentication, updateUser);
usersRouter.delete("/deleteUser/:id", authentication, deleteUser);

module.exports = usersRouter;
