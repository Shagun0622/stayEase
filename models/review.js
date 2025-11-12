const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  // ⭐ Who wrote the review
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // must be logged-in user
  },

  // 💬 Review text
  comment: {
    type: String,
    required: [true, "Comment is required."],
    trim: true,
    minlength: [5, "Comment must be at least 5 characters long."],
    maxlength: [500, "Comment cannot exceed 500 characters."],
  },

  // 🌟 Rating
  rating: {
    type: Number,
    required: [true, "Rating is required."],
    min: [1, "Rating must be at least 1."],
    max: [5, "Rating cannot exceed 5."],
  },

  // 🕒 Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
