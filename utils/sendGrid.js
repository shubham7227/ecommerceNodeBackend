const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ email, subject, content }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject,
    html: content,
  };
  return sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = sendMail;
