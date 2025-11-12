const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// ❤️ Add a listing to favorites
router.post("/:id/add", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const user = req.user;

  // Prevent duplicates
  if (!user.favorites.includes(listing._id)) {
    user.favorites.push(listing._id);
    await user.save();
    req.flash("success", `${listing.title} added to your favorites ❤️`);
  } else {
    req.flash("info", "Already in your favorites!");
  }

  res.redirect(`/listings/${id}`);
}));

// 💔 Remove a listing from favorites
router.post("/:id/remove", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  user.favorites = user.favorites.filter(favId => favId.toString() !== id);
  await user.save();

  req.flash("success", "Removed from your favorites 💔");
  res.redirect(`/listings/${id}`);
}));

// 🧾 Show all favorites
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.render("favorites/index", { favorites: user.favorites });
}));

module.exports = router;
