const express = require("express");
const userController = require("../Controller/userController");
const authController = require("../Controller/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

////////// router can view as a middlware -> 以下的動作都要先經過protect
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);
router.patch(
    "/updateMe",
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

// 以下的動作要是 admin 才可以執行
router.use(authController.restrictTo("admin"));

router
    .route("/")
    .get(userController.getAllUsers)
    .post(authController.signup);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
