const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactController");

router.get("/", contactController.contactPage);

router.post("/", contactController.saveMessage);

module.exports = router;