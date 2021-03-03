const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser')


require("dotenv").config();

// Configure MongoDB connection
const mongoose = require("mongoose");
const uri = `mongodb+srv://credq:${process.env.MONGO_SECRET}@cluster0.sxev6.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;
console.log(uri);
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

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/.netlify/functions/api',require('../routes/user'));

//Setup Error Handlers
const errorHandlers = require("../handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}
module.exports.handler = serverless(app);
