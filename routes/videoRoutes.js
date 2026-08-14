const express = require("express");

const router = express.Router();

const videoController = require("../controllers/videoController");
const uploadVideo = require("../middleware/videoUpload");

// Add Video
router.get(
    "/add",
    videoController.addVideoPage
);

router.post(
    "/add",
    uploadVideo.single("video"),
    videoController.addVideo
);

// Edit Video
router.get(
    "/edit/:id",
    videoController.editVideoPage
);

router.post(
    "/edit/:id",
    uploadVideo.single("video"),
    videoController.updateVideo
);

// Video Details
router.get(
    "/:id",
    videoController.videoDetails
);

module.exports = router;