const express = require("express");

const {
  createLetter,
  getAllLetter,
  getLetterById,
} = require("../controllers/letter.controller");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const letterRouter = express.Router();

letterRouter.post("/createLetter", createLetter);
letterRouter.get("/getAllLetter", getAllLetter);
letterRouter.get("/getLetterById/:id", authentication, getLetterById);

module.exports = letterRouter;
