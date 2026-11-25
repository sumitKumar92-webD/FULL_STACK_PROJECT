// if(process.env.NODE_ENV != "production") {
//     require('dotenv').config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// // const MongoStore = require('connect-mongo');
// const { MongoStore } = require("connect-mongo");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter  = require("./routes/review.js");
// const userRouter  = require("./routes/user.js");
// const bookingRouter = require("./routes/booking.js"); //new
// const { Store } = require('express-session');


//  const dbUrl = process.env.ATLASDB_URL;

// main().then(() =>{
//     console.log("connected to DB");  
// })
//     .catch((err) => {
//         console.log(err);
//     });
    
// async function main() {
//     await mongoose.connect(dbUrl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, "public")));
  

// //render sol

// app.get("/health", (req, res) => {
//     res.status(200).json({
//         status: "OK",
//         message: "Wanderlust backend is running",
//     });
// });


//   const store = MongoStore.create({
//          mongoUrl: dbUrl,
//          crypto: {
//             secret: process.env.SECRET,
//          },
//          touchAfter: 24 * 3600,
//     });

//     store.on("error", (err) => {
//         console.log("Error in MONGO SESSION STORE", err);
//     });
// const sessionOption = {
//     store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         // expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true,
//     },
//     };
// app.use(session(sessionOption));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//      res.locals.error = req.flash("error");
//      res.locals.currUser = req.user;
//     next();
// });

// app.use("/listing",listingRouter );
// app.use("/listing/:id/reviews", reviewRouter);
// app.use("/bookings", bookingRouter); //new
// app.use("/", userRouter);



// app.use((req, res, next) => {
//     next(new ExpressError(404, "Page not found!"));
// });

// app.use((err, req, res, next) =>{
//     let {statusCode = 500, message = "something went wrong!"} = err;
//     res.status(statusCode).render("error.ejs", {message});
// });


// app.listen(8080, () => {
//     console.log("server is listening to port 8080");
// });





// 1. Load Environment Variables FIRST
require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

// 2. Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

// 3. Environment Variables
const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET;

if (!dbUrl) {
    throw new Error("ATLASDB_URL missing in environment variables");
}

if (!sessionSecret) {
    throw new Error("SECRET missing in environment variables");
}

// 4. View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 5. Basic Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 6. MongoDB Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Mongo Session Store Error:", err);
});

// 7. Session Configuration
const sessionOption = {
    store: store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    },
};

app.use(session(sessionOption));

// 8. Flash Middleware
app.use(flash());

// 9. Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 10. Global Local Variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// 11. Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "WanderLust backend is running",
    });
});

// 12. Routes
app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/bookings", bookingRouter);
app.use("/", userRouter);

// 13. 404 Error Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// 14. Global Error Handler
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong!",
    } = err;

    res.status(statusCode).render("error.ejs", { message });
});

// 15. Database Connection and Server
const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await mongoose.connect(dbUrl);

        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Database Connection Error:", err);
        process.exit(1);
    }
}

startServer();
