// const Listing = require("../models/listing.js");
// const axios = require("axios"); //new

// module.exports.index = async (req, res) => {
//     const { search } = req.query;
//     let allListings = [];
//     if (search && search.trim() !== "") {
//         const searchText = search.trim();
//         // 1. Exact matching listings
//         const exactListings = await Listing.find({
//             $or: [
//                 {
//                     title: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 },
//                 {
//                     location: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 },
//                 {
//                     country: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 }
//             ]
//         });

//         // 2. Other listings
//         const otherListings = await Listing.find({
//             $nor: [
//                 {
//                     title: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 },
//                 {
//                     location: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 },
//                 {
//                     country: {
//                         $regex: searchText,
//                         $options: "i"
//                     }
//                 }
//             ]
//         }).limit(12);

//         // Exact results first + other listings after
//         allListings = [
//             ...exactListings,
//             ...otherListings
//         ];

//     } else {
//         allListings = await Listing.find({});
//     }

//     res.render("listing/index.ejs", {
//         allListings,
//         search
//     });
// };

// module.exports.renderNewForm = (req, res) => {
//   res.render("listing/new.ejs");
// }

// module.exports.showListing = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id)
//       .populate({
//         path: "reviews",
//         populate: {
//           path: "author",
//           model:"User",
//         },
//       })
//       .populate("owner");
//     if (!listing) {
//       req.flash("error", "Listing you requested for does not exist!");
//       return res.redirect("/listing");
//     }

    
//     // res.render("listing/show.ejs", { listing });

//     res.render("listing/show.ejs", { 
//     listing,
//     mapToken: process.env.MAPTILER_API_KEY
// });
//   };

// module.exports.createListing =async (req, res) => {
//     if (!req.file) {
//         req.flash("error", "Image is required!");
//         return res.redirect("/listing/new");
//     }
//         let url =   req.file.path;
//         let filename = req.file.filename;
      
//            const newListing = new Listing(req.body.listing);
//            newListing.owner = req.user._id;
//            newListing.image = {url, filename}

// const location = `${req.body.listing.location}, ${req.body.listing.country}`;
  
// const geoResponse = await axios.get(
//   "https://api.maptiler.com/geocoding/" + encodeURIComponent(location) + ".json",
//   {
//     params: {
//       key: process.env.MAPTILER_API_KEY
//     }
//   }
// );

// const coordinates = geoResponse.data.features[0].geometry.coordinates;

// newListing.geometry = {
//   type: "Point",
//   coordinates: coordinates
// };

//            await newListing.save();
//            req.flash("success", "New Listing Created!");
//            res.redirect("/listing");
//          };


// module.exports.editListing = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing) {
//       req.flash("error", "Listing you requested for does not exist!");
//       return res.redirect("/listing");
//     }

//    let originalImageUrl =  listing.image.url;
//     originalImageUrl=  originalImageUrl.replace("/upload", "/upload/h_300,w_250");
//     res.render("listing/edit.ejs", { listing,originalImageUrl });
//   };

// module.exports.updateListing = async (req, res) => {
    
//       let { id } = req.params;
//     let listing =   await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//        if(typeof req.file !== "undefined") {
//       let url =   req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url, filename};
//       await listing.save();

//        }
//       req.flash("success", "Listing Updated!");
//       res.redirect(`/listing/${id}`);
//     };

//   module.exports.deleteListing = async (req, res) => {
//       let { id } = req.params;
//       let deletedListing = await Listing.findByIdAndDelete(id);
//       console.log(deletedListing);
//       req.flash("success", " Listing Deleted!");
//       res.redirect("/listing");
//     };



const Listing = require("../models/listing.js");
const axios = require("axios");

// INDEX - Show all listings and search listings
module.exports.index = async (req, res) => {
    const { search } = req.query;
    let allListings = [];

    if (search && search.trim() !== "") {
        const searchText = search.trim();

        // Special regex characters ko escape karna
        const safeSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const searchRegex = new RegExp(safeSearch, "i");

        const searchCondition = {
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ]
        };

        // Exact matching results
        const exactListings = await Listing.find(searchCondition);

        // Other listings
        const otherListings = await Listing.find({
            $nor: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ]
        }).limit(12);

        allListings = [...exactListings, ...otherListings];

    } else {
        allListings = await Listing.find({});
    }

    res.render("listing/index.ejs", {
        allListings,
        search
    });
};


// RENDER NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs");
};


// SHOW SINGLE LISTING
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                model: "User"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listing");
    }

    res.render("listing/show.ejs", {
        listing,
        mapToken: process.env.MAPTILER_API_KEY
    });
};


// CREATE NEW LISTING
module.exports.createListing = async (req, res) => {

    if (!req.file) {
        req.flash("error", "Image is required!");
        return res.redirect("/listing/new");
    }

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };

    // Get coordinates using MapTiler
    const location = `${req.body.listing.location}, ${req.body.listing.country}`;

    const geoResponse = await axios.get(
        "https://api.maptiler.com/geocoding/" +
        encodeURIComponent(location) +
        ".json",
        {
            params: {
                key: process.env.MAPTILER_API_KEY
            }
        }
    );

    const features = geoResponse.data.features;

    if (!features || features.length === 0) {
        req.flash("error", "Location could not be found. Please enter a valid location.");
        return res.redirect("/listing/new");
    }

    const coordinates = features[0].geometry.coordinates;

    newListing.geometry = {
        type: "Point",
        coordinates: coordinates
    };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
};


// RENDER EDIT FORM
module.exports.editListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listing");
    }

    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/h_300,w_250"
    );

    res.render("listing/edit.ejs", {
        listing,
        originalImageUrl
    });
};


// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listing");
    }

    // Update listing details
    Object.assign(listing, req.body.listing);

    // Update image only if a new image is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listing/${id}`);
};


// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listing");
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
};
