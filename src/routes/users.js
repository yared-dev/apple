const express = require("express");
const router = express.Router();

const User = require("../models/Users");
const passport = require("passport");

router.get("/user/singin", (req, res) => {
  res.status(200).render("users/singin.hbs");
});
router.post(
  "/user/singin",
  passport.authenticate("local", {
    successRedirect: "/jobs/all-job",
    failureRedirect: "/user/singin",
    failureFlash: true,
  })
);
router.get("/user/singup", (req, res) => {
  res.status(200).render("users/singup.hbs");
});
router.post("/user/singup", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  const errors = [];
  if (password != confirmpassword) {
    errors.push({ text: "las contraseñas no coinciden" });
  }
  if (password.length < 4) {
    errors.push({ text: "la contra debe ser 4 caracteres" });
  }
  if (errors.length > 0) {
    res.render("users/singup.hbs", {
      errors,
      name,
      email,
      password,
      confirmpassword,
    });
  } else {
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      req.flash("errors_msg", "el correo ya esta en uso");
      res.status(200).redirect("/user/singup");
    } else {
      const newUser = new User({ name, email, password });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash("success_msg", "estas registrado");
      res.status(200).redirect("/user/singin");
    }
  }
});
router.get("/user/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
