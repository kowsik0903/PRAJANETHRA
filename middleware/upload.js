const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;

    const valid =
        allowed.test(file.mimetype) &&
        allowed.test(path.extname(file.originalname).toLowerCase());

    if (valid) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG and WEBP are allowed."));
    }
};

module.exports = multer({
    storage,
    fileFilter
});