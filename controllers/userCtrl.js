const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require('../models/appointmentModel');
const moment = require('moment');
const {
  validateDuration,
  isSlotAvailable,
  calculateEndTime,
  getBreakTimesForDay,
  validateAppointmentDate,
  generateTimeSlots,
  formatAppointmentResponse
} = require('../utils/appointmentUtils');

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
//BOOK APPOINTMENT - Enhanced with conflict detection and duration validation
const bookAppointmentController = async (req, res) => {
  try {
    const { doctorId, date, startTime, duration, userId, userInfo, reason } = req.body;

    // Validate required fields
    if (!doctorId || !date || !startTime || !duration) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: doctorId, date, startTime, duration"
      });
    }

    // Validate duration (10-35 minutes)
    if (!validateDuration(duration)) {
      return res.status(400).send({
        success: false,
        message: "Appointment duration must be between 10 and 35 minutes"
      });
    }

    // Validate date
    const dateValidation = validateAppointmentDate(date);
    if (!dateValidation.valid) {
      return res.status(400).send({
        success: false,
        message: dateValidation.reason
      });
    }

    // Get doctor information
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }

    if (doctor.status !== 'approved') {
      return res.status(400).send({
        success: false,
        message: "Doctor is not approved to accept appointments"
      });
    }

    // Calculate end time
    const endTime = calculateEndTime(startTime, duration);

    // Get existing appointments for this doctor on this date
    const existingAppointments = await appointmentModel.find({
      doctorId,
      date,
      status: { $in: ['pending', 'approved'] }
    });

    // Get break times for the specific day
    const breakTimes = getBreakTimesForDay(doctor.breakTimes || [], date);

    // Check if slot is available
    const availability = isSlotAvailable(
      startTime,
      endTime,
      existingAppointments,
      doctor.timings,
      breakTimes
    );

    if (!availability.available) {
      return res.status(409).send({
        success: false,
        message: availability.reason
      });
    }

    // Create appointment
    const appointmentData = {
      userId,
      doctorId,
      doctorInfo: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        feesPerConsultation: doctor.feesPerConsultation,
        userId: doctor.userId
      },
      userInfo,
      date,
      startTime,
      endTime,
      duration,
      reason: reason || '',
      status: "pending"
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Notify doctor
    const doctorUser = await userModel.findOne({ _id: doctor.userId });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "New-appointment-request",
        message: `New appointment request from ${userInfo.name} on ${date} at ${startTime}`,
        onClickPath: "/doctor/appointments",
      });
      await doctorUser.save();
    }

    res.status(201).send({
      success: true,
      message: "Appointment booked successfully",
      data: formatAppointmentResponse(newAppointment)
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).send({
      success: false,
      message: "Error while booking appointment",
      error: error.message
    });
  }
};

// Check booking availability - Enhanced version
const bookingAvailabilityController = async (req, res) => {
  try {
    const { doctorId, date, startTime, duration } = req.body;

    if (!doctorId || !date || !startTime || !duration) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: doctorId, date, startTime, duration"
      });
    }

    // Validate duration
    if (!validateDuration(duration)) {
      return res.status(400).send({
        success: false,
        message: "Duration must be between 10 and 35 minutes"
      });
    }

    // Validate date
    const dateValidation = validateAppointmentDate(date);
    if (!dateValidation.valid) {
      return res.status(400).send({
        success: false,
        message: dateValidation.reason
      });
    }

    // Get doctor
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }

    // Calculate end time
    const endTime = calculateEndTime(startTime, duration);

    // Get existing appointments
    const existingAppointments = await appointmentModel.find({
      doctorId,
      date,
      status: { $in: ['pending', 'approved'] }
    });

    // Get break times for the day
    const breakTimes = getBreakTimesForDay(doctor.breakTimes || [], date);

    // Check availability
    const availability = isSlotAvailable(
      startTime,
      endTime,
      existingAppointments,
      doctor.timings,
      breakTimes
    );

    res.status(200).send({
      success: availability.available,
      message: availability.reason,
      available: availability.available,
      slot: availability.available ? { startTime, endTime, duration } : null
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).send({
      success: false,
      message: "Error checking availability",
      error: error.message
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

// Get Available Time Slots for a Doctor on a Specific Date
const getAvailableSlotsController = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters: doctorId, date"
      });
    }

    // Validate date
    const dateValidation = validateAppointmentDate(date);
    if (!dateValidation.valid) {
      return res.status(400).send({
        success: false,
        message: dateValidation.reason
      });
    }

    // Get doctor
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }

    if (doctor.status !== 'approved') {
      return res.status(400).send({
        success: false,
        message: "Doctor is not accepting appointments"
      });
    }

    // Get existing appointments for this date
    const existingAppointments = await appointmentModel.find({
      doctorId,
      date,
      status: { $in: ['pending', 'approved'] }
    });

    // Get break times for the specific day
    const breakTimes = getBreakTimesForDay(doctor.breakTimes || [], date);

    // Generate available slots
    const consultationDuration = doctor.consultationDuration || 20;
    const slotBuffer = doctor.slotBuffer || 0;
    
    const availableSlots = generateTimeSlots(
      doctor.timings,
      existingAppointments,
      consultationDuration,
      breakTimes,
      slotBuffer
    );

    res.status(200).send({
      success: true,
      message: "Available slots fetched successfully",
      data: {
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        date,
        consultationDuration,
        totalSlots: availableSlots.length,
        slots: availableSlots,
        workingHours: doctor.timings,
        breakTimes
      }
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).send({
      success: false,
      message: "Error fetching available slots",
      error: error.message
    });
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
  getAvailableSlotsController,
};
