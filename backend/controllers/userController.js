const Messages = require("../constants/Message");
const JsonResponse = require("../helper/JsonResponse");
const TryCatch = require("../helper/TryCatch");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Mailer = require("../helper/Mailer");

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

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://dsatracker.atharvajadhav.com";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

//FORGOT PASSWORD
exports.apiForgotPassword = async function (req, res) {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email) {
    res.locals.message = new Messages().EMAIL_REQUIRED;
    return new JsonResponse(req, res).jsonError();
  }

  let user = new User();
  let userDoc = await user.findByEmail(email);

  // Skip silently for unknown emails or repeat requests within the cooldown,
  // so the response never reveals whether an account exists
  const recentlyRequested =
    userDoc?.resetPasswordRequestedAt &&
    Date.now() - new Date(userDoc.resetPasswordRequestedAt).getTime() <
      RESET_REQUEST_COOLDOWN_MS;

  if (userDoc && !recentlyRequested) {
    const token = crypto.randomBytes(32).toString("hex");
    await user.saveResetToken(
      userDoc._id,
      hashToken(token),
      new Date(Date.now() + RESET_TOKEN_TTL_MS)
    );

    try {
      await Mailer.sendPasswordResetEmail(
        userDoc.email,
        userDoc.name,
        `${FRONTEND_URL}/reset-password?token=${token}`
      );
    } catch (error) {
      console.error("Password reset email failed:", error.message);
      res.locals.status_code = 500;
      res.locals.message = new Messages().EMAIL_SEND_FAILED;
      return new JsonResponse(req, res).jsonError();
    }
  }

  new JsonResponse(req, res).jsonSuccess(
    true,
    new Messages().RESET_EMAIL_SENT
  );
};

//RESET PASSWORD
exports.apiResetPassword = async function (req, res) {
  const { token, password } = req.body;

  if (!token || !password || password.length < 6) {
    res.locals.message = new Messages().INVALID_NEW_PASSWORD;
    return new JsonResponse(req, res).jsonError();
  }

  let user = new User();
  let result = await user.resetPasswordWithToken(hashToken(token), password);
  if (!result) {
    res.locals.message = new Messages().INVALID_RESET_TOKEN;
    return new JsonResponse(req, res).jsonError();
  }

  new JsonResponse(req, res).jsonSuccess(
    true,
    new Messages().PASSWORD_RESET_SUCCESS
  );
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

exports.getById = async function (req, res) {
  let user = new User();
  let userDoc = await user.getById(req.params.id);
  new JsonResponse(req, res).jsonSuccess(
    userDoc,
    new Messages().SUCCESSFULLY_RECEIVED
  );
};

exports.getByEmail = async function (req, res) {
  let user = new User();
  let userDoc = await user.findByEmail(req.params.email);
  console.log(userDoc);
  new JsonResponse(req, res).jsonSuccess(
    userDoc,
    new Messages().SUCCESSFULLY_RECEIVED
  );
};

exports.updateById = async function (req, res) {
  let user = new User();
  let userDoc = await user.updateById(req.params.id, req.body);
  new JsonResponse(req, res).jsonSuccess(
    userDoc,
    new Messages().SUCCESSFULLY_UPDATED
  );
};

exports.updateByEmail = async function (req, res) {
  let user = new User();
  let userDoc = await user.updateByEmail(req.params.email, req.body);
  new JsonResponse(req, res).jsonSuccess(
    userDoc,
    new Messages().SUCCESSFULLY_UPDATED
  );
};

exports.getAllUsers = async function (req, res) {
  let user = new User();
  let users = await user.getAllUsers();
  new JsonResponse(req, res).jsonSuccess(
    users,
    new Messages().SUCCESSFULLY_RECEIVED
  );
  return users;
};

exports.deleteById = async function (req, res) {
  let user = new User();
  await user.deleteById();
  new JsonResponse(req, res).jsonSuccess(
    true,
    new Messages().SUCCESSFULLY_DELETED
  );
};
