const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");
// const validator = require("validator");

// Define Schema
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name."],
            unique: true,
            maxlength: [40, "A tour name must less or equal than 40"],
            minlength: [10, "A tour name must more or equal than 10"]
            // // use external library to perform validate
            // validate: [
            //     validator.isAlpha,
            //     "Tour name must only contain characters"
            // ]
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "difficulty is either 'easy', 'medium', or 'difficult'"
            }
        },
        duration: {
            type: Number,
            required: [true, "A tour must have a duration."]
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a max group size."]
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0.0
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price."]
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                    // this only points to current doc on NEW documnet creation
                    return val < this.price;
                },
                message: "Discount price should be below regular price."
            }
        },
        summary: {
            type: String
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have a cover image."]
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now()
        },
        startDates: [Date],
        slug: String,
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            // Array of object
            {
                type: {
                    type: String,
                    default: "Point",
                    enum: ["Point"]
                },
                coordinates: [Number],
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        ]
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function() {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});

// 1) Document Middlement -> 當document 要被 create. save "前"會先經過這個middleware
tourSchema.pre("save", function(next) {
    // this represents 正在被process 的document
    this.slug = slugify(this.name, { lower: true });

    // Middleware should always have next()
    next();
});

// Embedding users data into user entity
// tourSchema.pre("save", async function(next) {
//     console.log(this.guides);
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     console.log(guidesPromises);
//     // this.guides = guidesPromises;
//     console.log(this.guides);
//     next();
// });

// 2) query middleware -> 當find, findOne 出現時會執行query middleware
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: "guides",
        select: "-__v"
    });

    next();
});

tourSchema.post(/^find/, function(docs, next) {
    // console.log(docs);
    console.log(`Query took ${Date.now - this.start} milliseconds`);

    next();
});

// 3) Aggregation middleware -> execute pre hook when aggregate is called
// tourSchema.pre("aggregate", function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
