const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); // 👈 for cascade delete

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1761069234555-272f68348b53?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1175",
      // 🧠 fallback URL when empty
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1761069234555-272f68348b53?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1175"
          : v,
    },
  },

  price: {
    type: Number,
    required: true,
    default: 0,
  },

  location: {
    type: String,
  },

  country: {
    type: String,
  },

  // 💬 Reference to all reviews for this listing
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  // 👤 Owner (user who created the listing)
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});


// 🧹 Cascade delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    console.log("🧹 Deleted associated reviews for listing:", listing._id);
  }
});




const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
