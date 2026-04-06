const express = require('express');
const router = express.Router();
const ContactUs = require('../Models/ContactUs');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /contactUs - Submit contact form
router.post('/contactUs', async (req, res) => {
  const { name, email, subject, message } = req.body
  try {
    const contactUs = new ContactUs({ name, email, subject, message })
    await contactUs.save()

    // Send copy to admin email
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🔔 New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} <${email}></p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; white-space: pre-wrap;">${message}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from the website contact form.</p>
        </div>
      `
    };

    await transporter.sendMail(adminMailOptions);
    
    res.status(201).json({ message: "Message sent successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server Error" })
  }
});

// GET /contactus/show - Get all contact messages (admin)
router.get('/contactus/show', async (req, res) => {
  try {
    const messages = await ContactUs.find()
    res.status(200).json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server Error" })
  }
});

// POST /contactus/reply - Reply to contact message
router.post('/contactus/reply', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;

