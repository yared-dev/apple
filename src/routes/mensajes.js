const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { celular, email, problema, phone } = req.body;
  // if (!celular) {
  // }
  // if (!email) {
  // }
  // if (!problema) {
  // }
  // if (!phone) {
  // }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "rodriguezloayzabill@gmail.com",
      pass: "loayza5429-",
    },
  });
  let mailOptions = await transporter.sendMail({
    from: "Remitente", // sender address
    to: "kevincanchari12z@gmail.com", // list of receivers
    subject: "Enviado Desde GreenApple", // Subject line
    text: "GREEN APPLE", // plain text body
    html: `<h1>Green Apple</h1>
            <br/>
            <h2>cliente :  ${email}</h2>
            <br/>
            <h2>Problema :  ${problema}</h2>
            <br/>
            <h2>Modelo :  ${phone}</h2>
            <br/>
          <h2>Telefono : ${celular}</h2>`, // html body
  });
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      console.log("Email Enviado");
      res.status(200).redirect("/");
    }
  });
});
module.exports = router;  
