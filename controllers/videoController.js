const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ==========================================
// Add Video Page
// ==========================================

exports.addVideoPage = (req, res) => {

    db.query(
        "SELECT * FROM categories ORDER BY category_name ASC",
        (err, categories) => {

            if (err) {
                console.error("Category fetch error:", err);
                return res.status(500).send("Database error");
            }

            res.render("admin/add-video", {
                categories
            });

        }
    );

};


// ==========================================
// Add Video
// ==========================================

exports.addVideo = async (req, res) => {

    try {

        const {
            title,
            category_id,
            short_description,
            content,
            video_source,
            youtube_url,
            status
        } = req.body;


        // ==========================================
        // Basic validation
        // ==========================================

        if (
            !title ||
            !category_id ||
            !short_description ||
            !content ||
            !video_source
        ) {

            return res.status(400).send(
                "Title, category, short description, full content and video source are required."
            );

        }


        // ==========================================
        // OPTION 1: YouTube Video
        // ==========================================

        if (video_source === "youtube") {

            if (!youtube_url) {

                return res.status(400).send(
                    "YouTube URL is required."
                );

            }


            const sql = `
                INSERT INTO videos
                (
                    title,
                    short_description,
                    content,
                    youtube_url,
                    video_url,
                    video_type,
                    category_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    title,
                    short_description,
                    content,
                    youtube_url,
                    null,
                    "youtube",
                    category_id,
                    status || "published"
                ],
                (err) => {

                    if (err) {

                        console.error(
                            "YouTube video insert error:",
                            err
                        );

                        return res.status(500).send(
                            "Failed to save YouTube video."
                        );

                    }


                    console.log(
                        "✅ YouTube video added successfully"
                    );

                    return res.redirect("/admin/dashboard");

                }
            );


            return;
        }


        // ==========================================
        // OPTION 2: Uploaded Video
        // ==========================================

        if (video_source === "upload") {

            if (!req.file) {

                return res.status(400).send(
                    "Please select a video file."
                );

            }


            console.log(
                "📹 Video received:",
                req.file.originalname
            );


            console.log(
                "☁️ Uploading video to Cloudinary..."
            );


            // ==========================================
            // Upload video to Cloudinary
            // ==========================================

            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    resource_type: "video",
                    folder: "prajanethra/videos"
                }
            );


            console.log(
                "✅ Video uploaded to Cloudinary:"
            );

            console.log(result.secure_url);


            // ==========================================
            // Delete temporary local video
            // ==========================================

            if (fs.existsSync(req.file.path)) {

                fs.unlinkSync(req.file.path);

                console.log(
                    "🗑️ Temporary video deleted"
                );

            }


            // ==========================================
            // Save Cloudinary URL + content to database
            // ==========================================

            const sql = `
                INSERT INTO videos
                (
                    title,
                    short_description,
                    content,
                    youtube_url,
                    video_url,
                    video_type,
                    category_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    title,
                    short_description,
                    content,
                    null,
                    result.secure_url,
                    "upload",
                    category_id,
                    status || "published"
                ],
                (err) => {

                    if (err) {

                        console.error(
                            "Uploaded video database error:",
                            err
                        );

                        return res.status(500).send(
                            "Video uploaded but database save failed."
                        );

                    }


                    console.log(
                        "✅ Uploaded video saved successfully"
                    );


                    return res.redirect("/admin/dashboard");

                }
            );


            return;
        }


        // ==========================================
        // Invalid video source
        // ==========================================

        return res.status(400).send(
            "Invalid video source."
        );


    } catch (error) {

        console.error(
            "❌ Video upload error:",
            error
        );


        // Delete temporary file if something fails
        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {

            fs.unlinkSync(req.file.path);

            console.log(
                "🗑️ Temporary video deleted after error"
            );

        }


        return res.status(500).send(
            "Video upload failed."
        );

    }

};

// ==========================================
// Video Details
// ==========================================

exports.videoDetails = (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            videos.*,
            categories.category_name
        FROM videos
        LEFT JOIN categories
        ON videos.category_id = categories.id
        WHERE videos.id = ?
        AND videos.status = 'published'
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.error("Error fetching video:", err);

            return res.status(500).send(
                "Unable to load video"
            );
        }

        if (result.length === 0) {

            return res.status(404).send(
                "Video Not Found"
            );
        }

        const video = result[0];


        // Fetch categories for navbar

        db.query(
            "SELECT * FROM categories ORDER BY category_name",
            (err, categories) => {

                if (err) {

                    console.error(
                        "Category fetch error:",
                        err
                    );

                    return res.status(500).send(
                        "Database Error"
                    );
                }


                res.render("user/video-details", {

                    video,

                    categories,

                    item: video

                });

            }
        );

    });

};

