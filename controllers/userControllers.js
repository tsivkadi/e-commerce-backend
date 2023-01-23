const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register
const registerUser = async (req, res, next) => {
  const { username, password, password2, email } = req.body;

  if(password === password2 && password > 6){
    const user = new User({
      username,
      password: await bcrypt.hash(password, 10),
      email
    });

    const exist = await User.findOne({ username: req.body.username });

    if(exist){
      res.send('This username is already taken')
    }else{
      user.save()
      .then(saved => res.json({message: 'user was successfully created'}))
      .catch(err => {
        next(err)
      })}
    }else{
      res.send('Password is invalid')
    }
};

// login user
const loginUser = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  
  if (user && await bcrypt.compare(String(req.body.password), String(user.password))){
    const payload = { username: user.username, id: user._id };
    const jwt_token = jwt.sign(payload, 'secret-jwt-key');
    return res
    .cookie("access_token", jwt_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000*600)
    })
    .status(200)
    .json(jwt_token)
  }else{
    return res.status(400).json({error: 'Password is unvalid'});
  }
};

// logout user
const logout = async (req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out" });
};


// get user details
const getUserDetails = async (req, res) => {
  const user = await User.findById(req.user.id)
  res.status(200).json(user);
};

// update user password
const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next();
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next();
  }

  user.password = req.body.newPassword;

  await user.save();
  res.status(200).send('password has been changed successfully');
};

// update user profile
const updateProfile = async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData);

  res.status(200).json(user);
};

// get all users(admin)
const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
};

// get single user (admin)
const getSingleUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next();
  }

  res.status(200).json(user);
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  getUserDetails,
  logout
}
