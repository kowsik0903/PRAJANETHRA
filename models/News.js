const db = require("../config/db");

const News = {

    getAll: (callback) => {
        db.query(
            `SELECT news.*, categories.category_name
             FROM news
             JOIN categories
             ON news.category_id = categories.id
             ORDER BY news.created_at DESC`,
            callback
        );
    },

    getById: (id, callback) => {
        db.query(
            "SELECT * FROM news WHERE id=?",
            [id],
            callback
        );
    },

    create: (news, callback) => {

        db.query(

            `INSERT INTO news
            (title,description,content,image,author,category_id,is_breaking,status)
            VALUES(?,?,?,?,?,?,?,?)`,

            [
                news.title,
                news.description,
                news.content,
                news.image,
                news.author,
                news.category_id,
                news.is_breaking,
                news.status
            ],

            callback
        );

    },

    update: (id, news, callback) => {

        db.query(

            `UPDATE news SET
            title=?,
            description=?,
            content=?,
            image=?,
            author=?,
            category_id=?,
            is_breaking=?,
            status=?
            WHERE id=?`,

            [
                news.title,
                news.description,
                news.content,
                news.image,
                news.author,
                news.category_id,
                news.is_breaking,
                news.status,
                id
            ],

            callback
        );

    },
    incrementViews: (id, callback) => {

    db.query(
        "UPDATE news SET views = views + 1 WHERE id=?",
        [id],
        callback
    );

},

    delete: (id, callback) => {

        db.query(
            "DELETE FROM news WHERE id=?",
            [id],
            callback
        );

    }

};

module.exports = News;