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
            description,
            video_source,
            youtube_url,
            status
        } = req.body;


        // ==========================================
        // Basic validation
        // ==========================================

        if (!title || !category_id || !video_source) {

            return res.status(400).send(
                "Title, category and video source are required."
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
                    description,
                    youtube_url,
                    video_url,
                    video_type,
                    category_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    title,
                    description || null,
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


            // Upload video to Cloudinary
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
            // Save Cloudinary URL to database
            // ==========================================

            const sql = `
                INSERT INTO videos
                (
                    title,
                    description,
                    youtube_url,
                    video_url,
                    video_type,
                    category_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    title,
                    description || null,
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