const express = require("express");
const router = express.Router();



router.get("/", (req, res) => {
  res.status(200).render("index.hbs");
});
router.get("/iphone", (req, res) => {
  res.status(200).render("apple/iphone.hbs");
});
router.get("/iphone12/:id", (req, res) => {
  let path = req.params.id;
  let name = "iphone";
  res.status(200).render("apple/problemas.hbs", { path, name });
});
router.get("/ipad", (req, res) => {
  res.status(200).render("apple/ipad.hbs");
});
router.get("/ipad/:id", (req, res) => {
  let path = req.params.id;
  let name = "ipad";
  res.status(200).render("apple/problemas.hbs", { path, name });
});
router.get("/mac", (req, res) => {
  res.status(200).render("apple/mac.hbs");
});
router.get("/mac/:id", (req, res) => {
  let path = req.params.id;
  let name = "mac";
  res.status(200).render("apple/problemas.hbs", { path, name });
});

router.get("/ipod", (req, res) => {
  res.status(200).render("apple/ipod.hbs");
});
router.get("/ipod/:id", (req, res) => {
  let path = req.params.id;
  let name = "ipod";
  res.status(200).render("apple/problemas.hbs", { path, name });
});

module.exports = router;
