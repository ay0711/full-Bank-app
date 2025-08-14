const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email, firstName, accountNumber) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to SecureBank - Account Created Successfully!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #007bff; text-align: center;">Welcome to SecureBank!</h2>
                <p>Dear ${firstName},</p>
                <p>Congratulations! Your bank account has been successfully created.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #007bff; margin-top: 0;">Your Account Details:</h3>
                    <p><strong>Account Number:</strong> ${accountNumber}</p>
                    <p><strong>Account Type:</strong> Savings Account</p>
                </div>
                <p>You can now:</p>
                <ul>
                    <li>Check your account balance</li>
                    <li>Transfer money to other accounts</li>
                    <li>View your transaction history</li>
                </ul>
                <p>Please keep your account number safe and secure.</p>
                <p>Thank you for choosing SecureBank!</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        // Error sending welcome email
    }
};

const sendTransactionEmail = async (email, name, type, amount, description, balance) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Transaction Alert - ${type === 'credit' ? 'Credit' : 'Debit'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #007bff; text-align: center;">${type === 'credit' ? 'Credit' : 'Debit'} Alert</h2>
                <p>Dear ${name},</p>
                <p>A ${type} transaction has occurred on your account.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Amount:</strong> ₦${amount}</p>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>New Balance:</strong> ₦${balance}</p>
                </div>
                <p>If you did not authorize this transaction, please contact support immediately.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        // Error sending transaction email
    }
};

module.exports = { sendWelcomeEmail, sendTransactionEmail };
