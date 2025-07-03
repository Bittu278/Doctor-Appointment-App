const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require('../models/appointmentModel')
const moment = require('moment');

// Register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).send({ message: "User Already Exist", success: false });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const newUser = new userModel({
      ...req.body,
      password: hashedPassword
    });
    
    await newUser.save();
    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ 
      success: false, 
      message: "Registration failed"
    });
  }
};

// Login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ message: "User Not Found", success: false });
    }
    if (user.isBlocked) {
      return res.status(403).send({ message: "Your account is blocked. Contact admin.", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid Email or Password", success: false });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ 
      success: false, 
      message: "Login failed" 
    });
  }
};

// Auth callback
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.password = undefined;
    if (!user) {
      return res.status(404).send({ message: "User Not Found", success: false });
    }
    
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Authentication error"
    });
  }
};

// Apply Doctor Controller
const applyDoctorController = async (req, res) => {
  try {
    // Add userId from authenticated user
    const doctorData = {
      ...req.body,
      userId: req.body.userId
    };

    // Create new doctor
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    // Find admin user
    const adminUser = await userModel.findOne({ isAdmin: true });
    if (adminUser) {
      adminUser.notification.push({
        type: 'apply-doctor-request',
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.firstName + " " + newDoctor.lastName,
          onClickPath: '/admin/doctors'
        }
      });
      await adminUser.save();
    }

    // Update user role to doctor
    await userModel.findByIdAndUpdate(req.body.userId, {
      isDoctor: true,
      role: "doctor"
    });

    res.status(201).send({
      success: true,
      message: "Doctor application submitted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in doctor application",
      error
    });
  }
};


//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    // Add current notifications to seennotification
    user.seennotification.push(...user.notification);
    // Clear current notifications
    user.notification = [];
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

//delete all READ notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    // Only clear seen (read) notifications
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password=undefined;
    res.status(200).send({
      success: true,
      message: "Read notifications deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Unable to delete notifications",
      success: false,
      error,
    });
  }
}

//get all doc 
const getAllDoctorsControllers = async(req,res)=>{
  try {
    const doctors =  await doctorModel.find({status:"approved"});
    res.status(200).send({
      success: true,
      message: "Doctors Lists Fetcched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while Fetching Doctor",
      success: false,
      error,
    });
  }
}
//BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date,'DD-MM-YYYY').toISOString();
    req.body.time = moment(req.body.time,'HH:mm').toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New-appointment-request",
      message: `A new Appointment Request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available at this time",
        success: false, // <-- fix here
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async(req,res) =>{
  try {
     const appointments= await appointmentModel.find({userId:req.body.userId})
     res.status(200).send({
        message: "User Appointments Fetch Successfully",
        success: true,
        data:appointments, 
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Failed to Fetch Appointments",
    });
  }
}

// Get User Profile
const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    user.password = undefined; // Don't send password
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching profile", error });
  }
};

// Update User Profile
const updateUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.body.userId, req.body, { new: true });
    user.password = undefined;
    res.status(200).send({ success: true, data: user, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating profile", error });
  }
};


module.exports = { 
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
  updateUserProfileController,
};
