const { Product } = require("../models/Product");
const cloudinary = require('../utils/cloudinary')

// create product
const createProduct = async (req, res, next) => {
  const exist = await Product.findOne({ name: req.body.name });

  if(exist){
    res.send('This product is already here')
  }else{
    const product = new Product(req.body)
    product.save()
    .then(saved => res.json({message: 'Product was created successfully'}))
    .catch(err => {
      next(err)
  })}
};

// get all products
const getAllProducts = async (req, res, next) => {
  const products = await Product.find();
  if(req.query){
    const filter = req.query
    var filteredProducts = products.filter((product) => {
      let isValid = true;
      for (key in filter) {
        console.log(key, user[key], filter[key]);
        isValid = isValid && user[key] == filter[key];
      }
      return isValid;
    })
  }

  res.status(200).json({products, filteredProducts});
};

// get all product
const getAdminProducts = async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json(products);
};

// get product details
const getProductDetails = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ("Product not found")
  }

  res.status(200).json(product);
};

// update product
const updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new Error ("Product not found");
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push(result);
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json(product);
};

// delete product
const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ("Product not found");
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await product.remove();

  res.status(200).json({message: "Product Delete Successfully"});
};

// create review
const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json(product);
};

// get all review
const getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    throw ("Product not found");
  }

  res.status(200).json({reviews: product.reviews});
};

// delete review
const deleteReview = async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.params.productId,{reviews, ratings, numOfReviews});

  res.status(200).json(product);
};

module.exports = {
  createProduct,
  getAllProducts,
  getAdminProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview
}