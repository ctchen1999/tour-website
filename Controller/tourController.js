// const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    // console.log(file);
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(
            new AppError("Not an image! Please upload only images.", 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCOunt: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    // console.log(req.files);

    if (!req.files.imageCover || !req.files.images) {
        next();
        // return next();
    }

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, idx) => {
            const filename = `tour-${req.params.id}-${Date.now()}-cover${idx +
                1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({ qulity: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "ratingsAverage,price,name,duration,description";
    next();
};

exports.getAllTours = factory.getAll(Tour);

//////////////////////CRUD////////////////////////////////////////////
// Create
exports.createTour = factory.createOne(Tour);

// Read
exports.getTour = factory.getOne(Tour, "reviews");

// Update
exports.updateTour = factory.updateOne(Tour);

// Delete
exports.deleteTour = factory.deleteOne(Tour); // New version with handlerFactory
//////////////////////////////////////////////////////////////////////

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            // Stage1
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            // Stage 2
            $group: {
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                numRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                numTourStarts: { $sum: 1 },
                tours: { $push: "$name" }
            }
        },
        {
            $addFields: { month: "$_id" }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        }
    ]);

    res.status(200).json({
        status: "success",
        results: plan.length,
        data: {
            plan
        }
    });
});

// /tours-within/233/center/-40,45/unit/miles
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        return next(
            AppError(
                "Please provide latitude and longitude in the format lat,lng",
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const multiplier = unit === "mi" ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        return next(
            AppError(
                "Please provide latitude and longitude in the format lat,lng",
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        results: distances.length,
        data: {
            data: distances
        }
    });
});
