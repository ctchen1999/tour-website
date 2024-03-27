const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");
// const catchAsync = require("./../utils/catchAsync");

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes -> 一般從/reviews route 會帶有 req.body.user and req.body.tour
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
