const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// MY BOOKINGS

router.get(
    "/my-bookings",
    isLoggedIn,
    bookingController.myBookings
);

// SHOW BOOKING FORM
router.get(
    "/:id/book",
    isLoggedIn,
    bookingController.renderBookingForm
);

// CREATE BOOKING
router.post(
    "/:id/book",
    isLoggedIn,
    bookingController.createBooking
);

// BOOKING CONFIRMATION
router.get(
    "/:bookingId/confirmation",
    isLoggedIn,
    bookingController.showBooking
);

module.exports = router;