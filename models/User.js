const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    organization: {
      type: String,
      required: "Organization is required!",
    },
    username: {
      type: String,
      required: "Username is required!",
    },
    password: {
      type: String,
      required: "Password is required!",
    },
    first_login:{
      type: Boolean,
    },
    applications: {
      type: String
    }
  }
);

module.exports = mongoose.model("user", userSchema, "users");