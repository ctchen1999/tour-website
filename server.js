const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION. SHUTTING DOWN...");
    process.exit(1);
});

const app = require("./app");

// 利用config.env 設置環境變數

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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    console.log("UNHANDLER REJECTION. SHUTTING DOWN...");
    server.close(() => {
        process.exit(1);
    });
});
