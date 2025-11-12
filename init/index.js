const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log(" Connected to database"))
  .catch((err) => console.error("❌ Database connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    // Delete existing listings
    await Listing.deleteMany({});
    console.log(" Old data deleted");

    // Insert new data
    await Listing.insertMany(initData.data);
    console.log(" New data saved");
  } catch (err) {
    console.error(" Error initializing database:", err);
  } finally {
    mongoose.connection.close(); // optional but recommended
  }
};

initDB();
