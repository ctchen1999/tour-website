const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // this will only work when CREATE and SAVE!!!
            validator: function(val) {
                return val === this.password;
            },
            message:
                "password confirmation must equals to password you entered previously."
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpired: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// 把password 存在 database 危險 -> document middleware -> 作用在資料輸入確定沒問題，存進資料庫前對password加密
userSchema.pre("save", async function(next) {
    // Only run this if the password is really modified
    if (!this.isModified("password")) return next();

    // hash the password
    this.password = await bcrypt.hash(this.password, 12);
    // Delete passwordConfirm field -> passwordConfirm 不用存進database
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre("save", function(next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000; // 把更改密碼的時間往前移 -> 代表回到resetPassword function 後的token issued time 一定會在重置密碼後
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changePasswordAfter = function(JWTTimestap) {
    console.log(this.passwordChangedAt);
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10 // 基數
        );

        console.log(
            changedTimestamp,
            JWTTimestap,
            changedTimestamp > JWTTimestap
        );
        return changedTimestamp > JWTTimestap; // change after token was issued -> return true
        // 如果token 發行的時間 < 更改password 的時間，那這個token 應該要不能使用
    }

    return false; // default False, means not changed
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpired = Date.now() + 10 * 60 * 1000; // + 10mins
    return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
