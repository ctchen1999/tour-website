const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expiresIn: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get("host")}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    // 2) Check if user exits && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError("Incorrect email or password"), 401);
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expiresIn: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: "success"
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting token and check if it's there
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
        console.log("token", token);
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError(
                "You are not logged in! Please log in to get access.",
                401
            )
        );
    }

    // 2) Verification token -> 確認token 中的headers, payload 沒有被改變
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log("decoded:", decoded);

    // 3) Check if user still exists -> 有可能下次要登入時，使用者已經將帳號刪除
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                "The user beloning to this user does no longer exist.",
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    // If changed password after token issued -> return error!!
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password! Please log in again.",
                401
            )
        );
    }

    // granted access to next
    res.locals.user = currentUser;
    req.user = currentUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    // 1) Getting token and check if it's there
    if (req.cookies.jwt) {
        try {
            // 1) Verify token -> 確認token 中的headers, payload 沒有被改變
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );
            // console.log("decoded:", decoded);

            // 2) Check if user still exists -> 有可能下次要登入時，使用者已經將帳號刪除
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
            console.log("current_user:", currentUser);

            // 3) Check if user changed password after the token was issued
            // If changed password after token issued -> return error!!
            if (currentUser.changePasswordAfter(decoded.iat)) {
                return next();
            }

            // granted access to next
            res.locals.user = currentUser;
            return next();
        } catch (error) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    // roles is an array
    return (req, res, next) => {
        // console.log(roles);
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You do not have permission to perform this action.",
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on Posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError("There is no user with this email address", 404)
        );
    }

    // 2) Generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // 在先前instance method 中對物件的修改沒有存下來

    // 3) Send it to user's email
    try {
        const resetURL = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        await res.status(200).json({
            status: "success",
            message: "Token sent to email!"
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                "There's an error sending the email. Please try again",
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpired: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save();

    // 3) Update changedPasswordAt property of the user
    // 4) Log the user in, send JWT
    createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if posted password was correct
    if (!(await user.correctPassword(req.body.passwordCurrent))) {
        return next(new AppError("Your current password is incorrect", 400));
    }
    // 3) If correct, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    console.log(user.password, user.passwordConfirm);
    user.save();
    console.log(user.password);

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
