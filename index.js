// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const sgMail = require("@sendgrid/mail");
// const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Form = require("./models/Form");
// const User = require("./models/User");
// require("dotenv").config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

// // Set SendGrid API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // Middleware to verify JWT token
// const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ message: "Access Denied" });

//   try {
//     const verified = jwt.verify(
//       token.replace("Bearer ", ""),
//       process.env.JWT_SECRET
//     );
//     req.user = verified;
//     next();
//   } catch (err) {
//     res.status(400).json({ message: "Invalid Token" });
//   }
// };

// // --- AUTH ROUTES ---

// // generate 6 digit OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Signup - Step 1: Validate Admin Code, Create User (Unverified), Send OTP
// app.post("/auth/signup", async (req, res) => {
//   try {
//     const { name, email, password, adminCode } = req.body;

//     // 1. Validate Admin Code
//     const SECRET_CODE = process.env.ADMIN_SECRET_CODE || "12345678"; // Default fallback
//     if (adminCode !== SECRET_CODE) {
//       return res.status(403).json({ message: "Invalid Admin Code" });
//     }

//     // 2. Check if user exists
//     let user = await User.findOne({ email });
//     if (user && user.isVerified) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const otp = generateOTP();

//     if (user && !user.isVerified) {
//       // Update existing unverified user
//       user.name = name;
//       user.password = hashedPassword;
//       user.otp = otp;
//       user.otpExpires = Date.now() + 600000; // 10 mins
//       await user.save();
//     } else {
//       // Create new user
//       user = await User.create({
//         name,
//         email,
//         password: hashedPassword,
//         otp,
//         otpExpires: Date.now() + 600000,
//         isVerified: false,
//       });
//     }

//     // 3. Send OTP
//     const msg = {
//       to: email,
//       from: process.env.FROM_EMAIL,
//       subject: "Your Signup Verification OTP",
//       html: `<h3>Your OTP is: <span style="color:#4F46E5; font-size: 20px;">${otp}</span></h3><p>Valid for 10 minutes.</p>`,
//     };

//     if (process.env.FROM_EMAIL) await sgMail.send(msg);
//     else console.log(`OTP for ${email}: ${otp}`);

//     res.status(200).json({ message: "OTP sent to email. Please verify." });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Signup - Step 2: Verify OTP
// app.post("/auth/verify-signup", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(400).json({ message: "User not found" });
//     if (user.isVerified)
//       return res
//         .status(400)
//         .json({ message: "User already verified. Please login." });

//     if (user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     const token = jwt.sign(
//       { _id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );
//     res.status(200).json({
//       token,
//       user: { name: user.name, email: user.email },
//       message: "Account verified successfully!",
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Login
// app.post("/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ message: "Invalid email or password" });

//     if (!user.isVerified)
//       return res
//         .status(400)
//         .json({ message: "Account not verified. Please sign up again to verify." });

//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass)
//       return res.status(400).json({ message: "Invalid email or password" });

//     const token = jwt.sign(
//       { _id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res
//       .status(200)
//       .json({ token, user: { name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Forgot Password - Step 1: Send OTP
// app.post("/auth/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Generate OTP
//     const otp = generateOTP();

//     // Set otp and expiry
//     user.otp = otp;
//     user.otpExpires = Date.now() + 600000; // 10 mins
//     await user.save();

//     const msg = {
//       to: email,
//       from: process.env.FROM_EMAIL,
//       subject: "Password Reset OTP",
//       html: `<h3>Your Password Reset OTP is: <span style="color:#4F46E5; font-size: 20px;">${otp}</span></h3><p>Valid for 10 minutes.</p>`,
//     };

//     if (process.env.FROM_EMAIL) await sgMail.send(msg);
//     else console.log(`Reset OTP for ${email}: ${otp}`);

//     res.status(200).json({ message: "OTP sent to email." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Reset Password - Step 2: Verify OTP and Reset
// app.post("/auth/reset-password-otp", async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     user.password = hashedPassword;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // --- DATA ROUTES ---

