const express = require("express");

const ChirpController = require("../controllers/chirp");

const router = express.Router();

router.post("/create", ChirpController.createChirp);
router.put("/edit/:id", ChirpController.editChirp);
router.delete("/delete/:id", ChirpController.deleteChirp);

module.exports = router;