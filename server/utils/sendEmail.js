const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP environment variables are set.
  // If not, log email to console as fallback for development.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n==================================================');
    console.log('📬  [DEVELOPMENT EMAIL FALLBACK]');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('==================================================\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define message options
  const message = {
    from: `${process.env.EMAIL_FROM || 'team@rentigo.in'}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(message);
  console.log(`Email sent successfully: ${info.messageId}`);
};

module.exports = sendEmail;
