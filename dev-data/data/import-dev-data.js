const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

// 利用config.env 設置環境變數
dotenv.config({ path: "./config.env" });

// connect to database
const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log("DB connection successful");
    });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

// // Import Data Into Database
// const importData = async () => {
//     try {
//         await Tour.create(tours);
//         console.log("Import data successfully");
//     } catch (error) {
//         console.log(error);
//     }
//     process.exit();
// };

// // Delete Data From Database
// const deleteData = async () => {
//     try {
//         await Tour.deleteMany();
//         console.log("Delete data successfully");
//     } catch (error) {
//         console.log(error);
//     }
//     process.exit();
// };

// // option
// if (process.argv[2] === "--import") {
//     importData();
// } else if (process.argv[2] === "--delete") {
//     deleteData();
// }

/////////////////////Another Way to do it//////////////////////////////
const importData = async () => {
    await Tour.create(tours);
    await User.create(users, {
        validateBeforeSave: false
    });
    await Review.create(reviews);
    console.log("Data succesfully loaded");
};

const deleteData = async () => {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data succesfully deleted");
};

(async () => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        if (process.argv[2] === "--delete") {
            await deleteData();
        } else if (process.argv[2] === "--import") {
            await importData();
        } else {
            console.log("Please specify '--import' or '--delete'");
        }
        await mongoose.disconnect();
    } catch (err) {
        console.log(err);
    }
})();
////////////////////////////////////////////////////////////////////////
