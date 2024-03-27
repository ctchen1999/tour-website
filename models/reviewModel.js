const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            require: [true, "A review model must have a reivew"]
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            require: [true, "Review must belongs to a user"]
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            require: [true, "Review must belongs to a tour"]
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: "user",
    //     select: "name"
    // }).populate({
    //     path: "tour",
    //     select: "name"
    // });

    this.populate({
        path: "user",
        select: "name"
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    // this now points to the model
    const [stats] = await this.aggregate([
        {
            $match: { tour: { $eq: tourId } }
        },
        {
            $group: {
                _id: null,
                nRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);
    // console.log("stats", stats);
    if (stats === undefined) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats.nRatings,
            ratingsAverage: stats.avgRating
        });
    }
};

reviewSchema.post("save", function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, function(doc) {
    // doc = document after query.find....
    // console.log("doc", doc);
    // console.log("this", this);
    doc.constructor.calcAverageRatings(doc.tour);
    // this.model.calcAverageRatings(doc.tour);
});

// reviewSchema.pre(/^findOneAnd/, async function(next) {
//     // this = query object since it's a middelware function
//     this.r = await this.findOne(); // r: document
//     console.log("this.r", this.r);
//     next();
// });

// reviewSchema.post(/^findOneAnd/, async function() {
//     // this.r = documnet
//     // this.r.constructor = document.constructor = model
//     await this.r.constructor.calcAverageRatings(this.r.tour);
// });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
