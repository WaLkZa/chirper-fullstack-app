const express = require("express");

const UserController = require("../controllers/user");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/all", UserController.allUsers);

router.get("/:id", UserController.userById);

router.get('/follow/:id', isAuth, UserController.followUser);

router.get("/is-followed/:id", isAuth, UserController.isUserFollowed);

router.get("/stats/:id", UserController.userStats);

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);


module.exports = router;