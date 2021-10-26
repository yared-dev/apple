const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { isAuth } = require("../helpers/auth");

router.get("/total", isAuth, async (req, res) => {
  const jobs = await Job.find();
  let total = 0;
  const precio = jobs.filter((e) => {
    total += e.precio;
  });
  res.status(200).render("total.hbs", { total });
});
module.exports = router;
