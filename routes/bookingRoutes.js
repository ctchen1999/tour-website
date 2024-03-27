const express = require("express");
const bookingController = require("../Controller/bookingController");
const reviewController = require("../Controller/reviewController");
const authController = require("../Controller/authController");

const router = express.Router();

router.get(
    "/checkout-session/:tourId",
    authController.protect,
    bookingController.getCheckoutSession
);

module.exports = router;
