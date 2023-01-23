const mongoose = require('mongoose');

const Product = mongoose.model('Product-e', {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: new Date()
  },
  price: {
    type: Number,
    required: [true, "Please Enter product Price"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
}],
  category: {
    type: String,
    required: [true, "Please Enter Product Category"],
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User-e",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = {
  Product
};