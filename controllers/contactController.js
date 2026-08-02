const db = require("../config/db");

// Show Contact Page
exports.contactPage = (req, res) => {

    db.query("SELECT * FROM categories", (err, categories) => {

        if (err) return res.send(err);

        res.render("user/contact", {
            categories
        });

    });

};

// Save Contact Message
exports.saveMessage = (req, res) => {

    const {
        name,
        email,
        subject,
        message
    } = req.body;

    const sql = `
        INSERT INTO contacts
        (name,email,subject,message)
        VALUES (?,?,?,?)
    `;

    db.query(
        sql,
        [name, email, subject, message],
        (err) => {

            if (err) return res.send(err);

            res.redirect("/contact");

        }
    );

};