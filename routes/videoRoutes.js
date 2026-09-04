const express = require("express");

const router = express.Router();
const db = require("../config/db");
const videoController = require("../controllers/videoController");
const uploadVideo = require("../middleware/videoUpload");



const {
    generateVideoPreview
} = require("../utils/videoPreview");

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

router.post(
    "/:id/view",
    videoController.incrementVideoView
);

router.get("/:id/preview.jpg", (req, res) => {
    db.query(
        "SELECT youtube_url, video_url, video_type FROM videos WHERE id = ?",
        [req.params.id],
        async (err, rows) => {

            if (err) {
                console.error("Video preview DB error:", err);
                return res.status(500).send("Database error");
            }

            if (!rows.length) {
                return res.status(404).send("Video not found");
            }

            try {
                const image = await generateVideoPreview(rows[0]);

                res.setHeader("Content-Type", "image/jpeg");
                res.setHeader(
                    "Cache-Control",
                    "public, max-age=86400"
                );

                res.send(image);

            } catch (error) {
                console.error(
                    "Video preview generation error:",
                    error
                );

                res.status(500).send(
                    "Unable to generate video preview"
                );
            }
        }
    );
});
module.exports = router;