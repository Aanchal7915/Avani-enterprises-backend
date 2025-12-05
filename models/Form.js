// const mongoose = require("mongoose");

// const formSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   service: String,
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Form", formSchema);







const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  // allow multiple services to be selected
  services: {
    type: [String],
    default: []
  },
  // additional notes field
  notes: {
    type: String,
    default: ""
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", formSchema);

