const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/", homeController.home);

// News Details
router.get("/news/:id", homeController.newsDetails);

router.get("/category/:id", homeController.categoryNews);
router.get("/search", homeController.searchNews);
router.get("/about", homeController.aboutPage);

// YouTube Videos
router.get("/videos", homeController.videosPage);
router.get("/video/:id", homeController.videoDetails);

module.exports = router;

