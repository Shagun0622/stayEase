const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const validateReview = require("../utils/validateReview");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

// 💬 CREATE — add review to listing
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${id}`);
  })
);

// 🗑️ DELETE — remove review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