// ==========================================
// Edit Video Page
// ==========================================

exports.editVideoPage = (req, res) => {

    const id = req.params.id;

    const videoSql = `
        SELECT *
        FROM videos
        WHERE id = ?
    `;

    db.query(videoSql, [id], (err, videoResult) => {

        if (err) {

            console.error("Error fetching video for edit:", err);

            return res.status(500).send(
                "Unable to load video"
            );

        }

        if (videoResult.length === 0) {

            return res.status(404).send(
                "Video Not Found"
            );

        }

        const video = videoResult[0];


        // Fetch categories

        db.query(
            "SELECT * FROM categories ORDER BY category_name ASC",
            (err, categories) => {

                if (err) {

                    console.error(
                        "Error fetching categories:",
                        err
                    );

                    return res.status(500).send(
                        "Unable to load categories"
                    );

                }


                res.render("admin/edit-video", {

                    video,

                    categories

                });

            }
        );

    });

};



// ==========================================
// Update Video
// ==========================================

exports.updateVideo = async (req, res) => {

    console.log("=================================");
    console.log("UPDATE VIDEO CALLED");
    console.log("VIDEO ID:", req.params.id);
    console.log("REQ.BODY:", req.body);
    console.log("=================================");

    const id = req.params.id;

    try {

        const {
            title,
            category_id,
            short_description,
            content,
            video_source,
            youtube_url,
            status
        } = req.body;


        console.log("TITLE:", title);
        console.log("SHORT DESCRIPTION:", short_description);
        console.log("FULL CONTENT:", content);
        console.log("CATEGORY:", category_id);
        console.log("VIDEO SOURCE:", video_source);


        if (
            !title ||
            !category_id ||
            !short_description ||
            !content ||
            !video_source
        ) {

            return res.status(400).send(
                "Required fields are missing."
            );

        }


        // ==========================================
        // YouTube
        // ==========================================

        if (video_source === "youtube") {

            if (!youtube_url) {

                return res.status(400).send(
                    "YouTube URL is required."
                );

            }


            const sql = `
                UPDATE videos
                SET
                    title = ?,
                    short_description = ?,
                    content = ?,
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
                    short_description,
                    content,
                    youtube_url,
                    category_id,
                    status || "published",
                    id
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "❌ UPDATE ERROR:",
                            err
                        );

                        return res.status(500).send(
                            "Database update failed."
                        );

                    }


                    console.log(
                        "✅ UPDATE SUCCESS:",
                        result
                    );


                    return res.redirect(
                        "/admin/videos"
                    );

                }
            );

            return;
        }


        // ==========================================
        // Uploaded Video
        // ==========================================

        if (video_source === "upload") {

            // First get existing video

            db.query(
                "SELECT * FROM videos WHERE id = ?",
                [id],
                async (err, result) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).send(
                            "Database error."
                        );

                    }


                    if (result.length === 0) {

                        return res.status(404).send(
                            "Video not found."
                        );

                    }


                    const oldVideo = result[0];

                    let videoUrl = oldVideo.video_url;


                    // If new video uploaded

                    if (req.file) {

                        console.log(
                            "📹 New video:",
                            req.file.originalname
                        );


                        const cloudResult =
                            await cloudinary.uploader.upload(
                                req.file.path,
                                {
                                    resource_type: "video",
                                    folder: "prajanethra/videos"
                                }
                            );


                        videoUrl =
                            cloudResult.secure_url;


                        if (
                            fs.existsSync(req.file.path)
                        ) {

                            fs.unlinkSync(req.file.path);

                        }

                    }


                    const sql = `
                        UPDATE videos
                        SET
                            title = ?,
                            short_description = ?,
                            content = ?,
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
                            short_description,
                            content,
                            videoUrl,
                            category_id,
                            status || "published",
                            id
                        ],
                        (err, updateResult) => {

                            if (err) {

                                console.error(
                                    "❌ UPDATE ERROR:",
                                    err
                                );

                                return res.status(500).send(
                                    "Database update failed."
                                );

                            }


                            console.log(
                                "✅ VIDEO UPDATED"
                            );

                            console.log(
                                "Rows changed:",
                                updateResult.affectedRows
                            );


                            return res.redirect(
                                "/admin/videos"
                            );

                        }
                    );

                }
            );

            return;
        }


        return res.status(400).send(
            "Invalid video source."
        );


    } catch (error) {

        console.error(
            "❌ UPDATE VIDEO ERROR:",
            error
        );


        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {

            fs.unlinkSync(req.file.path);

        }


        return res.status(500).send(
            "Video update failed."
        );

    }

};