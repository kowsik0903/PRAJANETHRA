const Category = require("../models/Category");

// Get all categories
exports.getAllCategories = (req, res) => {
    Category.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Get category by ID
exports.getCategoryById = (req, res) => {
    const id = req.params.id;

    Category.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Add new category
exports.createCategory = (req, res) => {

    Category.create(req.body, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Category Added Successfully"
        });

    });

};

// Update category
exports.updateCategory = (req, res) => {

    const id = req.params.id;

    Category.update(id, req.body, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Category Updated Successfully"
        });

    });

};

// Delete category
exports.deleteCategory = (req, res) => {

    const id = req.params.id;

    Category.delete(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Category Deleted Successfully"
        });

    });

};