const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const newsController = require("../controllers/newsController");

router.post("/", upload.single("image"), newsController.createNews);

module.exports = router;