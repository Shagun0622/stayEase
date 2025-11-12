const Review = require("../models/review");
const Listing = require("../models/listing");

const validateReview = async (req, res, next) => {
  try {
    const review = new Review(req.body.review);
    await review.validate(); // Triggers Mongoose schema validation
    next(); // Continue to route handler if valid
  } catch (err) {
    const messages = Object.values(err.errors).map(e => e.message);
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    return res
      .status(400)
      .render("listings/show.ejs", { listing, errorMessages: messages });
  }
};

module.exports = validateReview; // ✅ Export the function directly
