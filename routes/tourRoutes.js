const express = require("express");
const tourController = require("../Controller/tourController");
const authController = require("../Controller/authController");
// const reviewController = require("../Controller/reviewController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// Implement nested routes
router.use("/:tourId/reviews", reviewRouter);

router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router
    .route("/monthly-plan/:year")
    .get(
        authController.protect,
        authController.restrictTo("admin", "lead-guide", "guide"),
        tourController.getMonthlyPlan
    );

router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40&45/unit=miles
// /tours-within/233/center/-40,45/unit/miles

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
    .route("/")
    .get(tourController.getAllTours) // Chain of middleware
    .post(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.createTour
    );

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour
    );

// router
//     .route("/:tourId/reviews")
//     .post(
//         authController.protect,
//         authController.restrictTo("user"),
//         reviewController.createReview
//     );

module.exports = router;
