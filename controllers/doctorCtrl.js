const appointmentModel = require('../models/appointmentModel');
const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');
const { formatAppointmentResponse, validateDuration } = require('../utils/appointmentUtils');

const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while getting doctor info",
      success: false,
      error,
    });
  }
};

// Update doctor profile
const updateprofileController = async (req, res) => {
  try {
    const updatedDoctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true } // Return updated document
    );
    
    if (!updatedDoctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error updating doctor profile",
      success: false,
      error,
    });
  }
};

// get doctor by id
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }
    res.status(200).send({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching doctor",
      error
    });
  }
};

const doctorAppointmentController = async (req, res) => {
  try {
    const { doctorId, status, date } = req.body;
    
    // Build query
    let query = { doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      query.date = date;
    }
    
    const appointments = await appointmentModel
      .find(query)
      .sort({ date: 1, startTime: 1 }); // Sort by date and time
    
    const formattedAppointments = appointments.map(apt => formatAppointmentResponse(apt));
    
    res.status(200).send({
      success: true,
      data: formattedAppointments,
      count: formattedAppointments.length,
      message: 'Doctor Appointments fetched successfully'
    });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).send({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
};



const updateAppointmentStatusController = async (req, res) => {
  try {
    const { appointmentId, status, notes } = req.body;
    
    if (!appointmentId || !status) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: appointmentId, status"
      });
    }
    
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }
    
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Notify patient
    const user = await userModel.findOne({ _id: appointment.userId });
    if (user) {
      let message = `Your appointment on ${appointment.date} at ${appointment.startTime} has been ${status}`;
      if (status === 'approved') {
        message += '. Please arrive 10 minutes early.';
      }
      
      user.notification.push({
        type: "appointment-status-updated",
        message,
        onClickPath: "/appointments",
      });
      await user.save();
    }
    
    res.status(200).send({
      success: true,
      message: `Appointment ${status} successfully`,
      data: formatAppointmentResponse(appointment),
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).send({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};
// Get Doctor Profile
const getDoctorProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }
    res.status(200).send({ success: true, data: doctor });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching profile", error });
  }
};

// Update Doctor Profile
const updateDoctorProfileController = async (req, res) => {
  try {
    const { consultationDuration, slotBuffer } = req.body;
    
    // Validate consultation duration if provided
    if (consultationDuration !== undefined && !validateDuration(consultationDuration)) {
      return res.status(400).send({
        success: false,
        message: "Consultation duration must be between 10 and 35 minutes"
      });
    }
    
    // Validate slot buffer if provided
    if (slotBuffer !== undefined && (slotBuffer < 0 || slotBuffer > 15)) {
      return res.status(400).send({
        success: false,
        message: "Slot buffer must be between 0 and 15 minutes"
      });
    }
    
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).send({ 
      success: true, 
      data: doctor, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).send({ 
      success: false, 
      message: "Error updating profile", 
      error: error.message 
    });
  }
};

// Get Doctor's Today Appointments
const getTodayAppointmentsController = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const appointments = await appointmentModel
      .find({
        doctorId,
        date: today,
        status: { $in: ['approved', 'pending'] }
      })
      .sort({ startTime: 1 });
    
    const formattedAppointments = appointments.map(apt => formatAppointmentResponse(apt));
    
    res.status(200).send({
      success: true,
      data: formattedAppointments,
      count: formattedAppointments.length,
      date: today,
      message: "Today's appointments fetched successfully"
    });
  } catch (error) {
    console.error('Fetch today appointments error:', error);
    res.status(500).send({
      success: false,
      message: "Error fetching today's appointments",
      error: error.message
    });
  }
};






module.exports = { 
  getDoctorInfoController, 
  updateprofileController,
  getDoctorByIdController,
  doctorAppointmentController, 
  updateAppointmentStatusController,
  getDoctorProfileController,
  updateDoctorProfileController,
  getTodayAppointmentsController
};
