const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "approved", "rejected", "completed", "cancelled"]
    },
    startTime: {
      type: String, // Format: HH:mm (24-hour format)
      required: true,
    },
    endTime: {
      type: String, // Format: HH:mm (24-hour format)
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 10,
      max: 35,
    },
    reason: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 });

// Virtual for checking if appointment time has passed
appointmentSchema.virtual('isPast').get(function() {
  const appointmentDateTime = new Date(`${this.date} ${this.startTime}`);
  return appointmentDateTime < new Date();
});

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
