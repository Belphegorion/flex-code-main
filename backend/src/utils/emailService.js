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

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'EventPro <noreply@eventpro.com>',
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to EventPro!',
    html: `<h1>Welcome ${user.name}!</h1><p>Thank you for joining EventPro.</p>`
  });
};

export const sendJobNotification = async (user, job) => {
  return sendEmail({
    to: user.email,
    subject: `New Job Match: ${job.title}`,
    html: `<h1>New Job Opportunity</h1><p>A job matching your skills is available: ${job.title}</p>`
  });
};
