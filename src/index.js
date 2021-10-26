if (process.env.NODE_ENV == "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const sesion = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

//initializatios
const app = express();
require("./database");
require("./config/passport");
//setings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("views engine", ".hbs");

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  sesion({
    secret: "mysecretapp",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.errors_msg = req.flash("errors_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

//routes
app.use(require("./routes/index"));
app.use(require("./routes/jobs"));
app.use(require("./routes/mensajes"));
app.use(require("./routes/notes"));
app.use(require("./routes/producto"));
app.use(require("./routes/total"));
app.use(require("./routes/users"));

//Static files
app.use(express.static(path.join(__dirname, "public")));

//server listening
app.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});
require("./config.js");
