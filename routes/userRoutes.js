const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsControllers,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  getUserProfileController,
  updateUserProfileController
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/getUserData", authMiddleware, authController);
router.post("/apply-doctor", authMiddleware, applyDoctorController); 
router.post("/get-all-notification",authMiddleware,getAllNotificationController);
router.post("/delete-all-notification",authMiddleware,deleteAllNotificationController);
router.get("/getAllDoctors",authMiddleware,getAllDoctorsControllers);
router.post("/book-appointment",authMiddleware,bookAppointmentController);
router.post("/booking-availability",authMiddleware,bookingAvailabilityController);
router.post("/user-appointments",authMiddleware,userAppointmentsController);
router.post('/getProfile', authMiddleware, getUserProfileController);
router.post('/updateProfile', authMiddleware, updateUserProfileController);

module.exports = router;
