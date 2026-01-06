import nodemailer from "nodemailer";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./email.templates.js";
import { generateSimpleRandomString } from "../../../utils/stringUtils.js";
// Configure Nodemailer transporter (example with Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendVerificationEmail(receiver: string, OTP : string): Promise<void> {
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: receiver,
        subject: 'Email Verification',
        html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', OTP)
    };

    console.log(mailOptions)

    await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(receiver: string , resetURL : string): Promise<void> {
    if (typeof resetURL != "string") throw new Error("Invalid resetUrl")
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: receiver.trim(),
        subject: "AuthOne - Reset your password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL)
    };

    await transporter.sendMail(mailOptions);
}

export async function sendPwdResetSuccessEmail(receiver : string) : Promise<void> {
 const mailOptions = {
        from: process.env.EMAIL_USER,
        to: receiver.trim(),
        subject: "AuthOne - Your Password was changed",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE
    };

    await transporter.sendMail(mailOptions)
}
