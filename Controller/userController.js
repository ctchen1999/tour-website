const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req, file, cb) => {
//         // user-{userId}-{currentTimeStamp}.{jpg}
//         const extension = file.mimetype.split("/")[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// });
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

// Define middleware for file upload
exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    // Image resizing
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

const filterObj = (obj, ...allowedBody) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedBody.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);

    // 1) Create an error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                "This route is not for password updating. Please go to /updateMyPassword",
                401
            )
        );
    }

    // 2) Updata user document
    const filteredBody = filterObj(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;
    // console.log("filter", filteredBody);
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        data: user
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    res.stauts(500).json({
        status: "error",
        message: "This route is not defined! Please use /signup instead."
    });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update password with this!!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
