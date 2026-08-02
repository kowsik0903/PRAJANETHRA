const News = require("../models/News");

// Get All News
exports.getAllNews = (req, res) => {

    News.getAll((err, results) => {

        if (err)
            return res.status(500).json(err);

        res.json(results);

    });

};

// Get News By ID
exports.getNewsById = (req, res) => {

    News.getById(req.params.id, (err, results) => {

        if (err)
            return res.status(500).json(err);

        res.json(results);

    });

};

// Create News
const db = require("../config/db");

exports.createNews = (req, res) => {

    const { title, description, content, category_id } = req.body;

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO news (title, description, content, category_id, image)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, description, content, category_id, image],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.redirect("/admin/dashboard");
        }
    );
};

// Update News
exports.updateNews = (req, res) => {

    News.update(req.params.id, req.body, (err) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            message: "News Updated Successfully"
        });

    });

};

// Delete News
exports.deleteNews = (req, res) => {

    News.delete(req.params.id, (err) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            message: "News Deleted Successfully"
        });

    });

};