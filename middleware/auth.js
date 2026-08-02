exports.isAdmin = (req, res, next) => {

    if (req.session.admin) {
        return next();
    }

    res.redirect("/admin/login");

};