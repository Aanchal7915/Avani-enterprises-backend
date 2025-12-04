require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const Form = require("./models/Form");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// API Endpoint
app.post("/submit-form", async (req, res) => {
  try {
    const { name, email, phone, service } = req.body;

    // 1. Save form data
    const newForm = await Form.create({ name, email, phone, service });

    // 2. SendGrid Email to Admin
    // const msg = {
    //   to: process.env.ADMIN_EMAIL,
    //   from: process.env.FROM_EMAIL, // must be verified in SendGrid
    //   subject: "New Form Submission Received",
    //   html: `
    //     <h2>New Service Inquiry</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Phone:</strong> ${phone}</p>
    //     <p><strong>Service:</strong> ${service}</p>
    //     <p>Time: ${new Date().toLocaleString()}</p>
    //   `,
    // };

    // await sgMail.send(msg);

    res.status(200).json({ message: "Form stored & email sent via SendGrid!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
