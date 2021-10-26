const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost/node-db-app", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("DB connect"))
  .catch((err) => console.error(err));
