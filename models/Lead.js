// models/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },

    // Frontend mein dono possibilities handle ho rahi hain:
    // "services" (array) ya "service" (single string)
    services: [{ type: String, trim: true }],
    service: { type: String, trim: true },

    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "contacted", "closed", "converted"],
      default: "pending",
    },

    // Analytics + contacted-leads page ke liye:
    contacted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // isse createdAt & updatedAt auto aa jayega
  }
);

module.exports = mongoose.model("Lead", leadSchema);
