const express = require("express");

const UserController = require("../controllers/user");

const router = express.Router();

// TODO: change to post method
router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);

module.exports = router;