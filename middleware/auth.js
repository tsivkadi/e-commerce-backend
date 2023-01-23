const jwt = require("jsonwebtoken");
const {User} = require("../models/User");

exports.isAuthenticatedUser = async (req, res, next) => {
  const access_token  = req.cookies.access_token;

  if (!access_token) {
    return res.status(401).json({ 'message': 'Please, provide authorization header' });
  }

  try {
    const tokenPayload = jwt.verify(access_token, 'secret-jwt-key');
    req.user = await User.findById(tokenPayload.id)
    next();
  } catch (err) {
    return res.status(401).json({message: err.message + access_token});
  }

}

exports.authorizeRoles = (req, res, next) => {
    if (!req.user.user === false) {
      return next('You are not admin');
    }
    next();
  };