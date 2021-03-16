const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

}, { strict: false });

module.exports = mongoose.model("request", requestSchema, "requests");