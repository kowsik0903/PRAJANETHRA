const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");
const uploadVideo = require("../middleware/videoUpload");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const videoController = require("../controllers/videoController");
  

router.get("/login", adminController.loginPage);
router.post("/login", adminController.login);

router.get("/dashboard", auth.isAdmin, adminController.dashboard);

router.get("/news", auth.isAdmin, adminController.manageNews);

router.get("/news/add", auth.isAdmin, adminController.addNewsPage);

router.post(
    "/news/add",
    auth.isAdmin,
    upload.single("image"),
    adminController.saveNews
);

router.get("/news/edit/:id", auth.isAdmin, adminController.editNewsPage);

router.post(
    "/news/edit/:id",
    auth.isAdmin,
    upload.single("image"),
    adminController.updateNews
);

router.get("/news/delete/:id", auth.isAdmin, adminController.deleteNews);

router.get("/logout", auth.isAdmin, adminController.logout);

router.get("/messages", auth.isAdmin, adminController.messagesPage);

router.get("/messages/delete/:id", auth.isAdmin, adminController.deleteMessage);

router.get("/gallery", auth.isAdmin, adminController.galleryPage);

router.get("/gallery/add", auth.isAdmin, adminController.addGalleryPage);

router.post(
    "/gallery/add",
    auth.isAdmin,
    upload.single("image"),
    adminController.saveGallery
);

router.get(
    "/gallery/delete/:id",
    auth.isAdmin,
    adminController.deleteGallery
);

router.get("/categories", auth.isAdmin, adminController.manageCategories);

router.get("/categories/add", auth.isAdmin, adminController.addCategoryPage);

router.post("/categories/add", auth.isAdmin, adminController.saveCategory);

router.get("/categories/edit/:id", auth.isAdmin, adminController.editCategoryPage);

router.post("/categories/edit/:id", auth.isAdmin, adminController.updateCategory);

router.get("/categories/delete/:id", auth.isAdmin, adminController.deleteCategory);
// ================= VIDEO ROUTES =================

router.get(
    "/videos",
    auth.isAdmin,
    adminController.manageVideos
);

router.get(
    "/videos/add",
    auth.isAdmin,
    videoController.addVideoPage
);

router.post(
    "/videos/add",
    auth.isAdmin,
    uploadVideo.single("video"),
    videoController.addVideo
);

router.get(
    "/videos/edit/:id",
    auth.isAdmin,
    adminController.editVideoPage
);

router.post(
    "/videos/edit/:id",
    auth.isAdmin,
    uploadVideo.single("video"),
    adminController.updateVideo
);

router.get(
    "/videos/delete/:id",
    auth.isAdmin,
    adminController.deleteVideo
);

module.exports = router;

