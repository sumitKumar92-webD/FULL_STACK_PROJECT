// const mongoose = require("mongoose");

// const bookingSchema = new mongoose.Schema(
//     {
//         listing: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Listing",
//             required: true,
//         },

//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//         },

//         checkIn: {
//             type: Date,
//             required: true,
//         },

//         checkOut: {
//             type: Date,
//             required: true,
//         },

//         guests: {
//             type: Number,
//             default: 1,
//             min: 1,
//         },

//         // 18% GST amount
//         gst: {
//             type: Number,
//             default: 0,
//         },

//         // Final amount including GST
//         totalPrice: {
//             type: Number,
//             required: true,
//         },

//         status: {
//             type: String,
//             enum: ["Booked", "Cancelled"],
//             default: "Booked",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// const Booking = mongoose.model("Booking", bookingSchema);

// module.exports = Booking;



const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        checkIn: {
            type: Date,
            required: true,
        },

        checkOut: {
            type: Date,
            required: true,
        },

        guests: {
            type: Number,
            default: 1,
            min: 1,
        },

        gst: {
            type: Number,
            default: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        // Booking status
        status: {
            type: String,
            enum: ["Pending", "Booked", "Cancelled"],
            default: "Pending",
        },

        // Payment details
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },

        razorpayOrderId: {
            type: String,
        },

        razorpayPaymentId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
