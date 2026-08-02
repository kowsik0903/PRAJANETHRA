const db = require("../config/db");

exports.home = (req, res) => {

    const page = parseInt(req.query.page) || 1;

    const limit = 6;

    const offset = (page - 1) * limit;

    // Total News Count
    const countSql = `
        SELECT COUNT(*) AS total
        FROM news
        WHERE status='Published'
    `;

    db.query(countSql, (err, countResult) => {

        if (err) return res.send(err);

        const totalNews = countResult[0].total;

        const totalPages = Math.ceil(totalNews / limit);

        // Get News with Pagination
        const newsSql = `
            SELECT news.*, categories.category_name
            FROM news
            LEFT JOIN categories
            ON news.category_id = categories.id
            WHERE news.status='Published'
            ORDER BY news.created_at DESC
            LIMIT ? OFFSET ?
        `;

        db.query(newsSql, [limit, offset], (err, news) => {

            if (err) return res.send(err);

            // Breaking News
            const breakingSql = `
                SELECT *
                FROM news
                WHERE is_breaking=1
                ORDER BY created_at DESC
                LIMIT 10
            `;

            db.query(breakingSql, (err, breakingNews) => {

                if (err) return res.send(err);

                // Categories
                const categorySql = `
                    SELECT *
                    FROM categories
                    ORDER BY category_name
                `;

                db.query(categorySql, (err, categories) => {

                    if (err) return res.send(err);

                    res.render("user/index", {

                        news,
                        breakingNews,
                        categories,

                        currentPage: page,
                        totalPages

                    });

                });

            });

        });

    });

};

exports.newsDetails = (req, res) => {

    const id = req.params.id;

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

        // Fetch categories for the navbar
        db.query("SELECT * FROM categories", (err, categories) => {

            if (err) return res.send(err);

            res.render("user/news-details", {
                item,
                categories
            });

        });

    });

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