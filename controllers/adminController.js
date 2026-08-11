
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");
const fs = require("fs");

exports.loginPage = (req, res) => {
    res.render("admin/login");
};

exports.dashboard = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const dashboardData = {};

    db.query(
        "SELECT COUNT(*) AS totalNews FROM news",
        (err, newsResult) => {

            if (err) return res.send(err);

            dashboardData.totalNews = newsResult[0].totalNews;

            db.query(
                "SELECT COUNT(*) AS totalCategories FROM categories",
                (err, catResult) => {

                    if (err) return res.send(err);

                    dashboardData.totalCategories =
                        catResult[0].totalCategories;

                    db.query(
                        "SELECT COUNT(*) AS breakingNews FROM news WHERE is_breaking = 1",
                        (err, breakResult) => {

                            if (err) return res.send(err);

                            dashboardData.breakingNews =
                                breakResult[0].breakingNews;

                            db.query(
                                "SELECT COUNT(*) AS totalMessages FROM contacts",
                                (err, msgResult) => {

                                    if (err) return res.send(err);

                                    dashboardData.totalMessages =
                                        msgResult[0].totalMessages;

                                    // Total Videos
                                    db.query(
                                        "SELECT COUNT(*) AS totalVideos FROM videos",
                                        (err, videoResult) => {

                                            if (err) return res.send(err);

                                            dashboardData.totalVideos =
                                                videoResult[0].totalVideos;

                                            res.render("admin/dashboard", {
                                                admin: req.session.admin,
                                                dashboardData
                                            });

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};

exports.addNewsPage = (req, res) => {

    const sql = "SELECT * FROM categories ORDER BY category_name ASC";

    db.query(sql, (err, categories) => {

        if (err) {
            return res.send(err);
        }

        res.render("admin/add-news", {
            categories
        });

    });

};

exports.saveNews = async (req, res) => {

    console.log("========== FILE ==========");
    console.log(req.file);
    console.log("==========================");

    try {

        const {
            title,
            description,
            content,
            category_id
        } = req.body;

        const is_breaking = req.body.is_breaking ? 1 : 0;

        let image = null;

        if (req.file) {

            const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "nc-news-portal"
});

console.log("========== CLOUDINARY ==========");
console.log(result);
console.log("================================");

image = result.secure_url;

console.log("Image URL:", image);

// Delete the local file after successful Cloudinary upload
fs.unlink(req.file.path, (err) => {
    if (err) {
        console.log("❌ Error deleting local file:", err);
    } else {
        console.log("✅ Local file deleted successfully.");
    }
});
        }

        console.log("========== INSERT DATA ==========");
        console.log({
            title,
            description,
            content,
            category_id,
            image,
            is_breaking
        });
        console.log("=================================");

        const sql = `
            INSERT INTO news
            (title, description, content, category_id, image, is_breaking)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                title,
                description,
                content,
                category_id,
                image,
                is_breaking
            ],
            (err) => {

                if (err) {
                    console.log("========== MYSQL ERROR ==========");
                    console.error(err);
                    console.log("=================================");
                    return res.send(err);
                }

                console.log("✅ News inserted successfully");

                req.flash("success", "News added successfully.");
                res.redirect("/admin/news");
            }
        );

    } catch (err) {

        console.log("========== CATCH ERROR ==========");
        console.error(err);
        console.log("=================================");

        res.send(err.message);
    }
};
exports.manageNews = (req, res) => {

    const sql = `
        SELECT news.*, categories.category_name
        FROM news
        LEFT JOIN categories
        ON news.category_id = categories.id
        ORDER BY news.created_at DESC
    `;

    db.query(sql, (err, news) => {

        if (err) {
            return res.send(err);
        }

        res.render("admin/manage-news", {
            news
        });

    });

};


exports.deleteNews = (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM news WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                return res.send(err);
            }

            req.flash("success", "News deleted successfully.");
res.redirect("/admin/news");

        }
    );

};

exports.editNewsPage = (req, res) => {

    const id = req.params.id;

    db.query("SELECT * FROM news WHERE id = ?", [id], (err, news) => {

        if (err) return res.send(err);

        db.query("SELECT * FROM categories", (err, categories) => {

            if (err) return res.send(err);

            res.render("admin/edit-news", {
                item: news[0],
                categories
            });

        });

    });

};

exports.updateNews = async (req, res) => {
    try {
        const id = req.params.id;

        const {
            title,
            description,
            content,
            category_id
        } = req.body;

        const is_breaking = req.body.is_breaking ? 1 : 0;

        let sql;
        let values;
if (req.file) {

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "nc-news-portal"
    });

    // Delete local image after successful upload
    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.log("Error deleting local file:", err);
        } else {
            console.log("Local file deleted successfully.");
        }
    });

    sql = `
        UPDATE news
        SET title=?,
            description=?,
            content=?,
            category_id=?,
            is_breaking=?,
            image=?
        WHERE id=?
    `;

    values = [
        title,
        description,
        content,
        category_id,
        is_breaking,
        result.secure_url,
        id
    ];

}else {

            sql = `
                UPDATE news
                SET title=?,
                    description=?,
                    content=?,
                    category_id=?,
                    is_breaking=?
                WHERE id=?
            `;

            values = [
                title,
                description,
                content,
                category_id,
                is_breaking,
                id
            ];
        }

        db.query(sql, values, (err) => {

            if (err) {
                return res.send(err);
            }

            req.flash("success", "News updated successfully.");
            res.redirect("/admin/news");

        });

    } catch (err) {
        console.error(err);
        res.send(err.message);
    }
};
exports.login = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], (err, result) => {

        if (err) {
            return res.send(err);
        }

        if (result.length === 0) {
            return res.send("Invalid Email");
        }

        const admin = result[0];

        if (admin.password !== password) {
            return res.send("Invalid Password");
        }

        req.session.admin = admin;

req.session.save((err) => {

    if (err) {
        return res.send(err);
    }

    res.redirect("/admin/dashboard");

});
    });

};

exports.logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send(err);
        }

        res.clearCookie("connect.sid");

        res.redirect("/");

    });

};
exports.messagesPage = (req, res) => {

    const sql = "SELECT * FROM contacts ORDER BY created_at DESC";

    db.query(sql, (err, messages) => {

        if (err) {
            return res.send(err);
        }

        res.render("admin/messages", {
            admin: req.session.admin,
            messages
        });

    });

};

exports.deleteMessage = (req, res) => {

    const sql = "DELETE FROM contacts WHERE id = ?";

    db.query(sql, [req.params.id], (err) => {

        if (err) {
            return res.send(err);
        }

        res.redirect("/admin/messages");

    });

};
exports.galleryPage = (req, res) => {
    res.send("Gallery Page");
};

exports.addGalleryPage = (req, res) => {
    res.send("Add Gallery Page");
};

exports.saveGallery = (req, res) => {
    res.send("Gallery Saved");
};

exports.deleteGallery = (req, res) => {
    res.send("Gallery Deleted");
};

// Manage Categories
exports.manageCategories = (req, res) => {

    db.query(
        "SELECT * FROM categories ORDER BY category_name ASC",
        (err, categories) => {

            if (err) {
                return res.send(err);
            }

            res.render("admin/manage-categories", {
                categories
            });

        }
    );

};

// Add Category Page
exports.addCategoryPage = (req, res) => {
    res.render("admin/add-category");
};

// Save Category
exports.saveCategory = (req, res) => {

    const { category_name } = req.body;

    db.query(
        "INSERT INTO categories (category_name) VALUES (?)",
        [category_name],
        (err) => {

            if (err) {
                return res.send(err);
            }

            req.flash("success", "Category added successfully.");
res.redirect("/admin/categories");

        }
    );

};

// Edit Category Page
exports.editCategoryPage = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM categories WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.send(err);
            }

            res.render("admin/edit-category", {
                category: result[0]
            });

        }
    );

};

// Update Category
exports.updateCategory = (req, res) => {

    const id = req.params.id;
    const { category_name } = req.body;

    db.query(
        "UPDATE categories SET category_name = ? WHERE id = ?",
        [category_name, id],
        (err) => {

            if (err) {
                return res.send(err);
            }

            req.flash("success", "Category updated successfully.");
res.redirect("/admin/categories");

        }
    );

};

// Delete Category
exports.deleteCategory = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT COUNT(*) AS total FROM news WHERE category_id = ?",
        [id],
        (err, result) => {

            if (err) return res.send(err);

            if (result[0].total > 0) {

    req.flash("error", "Cannot delete category because it contains news.");

    return res.redirect("/admin/categories");
}

            db.query(
                "DELETE FROM categories WHERE id = ?",
                [id],
                (err) => {

                    if (err) return res.send(err);

                   req.flash("success", "Category deleted successfully.");
res.redirect("/admin/categories");

                }
            );

        }
    );

};

// ================= VIDEO MANAGEMENT =================

// Add Video Page
exports.addVideoPage = (req, res) => {

    db.query(
        "SELECT * FROM categories ORDER BY category_name ASC",
        (err, categories) => {

            if (err) {
                return res.send(err);
            }

            res.render("admin/add-video", {
                categories
            });

        }
    );

};


// Save Video
exports.saveVideo = (req, res) => {

    const {
        title,
        description,
        youtube_url,
        category_id,
        status
    } = req.body;


    const sql = `
        INSERT INTO videos
        (title, description, youtube_url, category_id, status)
        VALUES (?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            title,
            description,
            youtube_url,
            category_id,
            status
        ],
        (err) => {

            if (err) {
                return res.send(err);
            }

            req.flash("success", "Video added successfully.");

            res.redirect("/admin/videos");

        }
    );

};

// Manage Videos
exports.manageVideos = (req, res) => {

    const sql = `
        SELECT videos.*, categories.category_name
        FROM videos
        LEFT JOIN categories
        ON videos.category_id = categories.id
        ORDER BY videos.created_at DESC
    `;

    db.query(sql, (err, videos) => {

        if (err) {
            return res.send(err);
        }

        res.render("admin/manage-videos", {
            videos
        });

    });

};

exports.editVideoPage = (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT *
        FROM videos
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Database Error");
        }

        if (results.length === 0) {
            return res.status(404).send("Video Not Found");
        }

        db.query(
            "SELECT * FROM categories ORDER BY category_name",
            (err, categories) => {

                if (err) {
                    console.error(err);
                    return res.status(500).send("Database Error");
                }

                res.render("admin/edit-video", {
                    video: results[0],
                    categories
                });

            }
        );

    });
};

exports.updateVideo = async (req, res) => {

    const id = req.params.id;

    const {
        title,
        description,
        category_id,
        status,
        video_source,
        youtube_url
    } = req.body;


    try {

        // Get existing video
        db.query(
            `
            SELECT *
            FROM videos
            WHERE id = ?
            `,
            [id],
            async (err, results) => {

                if (err) {
                    console.error("Error finding video:", err);
                    return res.status(500).send("Database Error");
                }


                if (results.length === 0) {
                    return res.status(404).send("Video Not Found");
                }


                const oldVideo = results[0];


                // ==========================================
                // YOUTUBE VIDEO
                // ==========================================

                if (video_source === "youtube") {

                    // If old video was uploaded,
                    // delete it from Cloudinary first.

                    if (
                        oldVideo.video_type === "upload" &&
                        oldVideo.video_url
                    ) {

                        try {

                            const url = oldVideo.video_url;

                            const uploadIndex =
                                url.indexOf("/upload/");


                            if (uploadIndex !== -1) {

                                let publicId =
                                    url.substring(
                                        uploadIndex +
                                        "/upload/".length
                                    );


                                publicId =
                                    publicId.replace(
                                        /^v\d+\//,
                                        ""
                                    );


                                publicId =
                                    publicId.replace(
                                        /\.[^/.]+$/,
                                        ""
                                    );


                                console.log(
                                    "☁️ Deleting old Cloudinary video:",
                                    publicId
                                );


                                await cloudinary.uploader.destroy(
                                    publicId,
                                    {
                                        resource_type: "video"
                                    }
                                );


                                console.log(
                                    "✅ Old Cloudinary video deleted"
                                );

                            }

                        } catch (cloudinaryError) {

                            console.error(
                                "Cloudinary delete error:",
                                cloudinaryError
                            );

                            return res.status(500).send(
                                "Failed to delete old video from Cloudinary"
                            );

                        }

                    }


                    // Update as YouTube

                    const sql = `
                        UPDATE videos
                        SET
                            title = ?,
                            description = ?,
                            youtube_url = ?,
                            video_url = NULL,
                            video_type = 'youtube',
                            category_id = ?,
                            status = ?
                        WHERE id = ?
                    `;


                    db.query(
                        sql,
                        [
                            title,
                            description,
                            youtube_url,
                            category_id || null,
                            status,
                            id
                        ],
                        (updateErr) => {

                            if (updateErr) {

                                console.error(
                                    "Error updating video:",
                                    updateErr
                                );

                                return res.status(500).send(
                                    "Database Error"
                                );

                            }


                            res.redirect("/admin/videos");

                        }
                    );

                    return;
                }


                // ==========================================
                // UPLOADED VIDEO
                // ==========================================

                if (video_source === "upload") {

                    let videoUrl = oldVideo.video_url;


                    // If a new file was selected
                    if (req.file) {

                        console.log(
                            "📹 New video received:",
                            req.file.originalname
                        );


                        try {

                            // Upload new video to Cloudinary

                            const result =
                                await cloudinary.uploader.upload(
                                    req.file.path,
                                    {
                                        resource_type: "video",
                                        folder: "prajanethra/videos"
                                    }
                                );


                            videoUrl = result.secure_url;


                            console.log(
                                "☁️ New video uploaded:",
                                videoUrl
                            );


                            // Delete old Cloudinary video

                            if (
                                oldVideo.video_type === "upload" &&
                                oldVideo.video_url
                            ) {

                                try {

                                    const oldUrl =
                                        oldVideo.video_url;

                                    const uploadIndex =
                                        oldUrl.indexOf("/upload/");


                                    if (uploadIndex !== -1) {

                                        let publicId =
                                            oldUrl.substring(
                                                uploadIndex +
                                                "/upload/".length
                                            );


                                        publicId =
                                            publicId.replace(
                                                /^v\d+\//,
                                                ""
                                            );


                                        publicId =
                                            publicId.replace(
                                                /\.[^/.]+$/,
                                                ""
                                            );


                                        await cloudinary.uploader.destroy(
                                            publicId,
                                            {
                                                resource_type: "video"
                                            }
                                        );


                                        console.log(
                                            "🗑️ Old Cloudinary video deleted"
                                        );

                                    }

                                } catch (deleteError) {

                                    console.error(
                                        "Old Cloudinary delete error:",
                                        deleteError
                                    );

                                }

                            }

                        } catch (uploadError) {

                            console.error(
                                "Cloudinary upload error:",
                                uploadError
                            );

                            return res.status(500).send(
                                "Failed to upload video"
                            );

                        }

                    }


                    // Make sure an uploaded video exists

                    if (!videoUrl) {

                        return res.status(400).send(
                            "Please select a video file."
                        );

                    }


                    // Update database

                    const sql = `
                        UPDATE videos
                        SET
                            title = ?,
                            description = ?,
                            youtube_url = NULL,
                            video_url = ?,
                            video_type = 'upload',
                            category_id = ?,
                            status = ?
                        WHERE id = ?
                    `;


                    db.query(
                        sql,
                        [
                            title,
                            description,
                            videoUrl,
                            category_id || null,
                            status,
                            id
                        ],
                        (updateErr) => {

                            if (updateErr) {

                                console.error(
                                    "Error updating video:",
                                    updateErr
                                );

                                return res.status(500).send(
                                    "Database Error"
                                );

                            }


                            res.redirect("/admin/videos");

                        }
                    );

                }

            }
        );

    } catch (error) {

        console.error(
            "Update video error:",
            error
        );

        res.status(500).send(
            "Failed to update video"
        );

    }

};

exports.deleteVideo = async (req, res) => {

    const id = req.params.id;

    try {

        // Get video information first
        db.query(
            `
            SELECT video_url, video_type
            FROM videos
            WHERE id = ?
            `,
            [id],
            async (err, results) => {

                if (err) {
                    console.error("Error finding video:", err);
                    return res.status(500).send("Database Error");
                }

                if (results.length === 0) {
                    return res.status(404).send("Video not found");
                }

                const video = results[0];


                // ==========================================
                // Delete uploaded video from Cloudinary
                // ==========================================

                if (video.video_type === "upload" && video.video_url) {

                    try {

                        const url = video.video_url;

                        const uploadIndex = url.indexOf("/upload/");

                        if (uploadIndex !== -1) {

                            let publicId = url.substring(
                                uploadIndex + "/upload/".length
                            );

                            // Remove version
                            publicId = publicId.replace(
                                /^v\d+\//,
                                ""
                            );

                            // Remove extension
                            publicId = publicId.replace(
                                /\.[^/.]+$/,
                                ""
                            );

                            console.log(
                                "☁️ Deleting Cloudinary video:",
                                publicId
                            );

                            await cloudinary.uploader.destroy(
                                publicId,
                                {
                                    resource_type: "video"
                                }
                            );

                            console.log(
                                "✅ Cloudinary video deleted"
                            );
                        }

                    } catch (cloudinaryError) {

                        console.error(
                            "Cloudinary delete error:",
                            cloudinaryError
                        );

                        return res.status(500).send(
                            "Failed to delete video from Cloudinary"
                        );
                    }
                }


                // ==========================================
                // Delete database record
                // ==========================================

                db.query(
                    `
                    DELETE FROM videos
                    WHERE id = ?
                    `,
                    [id],
                    (deleteErr) => {

                        if (deleteErr) {

                            console.error(
                                "Error deleting video:",
                                deleteErr
                            );

                            return res.status(500).send(
                                "Database Error"
                            );
                        }

                        console.log(
                            "✅ Video deleted from database"
                        );

                        res.redirect("/admin/videos");

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Error deleting video:",
            error
        );

        res.status(500).send(
            "Failed to delete video"
        );

    }

};