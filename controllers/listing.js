const Listing = require("../models/listing.js");
const axios = require("axios"); //new
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listing/index.ejs", { allListings });
  };

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          model:"User",
        },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listing");
    }

    
    // res.render("listing/show.ejs", { listing });

    res.render("listing/show.ejs", { 
    listing,
    mapToken: process.env.MAPTILER_API_KEY
});
  };

   module.exports.createListing =async (req, res) => {
    if (!req.file) {
        req.flash("error", "Image is required!");
        return res.redirect("/listing/new");
    }
        let url =   req.file.path;
        let filename = req.file.filename;
      
           const newListing = new Listing(req.body.listing);
           newListing.owner = req.user._id;
           newListing.image = {url, filename}

const location = `${req.body.listing.location}, ${req.body.listing.country}`;
  
const geoResponse = await axios.get(
  "https://api.maptiler.com/geocoding/" + encodeURIComponent(location) + ".json",
  {
    params: {
      key: process.env.MAPTILER_API_KEY
    }
  }
);

const coordinates = geoResponse.data.features[0].geometry.coordinates;

newListing.geometry = {
  type: "Point",
  coordinates: coordinates
};

           await newListing.save();
           req.flash("success", "New Listing Created!");
           res.redirect("/listing");
         };


module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listing");
    }

   let originalImageUrl =  listing.image.url;
    originalImageUrl=  originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listing/edit.ejs", { listing,originalImageUrl });
  };

  module.exports.updateListing = async (req, res) => {
    
      let { id } = req.params;
    let listing =   await Listing.findByIdAndUpdate(id, { ...req.body.listing });

       if(typeof req.file !== "undefined") {
      let url =   req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
      await listing.save();

       }
      req.flash("success", "Listing Updated!");
      res.redirect(`/listing/${id}`);
    };

  module.exports.deleteListing = async (req, res) => {
      let { id } = req.params;
      let deletedListing = await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      req.flash("success", " Listing Deleted!");
      res.redirect("/listing");
    };