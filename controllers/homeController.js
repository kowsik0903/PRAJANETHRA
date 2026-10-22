const db = require("../config/db");

exports.home = (req, res) => {

    // Independent pagination for news and videos
    const newsPage = Math.max(1, parseInt(req.query.newsPage, 10) || 1);
    const videoPage = Math.max(1, parseInt(req.query.videoPage, 10) || 1);

    const newsLimit = 6;
    const videoLimit = 3;

    const newsOffset = (newsPage - 1) * newsLimit;
    const videoOffset = (videoPage - 1) * videoLimit;

    // Count published news articles
    const countNewsSql = `
        SELECT COUNT(*) AS total
        FROM news
        WHERE status = 'Published'
    `;

    db.query(countNewsSql, (err, newsCountResult) => {
        if (err) return res.status(500).send(err);

        const totalNews = newsCountResult[0].total;
        const newsTotalPages = Math.ceil(totalNews / newsLimit);

        // Fetch current page of news articles
        const newsSql = `
            SELECT news.*, categories.category_name
            FROM news
            LEFT JOIN categories
                ON news.category_id = categories.id
            WHERE news.status = 'Published'
            ORDER BY news.created_at DESC
            LIMIT ? OFFSET ?
        `;

        db.query(newsSql, [newsLimit, newsOffset], (err, news) => {
            if (err) return res.status(500).send(err);

            // Fetch breaking news
            const breakingSql = `
                SELECT *
                FROM news
                WHERE is_breaking = 1
                ORDER BY created_at DESC
                LIMIT 10
            `;

            db.query(breakingSql, (err, breakingNews) => {
                if (err) return res.status(500).send(err);

                // Fetch categories
                const categorySql = `
                    SELECT *
                    FROM categories
                    ORDER BY category_name
                `;

                db.query(categorySql, (err, categories) => {
                    if (err) return res.status(500).send(err);

                    // Count published videos
                    const countVideosSql = `
                        SELECT COUNT(*) AS total
                        FROM videos
                        WHERE status = 'published'
                    `;

                    db.query(countVideosSql, (err, videoCountResult) => {
                        if (err) return res.status(500).send(err);

                        const totalVideos = videoCountResult[0].total;
                        const videoTotalPages =
                            Math.ceil(totalVideos / videoLimit);

                        // Fetch current page of videos
                        const videoSql = `
                            SELECT videos.*, categories.category_name
                            FROM videos
                            LEFT JOIN categories
                                ON videos.category_id = categories.id
                            WHERE videos.status = 'published'
                            ORDER BY videos.created_at DESC
                            LIMIT ? OFFSET ?
                        `;

                        db.query(
                            videoSql,
                            [videoLimit, videoOffset],
                            (err, videos) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500)
                                        .send("Unable to load videos");
                                }

                                res.render("user/index", {
                                    news,
                                    videos,
                                    breakingNews,
                                    categories,

                                    newsCurrentPage: newsPage,
                                    newsTotalPages,

                                    videoCurrentPage: videoPage,
                                    videoTotalPages
                                });
                            }
                        );
                    });
                });
            });
        });
    });
};


exports.newsDetails = (req, res) => {

    const id = req.params.id;

    // Increase article view count
    db.query(
        "UPDATE news SET views = views + 1 WHERE id = ?",
        [id],
        (err) => {

            if (err) return res.send(err);

            // Fetch current news article
            const sql = `
                SELECT news.*, categories.category_name
                FROM news
                LEFT JOIN categories
                ON news.category_id = categories.id
                WHERE news.id = ?
            `;

            db.query(sql, [id], (err, result) => {

                if (err) return res.send(err);

                if (result.length === 0) {
                    return res.send("News Not Found");
                }

                const item = result[0];

                                    // Fetch related published news from the same date
                                    const relatedSql = `

                                            SELECT
                                                n.id,
                                                n.title,
                                                n.description,
                                                n.image,
                                                n.created_at,
                                                c.category_name
                                            FROM news n
                                            LEFT JOIN categories c
                                                ON n.category_id = c.id
                                            WHERE DATE(n.created_at) = DATE(?)
                                              AND n.id != ?
                                              AND n.status = 'published'
                                              AND NOT EXISTS (
                                                  SELECT 1
                                                  FROM news duplicate
                                                  WHERE duplicate.title = n.title
                                                    AND duplicate.id < n.id
                                                    AND duplicate.status = 'published'
                                              )
                                            ORDER BY n.created_at DESC, n.id DESC
                                            LIMIT 6

                `;

                db.query(
                    relatedSql,
                    [item.created_at, item.id],
                    (err, relatedNews) => {

                        if (err) return res.send(err);

                        // Fetch categories for the navbar
                        db.query(
                            "SELECT * FROM categories",
                            (err, categories) => {

                                if (err) return res.send(err);

                                res.render("user/news-details", {
                                    item,
                                    categories,
                                    relatedNews
                                });

                            }
                        );

                    }
                );

            });

        }
    );

};


