const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//Khi dùng socketio thì thay server.listen và mở cors cho cổng client có thể giao tiếp
// const server = require("http").createServer(app);

//require middleware
const errorMiddleware = require("./src/middlewares/errors");

// Use Private key
require("dotenv").config("");
const PORT = process.env.PORT || 9009;
const HOST = process.env.HOST;
const NODE_ENV = process.env.NODE_ENV.toString();
// console.log(dotenv.parsed);

//Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down due to Uncaught Exceptions");

  process.exit(1);
});

//Kết nối server với database
require("./src/configs/connectDb");

//Gọi models
require("./src/models/productModel")();
require("./src/models/userModel")();
require("./src/models/orderModel")();

//Security
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
//Đọc dữ liệu kiểu json khi client gửi lên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Đọc cookie
app.use(cookieParser());

//Gọi router cho app chạy
const productRoutes = require("./src/routes/product");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const adminRoutes = require("./src/routes/admin");
const orderRoutes = require("./src/routes/order");
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", orderRoutes);

//Middleware to handle errors
app.use(errorMiddleware);

//Lắng nghe port
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}${PORT} in ${NODE_ENV} mode`);
});

//Xử lý lỗi khi MONGODB_URL bị sai
//Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
