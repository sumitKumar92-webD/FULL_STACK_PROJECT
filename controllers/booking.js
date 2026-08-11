const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

// SHOW BOOKING FORM
module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listing");
    }

    res.render("bookings/new.ejs", {
        listing
    });
};


// CREATE BOOKING
module.exports.createBooking = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listing");
    }

    const { checkIn, checkOut, guests } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check-in date cannot be before today
    if (start < today) {
        req.flash(
            "error",
            "Check-in date cannot be before today!"
        );

        return res.redirect(`/bookings/${id}/book`);
    }

    // Check-out date cannot be before today
    if (end < today) {
        req.flash(
            "error",
            "Check-out date cannot be before today!"
        );

        return res.redirect(`/bookings/${id}/book`);
    }

    // Check-out must be after check-in
    if (end <= start) {
        req.flash(
            "error",
            "Check-out date must be after check-in date!"
        );

        return res.redirect(`/bookings/${id}/book`);
    }

    // Calculate number of days
    const timeDifference = end - start;

    const numberOfDays =
        timeDifference / (1000 * 60 * 60 * 24);

    // Check guests
    if (!guests || Number(guests) <= 0) {
        req.flash(
            "error",
            "Please enter a valid number of guests!"
        );

        return res.redirect(`/bookings/${id}/book`);
    }


    // =========================
    // PRICE CALCULATION
    // =========================

    // Room price without GST
    const basePrice =
        numberOfDays * listing.price;

    // 18% GST
    const gst =
        basePrice * 0.18;

    // Final price including GST
    const totalPrice =
        basePrice + gst;


    // =========================
    // CREATE BOOKING
    // =========================

    const booking = new Booking({

        listing: listing._id,

        user: req.user._id,

        checkIn: start,

        checkOut: end,

        guests: Number(guests),

        gst: gst,

        totalPrice: totalPrice

    });


    await booking.save();


    req.flash(
        "success",
        "Booking confirmed!"
    );


    // Go to confirmation page
    res.redirect(
        `/bookings/${booking._id}/confirmation`
    );
};


// SHOW BOOKING CONFIRMATION
module.exports.showBooking = async (req, res) => {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
        .populate("listing")
        .populate("user");


    if (!booking) {

        req.flash(
            "error",
            "Booking not found!"
        );

        return res.redirect("/listing");
    }


    res.render(
        "bookings/confirmation.ejs",
        {
            booking
        }
    );
};


// MY BOOKINGS
module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id
    })
        .populate("listing")
        .sort({
            createdAt: -1
        });


    res.render(
        "bookings/myBookings.ejs",
        {
            bookings
        }
    );
};