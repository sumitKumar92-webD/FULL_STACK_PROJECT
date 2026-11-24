// const Booking = require("../models/booking.js");
// const Listing = require("../models/listing.js");

// // SHOW BOOKING FORM
// module.exports.renderBookingForm = async (req, res) => {
//     const { id } = req.params;

//     const listing = await Listing.findById(id);

//     if (!listing) {
//         req.flash("error", "Listing not found!");
//         return res.redirect("/listing");
//     }

//     res.render("bookings/new.ejs", {
//         listing
//     });
// };


// // CREATE BOOKING
// module.exports.createBooking = async (req, res) => {
//     const { id } = req.params;

//     const listing = await Listing.findById(id);

//     if (!listing) {
//         req.flash("error", "Listing not found!");
//         return res.redirect("/listing");
//     }

//     const { checkIn, checkOut, guests } = req.body;

//     const start = new Date(checkIn);
//     const end = new Date(checkOut);

//     // Today's date
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Check-in date cannot be before today
//     if (start < today) {
//         req.flash(
//             "error",
//             "Check-in date cannot be before today!"
//         );

//         return res.redirect(`/bookings/${id}/book`);
//     }

//     // Check-out date cannot be before today
//     if (end < today) {
//         req.flash(
//             "error",
//             "Check-out date cannot be before today!"
//         );

//         return res.redirect(`/bookings/${id}/book`);
//     }

//     // Check-out must be after check-in
//     if (end <= start) {
//         req.flash(
//             "error",
//             "Check-out date must be after check-in date!"
//         );

//         return res.redirect(`/bookings/${id}/book`);
//     }

//     // Calculate number of days
//     const timeDifference = end - start;

//     const numberOfDays =
//         timeDifference / (1000 * 60 * 60 * 24);

//     // Check guests
//     if (!guests || Number(guests) <= 0) {
//         req.flash(
//             "error",
//             "Please enter a valid number of guests!"
//         );

//         return res.redirect(`/bookings/${id}/book`);
//     }


//     // =========================
//     // PRICE CALCULATION
//     // =========================

//     // Room price without GST
//     const basePrice =
//         numberOfDays * listing.price;

//     // 18% GST
//     const gst =
//         basePrice * 0.18;

//     // Final price including GST
//     const totalPrice =
//         basePrice + gst;


//     // =========================
//     // CREATE BOOKING
//     // =========================

//     const booking = new Booking({

//         listing: listing._id,

//         user: req.user._id,

//         checkIn: start,

//         checkOut: end,

//         guests: Number(guests),

//         gst: gst,

//         totalPrice: totalPrice

//     });


//     await booking.save();


//     req.flash(
//         "success",
//         "Booking confirmed!"
//     );


//     // Go to confirmation page
//     res.redirect(
//         `/bookings/${booking._id}/confirmation`
//     );
// };


// // SHOW BOOKING CONFIRMATION
// module.exports.showBooking = async (req, res) => {

//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId)
//         .populate("listing")
//         .populate("user");


//     if (!booking) {

//         req.flash(
//             "error",
//             "Booking not found!"
//         );

//         return res.redirect("/listing");
//     }


//     res.render(
//         "bookings/confirmation.ejs",
//         {
//             booking
//         }
//     );
// };


// // MY BOOKINGS
// module.exports.myBookings = async (req, res) => {

//     const bookings = await Booking.find({
//         user: req.user._id
//     })
//         .populate("listing")
//         .sort({
//             createdAt: -1
//         });


//     res.render(
//         "bookings/myBookings.ejs",
//         {
//             bookings
//         }
//     );
// };





const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const razorpay = require("../utils/razorpay.js");
const crypto = require("crypto");

// 1. MY BOOKINGS
module.exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.render("bookings/myBookings.ejs", { bookings });
  } catch (err) {
    console.error("My Bookings Error:", err);
    req.flash("error", "Unable to load bookings.");
    res.redirect("/listing");
  }
};


// 2. RENDER BOOKING FORM
module.exports.renderBookingForm = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    res.render("bookings/new.ejs", { listing });
  } catch (err) {
    console.error("Booking Form Error:", err);
    req.flash("error", "Unable to open booking page.");
    res.redirect("/listing");
  }
};


// 3. CREATE BOOKING + RAZORPAY ORDER
module.exports.createBooking = async (req, res) => {
  let booking;

  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    // Validate dates
    if (!checkIn || !checkOut) {
      req.flash("error", "Please select check-in and check-out dates.");
      return res.redirect(`/bookings/${id}/book`);
    }

    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start < today ||
      end <= start
    ) {
      req.flash("error", "Please select valid booking dates.");
      return res.redirect(`/bookings/${id}/book`);
    }

    // Validate guests
    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > 50
    ) {
      req.flash("error", "Please enter a valid number of guests.");
      return res.redirect(`/bookings/${id}/book`);
    }

    // Validate listing price
    const pricePerNight = Number(listing.price);

    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      req.flash("error", "Invalid listing price.");
      return res.redirect(`/listing/${id}`);
    }

    // Calculate total amount
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.round(
      (end.getTime() - start.getTime()) / millisecondsPerDay
    );

    const basePrice = numberOfDays * pricePerNight;
    const gst = Math.round(basePrice * 18) / 100;
    const totalPrice = Math.round((basePrice + gst) * 100) / 100;

    // Create booking
    booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      gst,
      totalPrice,
      status: "Pending",
      paymentStatus: "Pending",
    });

    await booking.save();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: booking._id.toString(),
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.render("bookings/payment.ejs", {
      booking,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Create Booking Error:", err);

    // Remove incomplete booking if order creation fails
    if (booking && booking._id) {
      await Booking.findByIdAndDelete(booking._id).catch(console.error);
    }

    req.flash("error", "Unable to create payment order. Please try again.");
    res.redirect("/listing");
  }
};


// 4. VERIFY RAZORPAY PAYMENT
module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // Check required fields
    if (
      !bookingId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details.",
      });
    }

    // Find user's booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Prevent duplicate verification
    if (booking.paymentStatus === "Paid") {
      return res.json({
        success: true,
        redirectUrl: `/bookings/${booking._id}/confirmation`,
      });
    }

    // Verify order ID
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const generatedBuffer = Buffer.from(generatedSignature, "hex");

    if (
      receivedBuffer.length !== generatedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, generatedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Verify payment directly with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== booking.razorpayOrderId ||
      payment.amount !== Math.round(booking.totalPrice * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or amount does not match.",
      });
    }

    // Update booking
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentStatus = "Paid";
    booking.status = "Booked";

    await booking.save();

    return res.json({
      success: true,
      redirectUrl: `/bookings/${booking._id}/confirmation`,
    });

  } catch (err) {
    console.error("Payment Verification Error:", err);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed. Please contact support.",
    });
  }
};


// 5. SHOW BOOKING CONFIRMATION
module.exports.showBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    }).populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/my-bookings");
    }

    if (booking.paymentStatus !== "Paid") {
      req.flash("error", "Payment is not completed.");
      return res.redirect("/bookings/my-bookings");
    }

    res.render("bookings/confirmation.ejs", { booking });

  } catch (err) {
    console.error("Confirmation Error:", err);
    req.flash("error", "Unable to load confirmation.");
    res.redirect("/bookings/my-bookings");
  }
};
