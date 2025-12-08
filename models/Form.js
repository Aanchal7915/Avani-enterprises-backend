// // // const mongoose = require("mongoose");

// // // const formSchema = new mongoose.Schema({
// // //   name: String,
// // //   email: String,
// // //   phone: String,
// // //   service: String,
// // //   createdAt: { type: Date, default: Date.now },
// // // });

// // // module.exports = mongoose.model("Form", formSchema);







// // const mongoose = require("mongoose");

// // const formSchema = new mongoose.Schema({
// //   name: String,
// //   email: String,
// //   phone: String,
// //   // allow multiple services to be selected
// //   services: {
// //     type: [String],
// //     default: []
// //   },
// //   // additional notes field
// //   notes: {
// //     type: String,
// //     default: ""
// //   },
// //   createdAt: { type: Date, default: Date.now },
// // });

// // module.exports = mongoose.model("Form", formSchema);

// const mongoose = require("mongoose");

// const formSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },

//     // ✅ multiple services (analytics + tags)
//     services: {
//       type: [String],
//       default: [],
//     },

//     // ✅ optional single service (backward compatibility)
//     service: {
//       type: String,
//       trim: true,
//     },

//     // ✅ notes / business category
//     notes: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     // ✅ contacted lead or not (Contacted Leads page ke liye)
//     contacted: {
//       type: Boolean,
//       default: false,
//     },

//     // ✅ lead status (analytics + future conversions)
//     status: {
//       type: String,
//       enum: ["not interested", "contacted", "not responded"],
//       default: "pending",
//     },
//   },
//   {
//     // ✅ timestamps auto add karega: createdAt + updatedAt
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Form", formSchema);






const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // ✅ multiple services (analytics + tags)
    services: {
      type: [String],
      default: [],
    },

    // ✅ optional single service (backward compatibility)
    service: {
      type: String,
      trim: true,
    },

    // ✅ notes / business category
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // ✅ contacted lead or not (Contacted Leads page ke liye)
    contacted: {
      type: Boolean,
      default: false,
    },

    // ✅ lead status (analytics + future conversions)
    status: {
      type: String,
      enum: ["not interested", "contacted", "not responded", "interested"], // ✅ "interested" added
      default: "not responded", // ✅ default aligned with frontend
    },
  },
  {
    // ✅ timestamps auto add karega: createdAt + updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model("Form", formSchema);

