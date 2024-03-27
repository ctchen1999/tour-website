const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Using middleware (create middleware stack)
// 1) GLOBAL MIDDLEWARE
// Serving static file
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    })
);

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev")); // Third-party middleware package
}

// Limit request from same API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this ip. Please try after 15mins."
});
app.use("/api", limiter);

// Body parser, reading the data from body to req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization againt noSQL
app.use(mongoSanitize());

// Data sanitize againt xss
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            "duration",
            "ratingsAverage",
            "ratingsQuantity",
            "maxGroupSize",
            "difficulty",
            "price"
        ]
    })
);
app.use(compression());

// Define Router
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// For those route not define
app.all("*", (req, res, next) => {
    // 當傳入next 參數時，系統會自動判斷為error，直接跳到error handling
    next(new AppError("Can't find this route on this server.", 404));
});

// Global Error handling
app.use(globalErrorHandler);

module.exports = app;
