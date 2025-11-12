// ------------------- Dependencies -------------------
require("dotenv").config();
const dbURL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/stayEase";
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const Mongostore= require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const upload = multer({ storage });
const axios = require("axios");

// ------------------- Route Imports -------------------
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const basicRoutes = require("./routes/basic");
const userRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");
const favoriteRoutes = require("./routes/favorites");
const bookingRoutes = require("./routes/booking");

// ------------------- MongoDB Connection -------------------


async function main() {
  await mongoose.connect(dbURL);
}

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ------------------- View Engine Setup -------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------- Middleware -------------------
app.use(express.urlencoded({ extended: true })); // ✅ Parse form data
app.use(express.json()); // ✅ Parse JSON & FormData from fetch()
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = Mongostore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // 1 day
});

store.on("error",()=>{
  console.log("Error in session store",err);
});
// ------------------- Session + Flash -------------------
const sessionConfig = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};



app.use(session(sessionConfig));
app.use(flash());

// ------------------- Passport Setup -------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------- Global Middleware (res.locals) -------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ------------------- Routes -------------------
app.use("/", basicRoutes); // ✅ homepage + about
app.use("/", userRoutes); // ✅ login/register/logout
app.use("/", dashboardRoutes); // ✅ user dashboard
app.use("/listings", listingRoutes); // ✅ main listings CRUD
app.use("/listings/:id/reviews", reviewRoutes); // ✅ review routes
app.use("/favorites", favoriteRoutes); // ✅ favorite listings
app.use("/bookings", bookingRoutes); // ✅ booking routes (AJAX + confirmation)

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).render("error.ejs", { err });
});

// ------------------- Server Start -------------------
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
