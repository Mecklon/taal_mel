const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    secure:true,
    service:"gmail",
    port:465,
    auth:{
        user:"fernandesmecklon3@gmail.com",
        pass:"lfqmqawtwgdigywc"
    } 
})


const sendMail = (to,otp)=>{
    const sub = "Your Taal-Mel verification code is "+otp
    const msg = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Taal-Mel OTP Verification</title><style>body{font-family:Arial,sans-serif;background-color:#f8f9fa;margin:0;padding:0;}.email-container{max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}.header{background-color:rgb(0,0,124);color:#ffffff;text-align:center;padding:20px;}.header h1{margin:0;font-size:24px;}.body{padding:20px;color:#333333;line-height:1.6;}.body h2{color:rgb(0,0,124);font-size:20px;}.otp{font-size:24px;font-weight:bold;color:rgb(0,0,124);text-align:center;padding:15px 0;border:1px dashed rgb(0,0,124);margin:20px auto;display:inline-block;width:fit-content;}.footer{text-align:center;padding:20px;background-color:#f1f1f1;font-size:14px;color:#777777;}.footer a{color:rgb(0,0,124);text-decoration:none;}</style></head><body><div class="email-container"><div class="header"><h1>Taal-Mel</h1><p>Your Musical Networking Platform</p></div><div class="body"><h2>OTP Verification</h2><p>Hello,</p><p>We received a request to verify your email for Taal-Mel. Please use the OTP below to complete the process:</p><div class="otp">${otp}</div><p>If you did not request this verification, please ignore this email </p><p>Thank you for choosing Taal-Mel!</p></div><div class="footer"><p>&copy; 2024 Taal-Mel. All rights reserved.</p><p><a href="#">Contact Support</a> | <a href="#">Visit Website</a></p></div></div></body></html>`
    transporter.sendMail({
        to:to,
        subject:sub,
        html:msg
    })
}

module.exports = sendMail