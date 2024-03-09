import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import { htmlCode } from "./email.template.js";
import { htmlChangePass } from "./chang_password.template.js";


export const sendEmail = async (email, type) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.USER_GMAIL,
      pass: process.env.PASSWORD_GMAIL,
    },
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET_FORGET_PASS)
  let test = htmlCode(token)
  if (type == 'forgetPassword') test = htmlChangePass/(token)
  const info = await transporter.sendMail({
    from: `"E-commerce App" <${process.env.USER_GMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "can you verify email now", // Subject line
    html: test, // html body

  });
  console.log("Message sent: %s", info.messageId);

}