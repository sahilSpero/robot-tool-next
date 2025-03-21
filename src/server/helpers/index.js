import bcrypt from "bcryptjs";
import RoboUser from "../models/RoboUser";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";

export const randomInt = () => Math.floor(100000 + Math.random() * 900000);
const fromMail = process.env.fromMail;
const sendGrid = process.env.sendGrid;
const JWT_SECRET = process.env.JWT_SECRET;

export const bcryptAuthCode = async (code) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code.toString(), salt);
};

export const fetchRoboUser = async (email, domains = []) => {
  let user = await RoboUser.findOne({ email });
  if (!user) {
    user = new RoboUser({ email, domains });
  }

  const authCode = randomInt();
  user.authCodeHash = await bcryptAuthCode(authCode);
  user.authCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  return authCode;
};

export const sentAuthCodeByEmail = async (email, authCode, type) => {
  sgMail.setApiKey(sendGrid);
  const isResend = type === "resend";
  const msg = {
    to: email,
    from: fromMail,
    subject: isResend
      ? `Your New Verification Code ${authCode}`
      : `Verify Your Email - Authentication Code ${authCode}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">${
            isResend ? "Resend Verification Code" : "Verify Your Email"
          }</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">${
            isResend
              ? "Here is your new authentication code:"
              : "Your authentication code is:"
          }</p>
          <div style="text-align: center; padding: 15px; background-color: #eef; border-radius: 8px; font-size: 24px; font-weight: bold; color: #007bff;">
            ${authCode}
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">This code is valid for <strong>5 minutes</strong>.</p>
          <p style="font-size: 14px; color: #777; text-align: center;">If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="text-align: center; font-size: 12px; color: #999;">© Copyright 2025. All rights reserved.</p>
        </div>
      `,
  };
  try {
    await sgMail.send(msg);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error(
      "Error sending email:",
      err.response ? err.response.body : err
    );
  }
};

export const findRoboUserbyEmail = (email) => {
  console.log(email, ">:user");
  return RoboUser.findOne({ email });
};

export const compareAuthCode = async (authCode, authCodeHash) => {
  return await bcrypt.compare(authCode, authCodeHash);
};
export const updateVerifyCode = async (user) => {
  const result = await authCodeCommonFunc(user);
  return result;
};

export  const authCodeCommonFunc = async (user) => {
  const authCode = await randomInt();
  const authCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  user.authCodeHash = await bcryptAuthCode(authCode);
  user.authCodeExpiresAt = authCodeExpiresAt;
  await user.save();
  return authCode;
};


export const roboUserVerify = (user) => {
  user.isVerified = true;
  return user.save();
};

export const generateTokenForRoboUser = async (user) => {
  return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: 360000,
  });
};


export const findRoboUserbyUserId = (userId, type) => {
  if (type === "authCodeHash") return RoboUser.findById(userId).select("-authCodeHash");
  if (type === "domains") return RoboUser.findById(userId).select("domains");
  if (type === "userId") return RoboUser.findById(userId);
};
