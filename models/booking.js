const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ Booking Schema
const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing", // linked to your Listing model
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // linked to the user who booked
      required: true,
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least one guest is required"],
      max: [20, "Too many guests"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// ✅ Virtual: Calculate number of nights
bookingSchema.virtual("nights").get(function () {
  if (!this.checkIn || !this.checkOut) return 0;
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ✅ Virtual: Calculate total cost (based on listing price)
bookingSchema.virtual("totalPrice").get(function () {
  if (!this.listing || !this.listing.price) return null;
  const nights = this.nights || 0;
  return nights * this.listing.price;
});

// ✅ Populate listing details automatically when fetching bookings
bookingSchema.pre(/^find/, function (next) {
  this.populate("listing").populate("user", "username email");
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
