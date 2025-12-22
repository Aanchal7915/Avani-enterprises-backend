const mongoose = require("mongoose");

const avaniFormSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phoneNu: {
      type: String,
      trim: true,
    },
    service: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    projectDetails: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AvaniForm", avaniFormSchema);
