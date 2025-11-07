import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email service not configured');
    return;
  }
  
  if (!to || !subject || !html) {
    console.warn('Email skipped: missing required parameters');
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    console.warn('Email skipped: invalid email address');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"EventFlex" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendApplicationAcceptedEmail = async (workerEmail, workerName, jobTitle) => {
  const html = `
    <h2>Application Accepted!</h2>
    <p>Hi ${workerName},</p>
    <p>Great news! Your application for <strong>${jobTitle}</strong> has been accepted.</p>
    <p>Login to your dashboard to view details and connect with the organizer.</p>
    <p>Best regards,<br>EventFlex Team</p>
  `;
  await sendEmail(workerEmail, 'Application Accepted - EventFlex', html);
};

export const sendJobApplicationEmail = async (organizerEmail, organizerName, jobTitle, workerName) => {
  const html = `
    <h2>New Job Application</h2>
    <p>Hi ${organizerName},</p>
    <p><strong>${workerName}</strong> has applied for your job: <strong>${jobTitle}</strong></p>
    <p>Login to review the application and worker profile.</p>
    <p>Best regards,<br>EventFlex Team</p>
  `;
  await sendEmail(organizerEmail, 'New Job Application - EventFlex', html);
};

export const sendWorkStartReminderEmail = async (workerEmail, workerName, jobTitle, startTime) => {
  const html = `
    <h2>Work Reminder</h2>
    <p>Hi ${workerName},</p>
    <p>This is a reminder that your work for <strong>${jobTitle}</strong> starts at ${startTime}.</p>
    <p>Don't forget to check in using the QR code!</p>
    <p>Best regards,<br>EventFlex Team</p>
  `;
  await sendEmail(workerEmail, 'Work Reminder - EventFlex', html);
};

export default { sendApplicationAcceptedEmail, sendJobApplicationEmail, sendWorkStartReminderEmail };
