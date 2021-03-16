const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

require("dotenv").config();
const corsOptions = {
  //To allow requests from client
  origin: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://credq.org",
    "https://beta.credq.org",
    "https://frontend-dev.credq.org"
  ],
  credentials: true,
};

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

//Setup Error Handlers

if (process.env.ENV === "DEVELOPMENT") {
  app.use(require('../routes'));
  module.exports = app;
} else {
  // Configure MongoDB connection
  const mongoose = require("mongoose");
  const uri = `mongodb+srv://credq:${process.env.MONGO_SECRET}@cluster0.sxev6.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;
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
  app.use('/.netlify/functions/api', require('../routes'));
  module.exports.handler = serverless(app);
}

const errorHandlers = require("../handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
app.use(errorHandlers.productionErrors);

