const { Order } = require("../models/Order");
const { Product } = require("../models/Product");

// create new order
const createOrder = async(req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json(order);
};

// get single order
const getSingleOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ("Order not found with this id");
  }

  res.status(200).json(order);
};

// get user`s orders
const myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json(orders);
};

// get all orders -- Admin
const getAllOrders = async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({totalAmount, orders});
};

// update order status -- Admin
const updateOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ("Order not found with this id");
  }

  if (order.orderStatus === "Delivered") {
    throw ("You have already delivered this order");
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json(order.orderStatus);
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete order -- Admin
const deleteOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ("Order not found with this id");
  }
  await order.remove();
  res.status(200).send('order was successfully deleted');
};

module.exports = {
  createOrder,
  getSingleOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
  myOrders
}