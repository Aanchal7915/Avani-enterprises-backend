const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  service: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", formSchema);
