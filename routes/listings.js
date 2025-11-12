const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware");
const axios = require("axios");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig");
const upload = multer({ storage });

// ============================
// 🏡 INDEX — Show all listings
// ============================
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
  })
);

// ============================
// 🆕 NEW — Show create form
// ============================
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// ============================
// ➕ CREATE — Add new listing (with auto geocode)
// ============================
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      req.flash("error", "Invalid listing data.");
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // 🌍 Auto-geocode using OpenCage API
    const locationName = req.body.listing.location;
    const apiKey = process.env.OPENCAGE_API_KEY;
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      locationName
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(geoUrl);
      const data = response.data;

      if (data.results.length > 0) {
        const coords = data.results[0].geometry;
        newListing.geometry = {
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        };
      } else {
        newListing.geometry = {
          type: "Point",
          coordinates: [75.7873, 26.9124], // fallback (Jaipur)
        };
      }
    } catch (err) {
      console.error("❌ Geocoding failed:", err.message);
      newListing.geometry = {
        type: "Point",
        coordinates: [75.7873, 26.9124],
      };
    }

    // 🖼️ Handle image upload
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
  })
);

// ============================
// 🔍 SEARCH — by title/location/country/description
// ============================
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const query = req.query.q?.trim();

    if (!query) {
      req.flash("error", "Please enter something to search!");
      return res.redirect("/listings");
    }

    // 🧠 Use regex for case-insensitive, partial matches
    const regex = new RegExp(query, "i");

    const listings = await Listing.find({
      $or: [
        { title: regex },
        { location: regex },
        { country: regex },
        { description: regex },
      ],
    });

    res.render("listings/searchResults", { listings, query });
  })
);

// ============================
// 🏠 SHOW — Display one listing
// ============================
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  })
);

// ============================
// ✏️ EDIT — Show edit form
// ============================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  })
);

// ============================
// 📝 UPDATE — Edit existing listing
// ============================
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!req.body.listing) {
      req.flash("error", "Invalid data.");
      return res.redirect(`/listings/${id}/edit`);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
    );

    // 🌍 Re-geocode if location updated
    if (req.body.listing.location) {
      const locationName = req.body.listing.location;
      const apiKey = process.env.OPENCAGE_API_KEY;
      const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        locationName
      )}&key=${apiKey}`;

      try {
        const response = await axios.get(geoUrl);
        const data = response.data;

        if (data.results.length > 0) {
          const coords = data.results[0].geometry;
          updatedListing.geometry = {
            type: "Point",
            coordinates: [coords.lng, coords.lat],
          };
        }
      } catch (err) {
        console.error("❌ Geocoding failed on update:", err.message);
      }
    }

    // 🖼️ Replace image if new one uploaded
    if (req.file) {
      if (updatedListing.image && updatedListing.image.filename) {
        await cloudinary.uploader.destroy(updatedListing.image.filename);
      }
      updatedListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await updatedListing.save();
    }

    await updatedListing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${updatedListing._id}`);
  })
);

// ============================
// ❌ DELETE — Remove a listing
// ============================
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  })
);
// 🧠 AUTO-SUGGEST ROUTE — Returns JSON suggestions
router.get(
  "/suggest",
  wrapAsync(async (req, res) => {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);

    // Create regex for partial match
    const regex = new RegExp(query, "i");

    // Search by title or location
    const listings = await Listing.find({
      $or: [{ title: regex }, { location: regex }, { country: regex }],
    })
      .limit(5) // Only top 5 suggestions
      .select("title location country"); // Return minimal fields

    res.json(listings);
  })
);

module.exports = router;
