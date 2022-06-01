const helper = {};

helper.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("errors_msg", "no autorizado");
    res.redirect("/user/singin");
  }
};
helper.admin = (req, res, next) => {
  if (req.user.email == "yegor@work.com") {
    return next();
  } else {
    res.redirect("/user/singin");
  }
};

module.exports = helper;