// // Get All Leads (Protected)  -> Dashboard + Analytics isi /leads se data lenge
// app.get("/leads", authMiddleware, async (req, res) => {
//   try {
//     // Sort by newest first
//     const leads = await Form.find().sort({ createdAt: -1 });
//     res.json(leads);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// /**
//  * ✅ NEW: Mark a lead as contacted / update status
//  * PATCH /leads/:id/contact
//  * body example:
//  * { "contacted": true, "status": "contacted" }
//  */
// app.patch("/leads/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {  status } = req.body;

//     if(!["not interested", "contacted", "not responded"].includes(status)){
//       return res.status(404).json('status should one of among ["not interested", "contacted", "not responded"]');
//     }

//     const lead = await Form.findByIdAndUpdate(id, {status}, { new: true });

//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     res.json(lead);
//   } catch (err) {
//     console.error("Error updating lead:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Submit Form (Public) -> Website se user jab form fill karega
// app.post("/submit-form", async (req, res) => {
//   try {
//     // Support both old & new frontend shape:
//     // - name, email, phone, service, businessCategory
//     // - name, email, phone, services (array), notes
//     const {
//       name,
//       email,
//       phone,
//       services,
//       service,
//       businessCategory,
//       notes,
//     } = req.body;

//     // Ensure services is an array
//     let servicesArray = [];
//     if (Array.isArray(services)) {
//       servicesArray = services;
//     } else if (Array.isArray(service)) {
//       servicesArray = service;
//     } else if (service) {
//       servicesArray = [service];
//     }

//     const finalNotes = notes || businessCategory || "";

//     const primaryService = service || (servicesArray[0] || "");

//     // 1. Save form data (includes services array and notes)
//     const newForm = await Form.create({
//       name,
//       email,
//       phone,
//       services: servicesArray,
//       service: primaryService,
//       notes: finalNotes,
//       status: "pending",
//       contacted: false,
//     });

//     // 2. SendGrid Email to Admin (include services and notes)
//     if (process.env.ADMIN_EMAIL && process.env.FROM_EMAIL) {
//       const msg = {
//         to: process.env.ADMIN_EMAIL,
//         from: process.env.FROM_EMAIL, // must be verified in SendGrid
//         subject: "New Form Submission Received",
//         html: `
//             <h2>New Service Inquiry</h2>
//             <p><strong>Name:</strong> ${name || "—"}</p>
//             <p><strong>Email:</strong> ${email || "—"}</p>
//             <p><strong>Phone:</strong> ${phone || "—"}</p>
//             <p><strong>Services:</strong> ${
//               servicesArray.length
//                 ? servicesArray.map((s) => `<span>${s}</span>`).join(", ")
//                 : "—"
//             }</p>
//             <p><strong>Notes:</strong> ${
//               finalNotes
//                 ? `<div style="white-space:pre-wrap;">${finalNotes}</div>`
//                 : "—"
//             }</p>
//             <p>Time: ${new Date().toLocaleString()}</p>
//           `,
//       };
//       await sgMail.send(msg);
//       console.log("Email sent to admin.");
//     }

//     res
//       .status(200)
//       .json({ message: "Form stored & email sent via SendGrid!", data: newForm });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.listen(5000, () =>
//   console.log("Server running on http://localhost:5000")
// );






const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Form = require("./models/Form");
const User = require("./models/User");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// --- AUTH ROUTES ---

