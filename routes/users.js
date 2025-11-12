const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// ---------------- REGISTER (SIGNUP) ----------------

// GET Signup form
router.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

// POST Signup form
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    // Automatically log the user in after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to StayEase!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// ---------------- LOGIN ----------------

// GET Login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// POST Login form
router.post(
  "/login",
  (req, res, next) => {
    // ✅ Before authenticating, save the URL the user originally wanted
    if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
    }
    next();
  },
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);

    // ✅ Redirect to original page or default /listings
    const redirectUrl = res.locals.returnTo || "/listings";
    delete req.session.returnTo; // clear it from session
    res.redirect(redirectUrl);
  }
);

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have logged out successfully!");
    res.redirect("/listings");
  });
});

module.exports = router;
