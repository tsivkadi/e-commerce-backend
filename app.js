const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

dotenv.config();

const COOKIE_SECRET = "veryLongString";

const app = express();
app.use(cookieParser(COOKIE_SECRET));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


mongoose.connect(process.env.MONGO_KEY)
.then(() => {
  console.log('MongoDB connected')
})
.catch(err => {
  console.log(err)
})

const product = require("./routes/productRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true}))
app.use("/", product);
app.use("/", user);
app.use("/", order);
const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server is running on port ${PORT}`));