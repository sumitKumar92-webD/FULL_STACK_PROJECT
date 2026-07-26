const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wenderlust";
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("connected to DB");  
})
    .catch((err) => {
        console.log(err);
    });
    
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDb = async () =>{
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({
    ...obj,
     owner: new
     mongoose.Types.ObjectId ("6a62436c3d8057c14bdbe4d6"),
   }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
    
}
initDb();
