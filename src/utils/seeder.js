const Product = require("../models/productModel");

//Setting dotenv file
require("dotenv").config("");

//Connnect DB
require("../configs/connectDb");

const products = require("../data/productsdata.json");

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log("Product Are Deleted");

    await Product.insertMany(products);
    console.log("All Products are Added");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
