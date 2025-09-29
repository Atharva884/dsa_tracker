const Messages = require("../constants/Message");
const JsonResponse = require("../helper/JsonResponse");
const TryCatch = require("../helper/TryCatch");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// how long a token lasts before expiring
const tokenLasts = "365d";


//LOGIN
exports.apiLogin = async function (req, res) {
  let user = new User(req.body);

  let result = await user.login();
  if (result) {
    let data = {
      token: jwt.sign(
        { _id: user.data._id, name: user.data.name, email: user.data.email },
        process.env.JWTSECRET,
        { expiresIn: tokenLasts }
      ),
      id: user.data._id,
      name: user.data.name,
      role: "user",
    };

    new JsonResponse(req, res).jsonSuccess(data, "Login success");
  } else {
    res.locals.data = {
      isValid: false,
      loginFailed: true,
    };
    res.locals.message = new Messages().INVALID_CREDENTIALS;
    new JsonResponse(req, res).jsonError();
  }
};

//REGISTER
exports.apiRegister = async function (req, res) {
  let user = new User(req.body);
  console.log(req.body);

  let result = await user.register();
  if (result) {
    let data = {
      token: jwt.sign(
        { _id: user.data._id, name: user.data.fName, email: user.data.email },
        process.env.JWTSECRET,
        { expiresIn: tokenLasts }
      ),
      id: user.data._id,
      name: user.data.name,
      role: "user",
    };
    new JsonResponse(req, res).jsonSuccess(data, "Register success");
  } else {
    res.locals.data = {
      isVaild: false,
      authorizationFailed: true,
    };
    res.locals.message = regErrors;
    new JsonResponse(req, res).jsonError();
  }
};

//User Exists?
exports.doesEmailExist = async function (req, res) {
  // throw new Error("This is a dummy exception for testing");
  console.log(User.doesEmailExist(req.body.email));
  let emailBool = await User.doesEmailExist(req.body.email);
  new JsonResponse(req, res).jsonSuccess(
    emailBool,
    new Messages().SUCCESSFULLY_RECEIVED
  );
};



exports.getById = async function(req, res){
  let user = new User()
  let userDoc = await user.getById(req.params.id)
  new JsonResponse(req, res).jsonSuccess(userDoc, new Messages().SUCCESSFULLY_RECEIVED)

}

exports.getByEmail = async function(req, res){
  let user = new User()
  let userDoc = await user.findByEmail(req.params.email)
  console.log(userDoc)
  new JsonResponse(req, res).jsonSuccess(userDoc, new Messages().SUCCESSFULLY_RECEIVED)
}

exports.updateById = async function (req, res) {
  let user = new User();
  let userDoc = await user.updateById(req.params.id, req.body);
  new JsonResponse(req, res).jsonSuccess(userDoc, new Messages().SUCCESSFULLY_UPDATED);
};

exports.updateByEmail = async function (req, res) {
  let user = new User();
  let userDoc = await user.updateByEmail(req.params.email, req.body);
  new JsonResponse(req, res).jsonSuccess(userDoc, new Messages().SUCCESSFULLY_UPDATED);
};


exports.getAllUsers = async function(req, res){
  let user = new User()
  let users = await user.getAllUsers()
  new JsonResponse(req, res).jsonSuccess(users, new Messages().SUCCESSFULLY_RECEIVED)
  return users
}

exports.deleteById= async function(req, res){
 let user = new User();
 await user.deleteById()
 new JsonResponse(req, res).jsonSuccess(true, new Messages().SUCCESSFULLY_DELETED)
}

// ============= WEB VIEW CONTROLLERS =============

// Render Sign In Page
exports.showSignIn = function (req, res) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("signin", { 
    error: null,
    title: "Sign In - DSA Tracker" 
  });
};

// Render Sign Up Page
exports.showSignUp = function (req, res) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("signup", { 
    error: null,
    title: "Sign Up - DSA Tracker" 
  });
};

// Handle Sign Up
exports.handleSignUp = async function (req, res) {
  try {
    const { name, lName, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !lName || !email || !password) {
      return res.render("signup", {
        error: "All fields are required",
        title: "Sign Up - DSA Tracker"
      });
    }

    if (password !== confirmPassword) {
      return res.render("signup", {
        error: "Passwords do not match",
        title: "Sign Up - DSA Tracker"
      });
    }

    if (password.length < 6) {
      return res.render("signup", {
        error: "Password must be at least 6 characters",
        title: "Sign Up - DSA Tracker"
      });
    }

    // Check if email already exists
    let user = new User({ email });
    const emailExists = await user.doesEmailExist(email);

    if (emailExists) {
      return res.render("signup", {
        error: "Email already exists",
        title: "Sign Up - DSA Tracker"
      });
    }

    // Register user
    user = new User({ name, lName, email, password });
    await user.register();

    // Create session
    const userData = await user.findByEmail(email);
    req.session.user = {
      id: userData._id,
      name: userData.name,
      lName: userData.lName,
      email: userData.email,
      role: userData.role
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("signup", {
      error: "Something went wrong. Please try again.",
      title: "Sign Up - DSA Tracker"
    });
  }
};

// Handle Sign In
exports.handleSignIn = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.render("signin", {
        error: "Email and password are required",
        title: "Sign In - DSA Tracker"
      });
    }

    // Login
    let user = new User({ email, password });
    const loginSuccess = await user.login();

    if (!loginSuccess) {
      return res.render("signin", {
        error: "Invalid email or password",
        title: "Sign In - DSA Tracker"
      });
    }

    // Create session
    req.session.user = {
      id: user.data._id,
      name: user.data.name,
      lName: user.data.lName,
      email: user.data.email,
      role: user.data.role
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("signin", {
      error: "Something went wrong. Please try again.",
      title: "Sign In - DSA Tracker"
    });
  }
};

// Handle Logout
exports.handleLogout = function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/signin");
  });
};

// Dashboard (Protected Route)
exports.showDashboard = async function (req, res) {
  if (!req.session.user) {
    return res.redirect("/signin");
  }

  try {
    const Problem = require("../models/Problem");
    const problemModel = new Problem();
    const userId = req.session.user.id;
    
    // Get statistics
    const stats = await problemModel.getStats(userId);
    const hasProblems = await problemModel.userHasProblems(userId);

    // Get flash messages
    const uploadSuccess = req.session.uploadSuccess;
    const uploadError = req.session.uploadError;
    
    // Clear flash messages
    delete req.session.uploadSuccess;
    delete req.session.uploadError;

    res.render("dashboard", {
      user: req.session.user,
      title: "Dashboard - DSA Tracker",
      stats,
      hasProblems,
      uploadSuccess,
      uploadError
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.session.user,
      title: "Dashboard - DSA Tracker",
      stats: { total: 0, completed: 0, remaining: 0, progress: 0 },
      hasProblems: false,
      uploadSuccess: null,
      uploadError: "Failed to load dashboard data"
    });
  }
};