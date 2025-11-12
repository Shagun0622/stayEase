const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const multer = require("multer");
const upload = multer();

// ✅ BOOK A LISTING (supports AJAX + normal form)
router.post("/", upload.none(), async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // Validation
    if (!listingId) throw new Error("Missing listingId in request body");

    const listing = await Listing.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    // User authentication check
    if (!req.user) {
      if (req.headers.accept?.includes("application/json")) {
        return res.status(401).json({
          success: false,
          error: "Login required to make a booking",
        });
      }
      req.flash("error", "Please log in to book a stay.");
      return res.redirect("/login");
    }

    // Create booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
    });
    await booking.save();

    // Return JSON for AJAX
    if (req.headers.accept?.includes("application/json")) {
      return res.json({
        success: true,
        bookingId: booking._id,
        listing: {
          title: listing.title,
          location: listing.location,
          price: listing.price,
        },
        checkIn,
        checkOut,
        guests,
      });
    }

    // Normal redirect
    res.redirect(`/bookings/confirmation/${booking._id}`);
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    if (req.headers.accept?.includes("application/json")) {
      return res.status(500).json({
        success: false,
        error: err.message || "Booking failed due to a server error.",
      });
    }
    res.status(500).send("Booking failed");
  }
});

// ✅ BOOKING CONFIRMATION PAGE
router.get("/confirmation/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking) return res.status(404).send("Booking not found");
    res.render("bookings/confirmation", { booking });
  } catch (err) {
    console.error("❌ Error loading booking confirmation:", err.message);
    res.status(500).send("Error loading booking confirmation");
  }
});

// ✅ MY BOOKINGS PAGE
router.get("/my", async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be logged in to view bookings");
      return res.redirect("/login");
    }

    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    const now = new Date();
    const upcoming = bookings.filter((b) => new Date(b.checkOut) >= now);
    const past = bookings.filter((b) => new Date(b.checkOut) < now);

    res.render("bookings/myBookings", { upcoming, past });
  } catch (err) {
    console.error("❌ Error loading user bookings:", err.message);
    res.status(500).send("Error loading your bookings");
  }
});

// ❌ CANCEL BOOKING
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be logged in to cancel bookings");
      return res.redirect("/login");
    }

    const booking = await Booking.findById(req.params.id).populate("user");
    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my");
    }

    // Handle both populated and ObjectId user refs
    let bookingUserId;
    if (booking.user && typeof booking.user === "object" && booking.user._id) {
      bookingUserId = booking.user._id.toString();
    } else if (booking.user) {
      bookingUserId = booking.user.toString();
    }

    const currentUserId = req.user?._id?.toString();

    if (!bookingUserId || bookingUserId !== currentUserId) {
      req.flash("error", "You can only cancel your own bookings");
      return res.redirect("/bookings/my");
    }

    await Booking.findByIdAndDelete(req.params.id);
    req.flash("success", "Your booking has been cancelled.");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error("❌ Error cancelling booking:", err.message);
    req.flash("error", "Error cancelling booking.");
    res.redirect("/bookings/my");
  }
});

module.exports = router;