exports.categoryNews = (req, res) => {

    const categoryId = req.params.id;

    const sql = `
        SELECT news.*, categories.category_name
        FROM news
        LEFT JOIN categories
        ON news.category_id = categories.id
        WHERE news.category_id = ?
        ORDER BY news.created_at DESC
    `;

    db.query(sql, [categoryId], (err, news) => {

        if (err) return res.send(err);

        db.query("SELECT * FROM categories", (err, categories) => {

            if (err) return res.send(err);

            let categoryName = "";

            if (news.length > 0) {
                categoryName = news[0].category_name;
            }

            res.render("user/category-news", {
                news,
                categories,
                categoryName
            });

        });

    });

};

exports.searchNews = (req, res) => {

    const keyword = req.query.keyword;

    const sql = `
        SELECT news.*, categories.category_name
        FROM news
        LEFT JOIN categories
        ON news.category_id = categories.id
        WHERE news.title LIKE ?
        ORDER BY news.created_at DESC
    `;

    db.query(sql, [`%${keyword}%`], (err, news) => {

        if (err) return res.send(err);

        db.query("SELECT * FROM categories", (err, categories) => {

            if (err) return res.send(err);

            res.render("user/search", {
                news,
                categories,
                keyword
            });

        });

    });

};

exports.aboutPage = (req, res) => {

    db.query(
        "SELECT * FROM categories ORDER BY category_name",
        (err, categories) => {

            if (err) return res.send(err);

            res.render("user/about", {
                categories
            });

        }
    );

};

// Videos Page
exports.videosPage = (req, res) => {

    const videoSql = `
        SELECT videos.*, categories.category_name
        FROM videos
        LEFT JOIN categories
        ON videos.category_id = categories.id
        WHERE videos.status = 'published'
        ORDER BY videos.created_at DESC
    `;

    db.query(videoSql, (err, videos) => {

        if (err) {
            console.error("Error fetching videos:", err);
            return res.status(500).send("Unable to load videos");
        }

        // Fetch categories for navbar
        const categorySql = `
            SELECT *
            FROM categories
            ORDER BY category_name ASC
        `;

        db.query(categorySql, (err, categories) => {

            if (err) {
                console.error("Error fetching categories:", err);
                return res.status(500).send("Unable to load categories");
            }

            res.render("user/videos", {
                videos,
                categories
            });

        });

    });

};

exports.videoDetails = (req, res) => {

    const id = req.params.id;

    // Increase video view count
    db.query(
        "UPDATE videos SET views = views + 1 WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                console.error("Error updating video views:", err);
                return res.status(500).send("Unable to update video views");
            }

            const sql = `
                SELECT videos.*, categories.category_name
                FROM videos
                LEFT JOIN categories
                ON videos.category_id = categories.id
                WHERE videos.id = ?
                AND videos.status = 'published'
            `;

            db.query(sql, [id], (err, result) => {

                if (err) {
                    console.error("Error fetching video:", err);
                    return res.status(500).send("Unable to load video");
                }

                if (result.length === 0) {
                    return res.status(404).send("Video Not Found");
                }

                const video = result[0];

                db.query(
                    "SELECT * FROM categories ORDER BY category_name",
                    (err, categories) => {

                        if (err) {
                            console.error(err);
                            return res.status(500).send("Database Error");
                        }

                        res.render("user/video-details", {
                            video,
                            categories,
                            item: video
                        });

                    }
                );

            });

        }
    );

};