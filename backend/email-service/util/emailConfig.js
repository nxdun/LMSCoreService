module.exports = {
    service: 'Zoho',
    auth: {
      user: 'udeeshagamage12@yahoo.com', // Replace with your Zoho email
      pass: 'ubiataya122', // Replace with your Zoho password or an app-specific password
    },
    host: 'smtp.zoho.com',
    port: 465, // Use 587 if you prefer to use STARTTLS instead of SSL
    secure: true, // Use true for 465, false for other ports
    activationEmail: {
      from: 'udeeshagamage12@yahoo.com', // This should be the same as the user
      subject: 'Activate Your Account',
      text: (activationLink) => `Click on the following link to activate your account: ${activationLink}`,
    },
    resetPassword: {
      from: 'udeeshagamage12@yahoo.com', // This should be the same as the user
      subject: 'Reset Your Password',
      text: (resetLink) => `Click on the following link to reset your password: ${resetLink}`,
    },
};
