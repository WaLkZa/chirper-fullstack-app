const express = require("express");

const ChirpController = require("../controllers/chirp");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/all", ChirpController.allChirps);
router.get("/all-followed", isAuth, ChirpController.allChirpsByFollowedUsers);
router.get("/all/:authorId", ChirpController.allChirpsByAuthorID);
router.get("/:id", ChirpController.chirpById);

router.post("/create", isAuth, ChirpController.createChirp);
router.put("/edit/:id", isAuth, ChirpController.editChirp);
router.delete("/delete/:id", isAuth, ChirpController.deleteChirp);

module.exports = router;