import nodemailer from "nodemailer"

export async function sendOtpEmail(to, otp) {
  // For dev: use Ethereal (https://ethereal.email/)
  const testAccount = await nodemailer.createTestAccount()
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  const info = await transporter.sendMail({
    from: '"Cognitia" <no-reply@cognitia.com>',
    to,
    subject: "Your Cognitia OTP Code",
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`,
  })

  // Preview URL for dev
  console.log("OTP email sent:", nodemailer.getTestMessageUrl(info))
}