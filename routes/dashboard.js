const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// ---------------- DASHBOARD ----------------
router.get("/dashboard", isLoggedIn, async (req, res) => {
  // 1️⃣ Find listings created by this logged-in user
  const myListings = await Listing.find({ owner: req.user._id });

  // 2️⃣ Count them
  const totalListings = myListings.length;

  // 3️⃣ Render dashboard view
  res.render("users/dashboard.ejs", { myListings, totalListings });
});

module.exports = router;
