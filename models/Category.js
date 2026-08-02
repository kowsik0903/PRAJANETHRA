const db = require("../config/db");

const Category = {

    getAll: (callback) => {
        db.query("SELECT * FROM categories", callback);
    },

    getById: (id, callback) => {
        db.query(
            "SELECT * FROM categories WHERE id=?",
            [id],
            callback
        );
    },

    create: (category, callback) => {
        db.query(
            "INSERT INTO categories(category_name, description) VALUES(?, ?)",
            [category.category_name, category.description],
            callback
        );
    },

    update: (id, category, callback) => {
        db.query(
            "UPDATE categories SET category_name=?, description=? WHERE id=?",
            [category.category_name, category.description, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.query(
            "DELETE FROM categories WHERE id=?",
            [id],
            callback
        );
    }

};

module.exports = Category;