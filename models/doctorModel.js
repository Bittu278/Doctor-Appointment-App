const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    firstName: {
      type: String,
      required: [true, 'first name is required']
    },
    lastName: {
      type: String,
      required: [true, 'last name is required']
    },
    phone: {
      type: String,
      required: [true, 'phone number is required']
    },
    email: {
      type: String,
      required: [true, 'email is required']
    },
    website: {
      type: String,
    },
    address: {
      type: String,
      required: [true, 'address is required']
    },
    specialization: {
      type: String,
      required: [true, 'specialization is required']
    },
    experience: {
      type: String,
      required: [true, 'experience is required']
    },
    feesPerConsultation: {
      type: Number,
      required: [true, 'fee is required']
    },
    status:{
      type:String,
      default:"pending",
    },
    timings: {
      type: [String],
      required: [true, 'work timing is required']
    },
    consultationDuration: {
      type: Number,
      default: 20, // Default 20 minutes per consultation
      min: 10,
      max: 35
    },
    breakTimes: {
      type: [{
        startTime: String,
        endTime: String,
        days: [String] // e.g., ["Monday", "Wednesday"]
      }],
      default: []
    },
    slotBuffer: {
      type: Number,
      default: 0, // Buffer time between appointments in minutes
      min: 0,
      max: 15
    },
  },
  { timestamps: true }
);

const doctorModel = mongoose.model('doctors', doctorSchema);
module.exports = doctorModel;
