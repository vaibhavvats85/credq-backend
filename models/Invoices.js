const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

}, { strict: false });

module.exports = mongoose.model("invoice", invoiceSchema, "invoices");