const express = require("express");

const UserController = require("../controllers/user");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/all", UserController.allUsers);

router.get("/:id", UserController.userById);

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);

router.put('/follow/:id', isAuth, UserController.followUser);

module.exports = router;