const express = require("express");

const router = express.Router();

const videoController = require("../controllers/videoController");

const uploadVideo = require("../middleware/videoUpload");


// Add Video Page
router.get(
    "/add",
    videoController.addVideoPage
);


// Add Video
router.post(
    "/add",
    uploadVideo.single("video"),
    videoController.addVideo
);


module.exports = router;