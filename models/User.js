const mongoose = require('mongoose');

const User = mongoose.model('user-e', {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  user: {
    type: Boolean,
    default: true
  },
  orders: {
    type: Array,
    default: []
  }

});

module.exports = {
  User
};