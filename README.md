🏡 StayEase

A modern, full-stack accommodation booking platform inspired by Airbnb.
Browse beautiful stays, add favorites, make bookings, and explore locations through interactive maps — all in one clean and seamless experience.

✨ Features
🌍 Explore Stays

View detailed listings with images, descriptions, pricing, and amenities

Filter through locations and find the perfect stay

Fully responsive UI built with Bootstrap 5

🔐 User Authentication

Secure login & signup using Passport.js

Session-based authentication

Protected routes for favorites, bookings, reviews, and dashboards

💬 Reviews & Ratings

Leave reviews on listings

1–5 star ratings

Auto-display on listing pages

Cascade deletion when listings are removed

❤️ Save Favorites

Add/remove stays from favorites

Personalized dashboard for saved stays

📅 Booking System

AJAX booking form

Real-time confirmation modal

Price breakdown (nightly price, service fee, total)

Stores booking data in MongoDB

🌎 Interactive Maps

Leaflet.js for dynamic maps

GeoJSON coordinates for each listing

Popups, markers, and map navigation

☁️ Cloudinary Image Hosting

Secure upload and retrieval of images

Multer middleware for file handling

Cloud-hosted listing images

🧰 Tech Stack
Category	Tools Used
Frontend	EJS, Bootstrap 5, JavaScript
Backend	Node.js, Express.js
Database	MongoDB Atlas, Mongoose
Auth	Passport.js, Express-Session
File Uploads	Cloudinary, Multer
Geolocation	Leaflet Maps, GeoJSON
Deployment	Render

stayEase/
├── models/            # Mongoose schemas
├── routes/            # Application routes
├── views/             # EJS templates
├── public/            # Static assets (CSS, JS, images)
├── init/              # Seed data (sample listings)
├── seed.js            # Database seeding script
├── app.js             # Main application file
├── package.json
└── .env (not included)  
