
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(bookingForm);
    const response = await fetch("/bookings", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // 🧮 Calculate number of nights and price breakdown
      const checkIn = new Date(result.checkIn);
      const checkOut = new Date(result.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const subtotal = nights * result.listing.price;
      const serviceFee = Math.round(subtotal * 0.08);
      const total = subtotal + serviceFee;

      // ✨ Populate modal fields
      document.getElementById("modalListingInfo").textContent = `${result.listing.title}, ${result.listing.location}`;
      document.getElementById("modalCheckIn").textContent = checkIn.toDateString();
      document.getElementById("modalCheckOut").textContent = checkOut.toDateString();
      document.getElementById("modalGuests").textContent = result.guests;
      document.getElementById("modalPrice").textContent = result.listing.price.toLocaleString("en-IN");
      document.getElementById("modalSubtotal").textContent = subtotal.toLocaleString("en-IN");
      document.getElementById("modalServiceFee").textContent = serviceFee.toLocaleString("en-IN");
      document.getElementById("modalTotal").textContent = total.toLocaleString("en-IN");

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById("bookingModal"));
      modal.show();

      // Auto redirect after 3s
      setTimeout(() => {
        window.location.href = `/bookings/confirmation/${result.bookingId}`;
      }, 3000);
    } else {
      alert("Booking failed. Please try again.");
    }
  });
});

