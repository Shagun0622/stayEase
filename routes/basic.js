const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// Home Page
router.get("/", async (req, res) => {
  const featured = await Listing.find({}).limit(8);
  res.render("home.ejs", { featured });
});

// About Page
router.get("/about", (req, res) => {
  res.render("about.ejs");
});
//careeer page
router.get("/careers", (req, res) => {
  res.render("careers.ejs");
});
//press page
router.get("/press", (req, res) => {
  res.render("press.ejs");
});
//help page
router.get("/help", (req, res) => {
  res.render("help.ejs");
});
//cancellation
router.get("/cancellation", (req, res) => {
  res.render("cancellation.ejs");
});
//safety page
router.get("/safety", (req, res) => {
  res.render("safety.ejs");
});


module.exports = router;
