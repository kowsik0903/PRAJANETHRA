const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/", homeController.home);

// News Details
router.get("/news/:id", homeController.newsDetails);
router.get("/category/:id", homeController.categoryNews);
router.get("/search", homeController.searchNews);
router.get("/about", homeController.aboutPage);

module.exports = router;