const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on("connected", () => {
  console.log("Connect Success Mongodb !");
});
mongoose.connection.on("error", (err) => {
  console.log("Error connecting!");
});
