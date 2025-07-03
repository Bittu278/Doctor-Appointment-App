const express = require("express");
const authMiddleware = require("../middlewares/authmiddleware");
const { getDoctorInfoController,updateprofileController ,getDoctorByIdController,doctorAppointmentController,updateAppointmentStatusController,getDoctorProfileController,updateDoctorProfileController} = require("../controllers/doctorCtrl");

const router = express.Router();

//POST SINGLE DOC INFO
router.post('/getDoctorInfo',authMiddleware,getDoctorInfoController);
//POST UPDATE PROFILE
router.post('/updateprofile',authMiddleware,updateprofileController);
//POSTGET SINGLE DOC 
router.post('/getDoctorById',authMiddleware,getDoctorByIdController);
//GET APPOINTMENTS
router.post('/doctor-appointments',authMiddleware,doctorAppointmentController);

router.post('/update-appointment-status', authMiddleware, updateAppointmentStatusController);

router.post('/getProfile', authMiddleware, getDoctorProfileController);

router.post('/updateProfile', authMiddleware, updateDoctorProfileController);
module.exports = router;