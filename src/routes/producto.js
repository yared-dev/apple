const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const { isAuth } = require("../helpers/auth");
const Articulo = require("../models/Producto");
//añardir productos
router.get("/notes/productos/add/:id", isAuth, (req, res) => {
  const id = req.params.id;
  res.render("productos/new-articulo.hbs", { id });
});
router.get("/notes/productos/all-articulo/:id", isAuth, async (req, res) => {
  const articuloCount = await Articulo.find({ note: req.params.id });
  const id = req.params.id;
  if (articuloCount.length > 0) {
    res.render("productos/all-articulo.hbs", { articuloCount, id });
  } else {
    res.render("productos/new-articulo.hbs", { id });
  }
});
// agregar articulo
router.post("/notes/productos/add/:id", isAuth, async (req, res) => {
  const { title, description, precio,cant } = req.body;
  let errors = [];
  const id = req.params.id;
  console.log({ title, description, precio });
  if (!title) {
    errors.push({ text: "escriba un titulo" });
  }
  if (!description) {
    errors.push({ text: "escriba un description" });
  }
  if (!precio) {
    errors.push({ text: "escriba un precio" });
  }
  if (errors.length > 0) {
    res.status(500).render("productos/new-articulo.hbs", {
      errors,
      title,
      description,
      precio,
      id,
    });
  } else {
    const NewArticulo = new Articulo({ title, description, precio,cant });
    NewArticulo.note = req.params.id;
    await NewArticulo.save();
    req.flash("success_msg", "Articulo agregado");
    res.redirect("/notes/productos/all-articulo/" + req.params.id);
  }
});
//editar Articulo
router.get("/notes/productos/edit/:id", isAuth, async (req, res) => {
  const dataNota = await Articulo.findById(req.params.id).lean();
  req.flash("success_msg", "Articulo Actualizado");
  res.render("productos/edit-articulo.hbs", { dataNota });
});
router.put("/notes/productos/edit-articulo/:id", isAuth, async (req, res) => {
  const { title, description, precio, note,cant } = req.body;
  await Articulo.findByIdAndUpdate(req.params.id, {
    title,
    description,
    precio,
    cant,
  });
  res.redirect("/notes/productos/all-articulo/" + note);
});
router.delete("/notes/productos/delete/:id", isAuth, async (req, res) => {
  const { note } = req.body;
  await Articulo.findByIdAndDelete(req.params.id);
  res.redirect("/notes/productos/all-articulo/" + note);
});
router.get("/notes/productos/total/:id", async (req, res) => {
  const articulo = await Articulo.find({ note: req.params.id });
  let total = 0;
  let art="articulo"
  const precio = articulo.filter((e) => {
    total += parseInt(e.precio);
  });
  console.log(total);
  res.status(200).render("total.hbs", { total,art });
});

module.exports = router;
