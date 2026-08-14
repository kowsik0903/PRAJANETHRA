

const express = require("express");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const db = require("./config/db");


const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use((req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || "kowsik_news_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.json());



const uploadRoutes = require("./routes/uploadRoutes");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));
app.use("/api/upload", uploadRoutes);

const newsRoutes = require("./routes/newsRoutes");
app.use("/api/news", newsRoutes);




const homeRoutes = require("./routes/homeRoutes");

app.use("/", homeRoutes);

const videoRoutes = require("./routes/videoRoutes");
app.use("/admin/videos", videoRoutes);

const videoUserRoutes = require("./routes/videoUserRoutes");
app.use("/videos", videoUserRoutes);


// Category API
app.use("/api/categories", categoryRoutes);
const adminRoutes = require("./routes/adminRoutes");

app.use("/admin", adminRoutes);

const contactRoutes = require("./routes/contactRoutes");
app.use("/contact", contactRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

