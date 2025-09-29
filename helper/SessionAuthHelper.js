// Middleware to check if user is authenticated via session
exports.requireLogin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/signin");
  }
};

// Middleware to check if user is already logged in (for signin/signup pages)
exports.requireGuest = function (req, res, next) {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};
