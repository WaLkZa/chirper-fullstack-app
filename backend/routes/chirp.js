const express = require("express");

const ChirpController = require("../controllers/chirp");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post("/create", isAuth, ChirpController.createChirp);
router.put("/edit/:id", isAuth, ChirpController.editChirp);
router.delete("/delete/:id", isAuth, ChirpController.deleteChirp);

module.exports = router;