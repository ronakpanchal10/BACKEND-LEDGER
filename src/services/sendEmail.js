const nodemailer = require("nodemailer")
const path = require("path")

const sendEmail = async (to, subject, text, filePath) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    }

    if (filePath) {
      mailOptions.attachments = [
        {
          filename: path.basename(filePath),
          path: filePath
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    console.log("Email sent successfully")

  } catch (error) {
    console.log("Email Error:", error)
  }
}

module.exports = sendEmail