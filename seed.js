require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const { data } = require("./init/data");

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("🌐 Connected to MongoDB Atlas");
}

main()
  .then(async () => {

    // Add default geometry
    data.forEach((listing) => {
      listing.geometry = {
        type: "Point",
        coordinates: [77.5946, 12.9716]  // Bangalore default
      };
    });

    await Listing.deleteMany({});
    console.log("🗑️ Old listings removed");

    await Listing.insertMany(data);
    console.log(`🌱 Inserted ${data.length} listings`);

    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seeding error:", err));
