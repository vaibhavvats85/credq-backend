const app = require("./app");

require("dotenv").config();

const mongoose = require("mongoose");
const uri = `mongodb+srv://credq:${process.env.MONGO_SECRET}@cluster0.sxev6.mongodb.net/credq?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`server is listening on port ${process.env.PORT || 5000}`);
})