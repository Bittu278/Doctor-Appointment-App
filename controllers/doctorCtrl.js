const appointmentModel = require('../models/appointmentModel');
const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');

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
    // If you store doctorId as userId
    const appointments = await appointmentModel.find({ doctorId: req.body.doctorId });
    res.status(200).send({
      success: true,
      data: appointments,
      message: 'Doctor Appointments fetched successfully'
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Doc Appointments",
      error
    });
  }
};



const updateAppointmentStatusController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    const user = await userModel.findOne({ _id: appointment.userId });
    if (user) {
      user.notification.push({
        type: "Status Updated",
        message: `Your appointment has been ${status} by the doctor.`,
        onClickPath: "/doctor-appointments",
      });
      await user.save();
    }
    res.status(200).send({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating appointment status",
      error,
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
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true }
    );
    res.status(200).send({ success: true, data: doctor, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating profile", error });
  }
};






module.exports = { getDoctorInfoController, updateprofileController,getDoctorByIdController,doctorAppointmentController, updateAppointmentStatusController,getDoctorProfileController,
  updateDoctorProfileController, };
