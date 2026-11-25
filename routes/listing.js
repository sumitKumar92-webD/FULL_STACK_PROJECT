// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
// const { isLoggedIn, isOwner, validateListing, isReviewAuthor } = require("../middleware.js");
// const { model } = require("mongoose");
// const { index } = require("../controllers/listing.js");

// const listingController = require("../controllers/listing.js");
// const { route } = require("./user.js");

// const multer  = require('multer');
// const {storage}  = require("../cloudConfig.js");
// const upload = multer({ storage });



// router
// .route("/")
// .get(wrapAsync(index))
// .post(
//   isLoggedIn,
//   upload.single ("listing[image]"),
//   validateListing,
//   wrapAsync(listingController.createListing),
// );


// //New Route
// router.get("/new", isLoggedIn, listingController.renderNewForm);

// router
// .route("/:id")
// .get(wrapAsync(listingController.showListing))
// .put(
//   isLoggedIn,
//   isOwner,
//   upload.single ("listing[image]"),
//   validateListing,
//   wrapAsync(listingController.updateListing),
// )
// .delete(
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.deleteListing),
// );

// //Edit Route
// router.get(
//   "/:id/edit",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.editListing),
// );


// module.exports = router;



const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listing.js");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });


// 1. Index Route - All Listings
router.get(
    "/",
    wrapAsync(listingController.index)
);


// 2. New Route - Render New Listing Form
router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);


// 3. Create Route - Create New Listing
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);


// 4. Show Route - Show Single Listing
router.get(
    "/:id",
    wrapAsync(listingController.showListing)
);


// 5. Edit Route - Render Edit Form
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.editListing)
);


// 6. Update Route - Update Existing Listing
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
);


// 7. Delete Route - Delete Listing
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
);


module.exports = router;