// generate 6 digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Signup - Step 1: Validate Admin Code, Create User (Unverified), Send OTP
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // 1. Validate Admin Code
    const SECRET_CODE = process.env.ADMIN_SECRET_CODE || "12345678"; // Default fallback
    if (adminCode !== SECRET_CODE) {
      return res.status(403).json({ message: "Invalid Admin Code" });
    }

    // 2. Check if user exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    if (user && !user.isVerified) {
      // Update existing unverified user
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = Date.now() + 600000; // 10 mins
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires: Date.now() + 600000,
        isVerified: false,
      });
    }

    // 3. Send OTP
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Your Signup Verification OTP",
      html: `<h3>Your OTP is: <span style="color:#4F46E5; font-size: 20px;">${otp}</span></h3><p>Valid for 10 minutes.</p>`,
    };

    if (process.env.FROM_EMAIL) await sgMail.send(msg);
    else console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent to email. Please verify." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Signup - Step 2: Verify OTP
app.post("/auth/verify-signup", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "User already verified. Please login." });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      token,
      user: { name: user.name, email: user.email },
      message: "Account verified successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(400).json({
        message: "Account not verified. Please sign up again to verify.",
      });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Forgot Password - Step 1: Send OTP
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = generateOTP();

    // Set otp and expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // 10 mins
    await user.save();

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Password Reset OTP",
      html: `<h3>Your Password Reset OTP is: <span style="color:#4F46E5; font-size: 20px;">${otp}</span></h3><p>Valid for 10 minutes.</p>`,
    };

    if (process.env.FROM_EMAIL) await sgMail.send(msg);
    else console.log(`Reset OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset Password - Step 2: Verify OTP and Reset
app.post("/auth/reset-password-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- DATA ROUTES ---

// Get All Leads (Protected)
app.get("/leads", authMiddleware, async (req, res) => {
  try {
    // Sort by newest first
    const leads = await Form.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Update lead status
 * PATCH /leads/:id
 * body example:
 * { "status": "contacted" }
 */
app.patch("/leads/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ UPDATED: include "interested" in allowed statuses
    const allowedStatuses = [
      "not interested",
      "contacted",
      "not responded",
      "interested",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(404).json({
        message:
          'status should be one of ["not interested", "contacted", "not responded", "interested"]',
      });
    }

    const lead = await Form.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Submit Form (Public)
app.post("/submit-form", async (req, res) => {
  try {
    // Support both old & new frontend shape:
    // - name, email, phone, service, businessCategory
    // - name, email, phone, services (array), notes
    const {
      name,
      email,
      phone,
      services,
      service,
      businessCategory,
      notes,
    } = req.body;

    // Ensure services is an array
    let servicesArray = [];
    if (Array.isArray(services)) {
      servicesArray = services;
    } else if (Array.isArray(service)) {
      servicesArray = service;
    } else if (service) {
      servicesArray = [service];
    }

    const finalNotes = notes || businessCategory || "";

    const primaryService = service || servicesArray[0] || "";

    // 1. Save form data (includes services array and notes)
    const newForm = await Form.create({
      name,
      email,
      phone,
      services: servicesArray,
      service: primaryService,
      notes: finalNotes,
      // ✅ UPDATED: default status aligned with frontend dropdown
      status: "not responded",
      contacted: false,
    });

    // 2. SendGrid Email to Admin (include services and notes)
    if (process.env.ADMIN_EMAIL && process.env.FROM_EMAIL) {
      const msg = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.FROM_EMAIL, // must be verified in SendGrid
        subject: "New Form Submission Received",
        html: `
            <h2>New Service Inquiry</h2>
            <p><strong>Name:</strong> ${name || "—"}</p>
            <p><strong>Email:</strong> ${email || "—"}</p>
            <p><strong>Phone:</strong> ${phone || "—"}</p>
            <p><strong>Services:</strong> ${
              servicesArray.length
                ? servicesArray.map((s) => `<span>${s}</span>`).join(", ")
                : "—"
            }</p>
            <p><strong>Notes:</strong> ${
              finalNotes
                ? `<div style="white-space:pre-wrap;">${finalNotes}</div>`
                : "—"
            }</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          `,
      };
      await sgMail.send(msg);
      console.log("Email sent to admin.");
    }

    res.status(200).json({
      message: "Form stored & email sent via SendGrid!",
      data: newForm,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
