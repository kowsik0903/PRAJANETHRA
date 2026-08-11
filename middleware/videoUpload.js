const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create temporary upload folder
const uploadDir = path.join(__dirname, "../uploads/videos");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// Storage configuration
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});


// Only allow video files
const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only video files are allowed"), false);
    }

};


// Multer configuration
const uploadVideo = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 500 * 1024 * 1024
    }

});


module.exports = uploadVideo;