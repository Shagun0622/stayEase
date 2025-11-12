const Listing = require("./models/listing");
const Review = require("./models/review");

// 🧠 Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Save original URL to redirect after login
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

// 🏠 Check if logged-in user owns this listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // 🧠 Prevent crash: verify owner exists and matches
  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You don’t have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// 💬 Check if logged-in user authored this review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect("back");
  }

  // ✅ Only the review’s author can delete or edit it
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don’t have permission to delete this review!");
    return res.redirect("back");
  }

  next();
};
