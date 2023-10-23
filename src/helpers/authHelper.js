import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";
import formData from "form-data";
import Mailgun from "mailgun.js";
export const hashPassword = async (password) => {
  try {
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);
    return hashPassword;
  } catch (error) {
    console.log(error);
  }
};

export const camparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return null;
    }
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.log(error);
  }
};

export const checkRequiredField = (fieldName, fieldValue) => {
  if (
    fieldValue === undefined ||
    fieldValue === null ||
    (typeof fieldValue === "string" && fieldValue.trim() === "") ||
    (Array.isArray(fieldValue) && fieldValue.length === 0) ||
    (typeof fieldValue === "object" && Object.keys(fieldValue).length === 0)
  ) {
    throw new Error(`${fieldName} is required`);
  }
};
export const checkRequiredFields = (fields) => {
  for (const field of fields) {
    if (
      field === undefined ||
      field === null ||
      (typeof field === "string" && field.trim() === "") ||
      (Array.isArray(field) && field.length === 0) ||
      (typeof field === "object" && Object.keys(field).length === 0)
    ) {
      const fieldName = fields.find((value) => value === field);
      throw new Error(`${fieldName} is required`);
    }
  }
};
export const generateResetToken = (email) => {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};
export const generateToken = (email) => {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
  return token;
};
export const verifyToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.email;
  } catch (error) {
    throw new Error(error.message);
  }
};
// Function to send the password reset email
export const sendResetEmail = async (email, link) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      auth: {
        user: "www.hussainahmed2002@gmail.com",
        pass: "B128A2DCE74D27F1178E7352F3A71EBCC1C1",
      },
    });
    const mailOptions = {
      from: "Hussain Ahmad www.hussainahmed2002@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `<!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml" lang="EN">
        <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body style="padding: 0; margin: 0;">
          <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="body_table">
            <tbody>
              <tr>
                <td align="center" valign="top">
                  <table border="0" cellpadding="20" cellspacing="0" width="100%" style="background: #FFFFFF; border: 1px solid #EEEEFF; margin-top: 98px; margin-bottom: 69px; margin-left: auto; margin-right: auto; width: 600px; height: 1003px;">
                    <tbody>
                      <tr>
                        <td align="center" valign="top">
                          <img class="logoImage" width="48" height="48" src="https://img.icons8.com/fluency/48/shopping-cart.png" alt="shopping-cart" style="margin-top: -50px; padding-bottom: 7px;">
                          <table border="0" cellpadding="20" cellspacing="0" width="100%" id="content">
                            <tbody>
                              <tr>
                                <td align="center" valign="top">
                                  <span class="isDesktop">
                                    <h1 style="margin-bottom: 32px; font-weight: bold; font-size: 30px; font-family: 'Lato'; letter-spacing: 0px; color: #25254E;">
                                      Welcome to E-Commerce
                                    </h1>
                                    <p style="margin-top: 0px; font-weight: 300; font-size: 14px; letter-spacing: 0px; color: #4D4D80;">
                                      Trouble in logging in?
                                    </p>
                                  </span>
                                  <div class="greyLine" style="border: 1px solid #CED7F7; width: 100%; margin-top: 32px;"></div>
                                </td>
                              </tr>
                              <td align="center" valign="top">
                                <a href="${link}" target="_blank" style="text-decoration: none;">
                                  <button class="blueButton" style="background: #8AA1EB; border-radius: 10px; padding: 17px 35px; border: none; color: #FFFFFF; font-size: 15px; margin-bottom: 32px; cursor: pointer;">Reset Password</button>
                                </a>
                                <p style="font-weight: 300; font-size: 14px; letter-spacing: 0px; color: #4D4D80;">Reset Token will expires in 5 minuts</p>
                                <div class="greyLine" style="border: 1px solid #CED7F7; width: 100%; margin-top: 32px;"></div>
                                <div class="footerIcons" style="margin-top: 32px;">
                                  <a href="http://facebook.com" target="_blank" style="text-decoration: none;">
                                    <img src="https://api.elasticemail.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/facebook.png" alt="#" style="margin-left: 11px; margin-right: 11px;">
                                  </a>
                                  <a href="http://twitter.com" target="_blank" style="text-decoration: none;">
                                    <img src="https://api.elasticemail.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/twitter.png" alt="#" style="margin-left: 11px; margin-right: 11px;">
                                  </a>
                                  <a href="http://youtube.com" target="_blank" style="text-decoration: none;">
                                    <img src="https://api.elasticemail.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/youtube.png" alt="#" style="margin-left: 11px; margin-right: 11px;">
                                  </a>
                                  <a href="http://linkedin.com" target="_blank" style="text-decoration: none;">
                                    <img src="https://api.elasticemail.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/linkedin.png" alt="#" style="margin-left: 11px; margin-right: 11px;">
                                  </a>
                                </div>
                              </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
      `,
    };

    transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};
