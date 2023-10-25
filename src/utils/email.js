import nodemailer from "nodemailer";

export const sendPinConfirmation = async (email, pin) => {
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
      subject: "Pin Verification",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Confirmation Email</title>
        </head>
        <style>
          body {
            padding: 2rem;
            text-align: center;
            background-color: #f9f9f9;
          }
          * {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 24px;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .card {
            background-color: #fff;
            box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
            width: 100%;
            padding: 2rem;
            border-radius: 5px;
          }
        </style>
        <body>
          <img
            class="logoImage"
            width="100px"
            height="100px"
            src="https://bonik-vuetify.vercel.app/img/logo.6d0b86e2.svg"
            alt="shopping-cart"
            style="margin-top: -50px; padding-bottom: 7px"
          />
          <div class="card">
            <h3>Hello,</h3>
            <p>Please use the verification code below on the <b>Bonic Website</b></p>
            <br />
            <h2>${pin}</h2>
            <br />
            <p>
              If you didn't request this, you can ignore this email or let us know.
            </p>
            <br />
            <p>Thanks!</p>
            <b>Bonic team</b>
          </div>
        </body>
      </html>
         `,
    };

    transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error?.message);
  }
};
