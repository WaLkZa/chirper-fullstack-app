const express = require("express");

const UserController = require("../controllers/user");

const router = express.Router();

// TODO: change to post method
router.get("/signup", UserController.createUser);

router.get("/login", UserController.userLogin);

module.exports = router;