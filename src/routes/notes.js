const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const { isAuth } = require("../helpers/auth");
const User = require("../models/Users");
router.get("/notes/add", isAuth, (req, res) => {
  res.status(200).render("notes/new-notes.hbs");
});
router.post("/notes/new-notes", isAuth, async (req, res) => {
  const { title, description } = req.body;
  let errors = [];
  if (!title) {
    errors.push({ text: "Escriba un titulo" });
  }
  if (!description) {
    errors.push({ text: "Escriba un description" });
  }
  if (errors.length > 0) {
    res.status(500).render("notes/new-notes.hbs", {
      errors,
      title,
      description,
    });
  } else {
    let date = new Date(Date.now());
    date.getDate();
    const NewNote = new Note({ title, description });
    NewNote.user = req.user.id;
    await NewNote.save();
    req.flash("success_msg", "Nota agregada");
    res.status(200).redirect("/notes");
  }
});
router.get("/notes", isAuth, async (req, res) => {
  await Note.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then((iterador) => {
      const contexto = {
        notes: iterador.map((e) => {
          return {
            title: e.title,
            description: e.description,
            _id: e._id,
          };
        }),
      };
      res.status(200).render("notes/all-notes.hbs", { notes: contexto.notes });
    });
});
router.get("/notes/edit/:id", isAuth, async (req, res) => {
  const dataNota = await Note.findById(req.params.id).lean();
  req.flash("success_msg", "Nota actualizada correcta");
  res.status(200).render("notes/edit-note.hbs", { dataNota });
});
router.put("/notes/edit-note/:id", isAuth, async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  await Note.findByIdAndUpdate(req.params.id, { title, description });
  res.status(200).redirect("/notes");
});
router.delete("/notes/delete/:id", isAuth, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(200).redirect("/notes");
});

module.exports = router;
