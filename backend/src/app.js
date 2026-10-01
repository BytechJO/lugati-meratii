const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./models/db");
require("./models/activationDB")

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// routes
const usersRouter = require("./routes/user.routers");
const rolesRouter = require("./routes/roles.routers");
const classRouter = require("./routes/class.routers");
const letterRouter = require("./routes/letter.routers");
const lessonRouter = require("./routes/lesson.routers");
const progressRouter = require("./routes/progress.routers");
// import passport from "passport";
// import "./config/passport.js";
// import googleAuthRoutes from "./routes/googleAuth.js";
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// app.use(passport.initialize());
// app.use("/auth", googleAuthRoutes);
// router middleware
app.use("/users", usersRouter);
app.use("/roles", rolesRouter);
app.use("/class", classRouter);
app.use("/letters", letterRouter);
app.use("/lessons", lessonRouter);
app.use("/progress", progressRouter);

// Handles any other endpoints [unassigned - endpoints]
app.use((req, res) => {
  res.status(404).json("NO content at this path");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
