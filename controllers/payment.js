const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const constants = require('../utils/constants');
const Razorpay = require("razorpay");
const { nanoid } = require('nanoid');
const { cookieToken } = require("../utils/service");
const crypto = require('crypto');
const Invoice = require('../models/Invoices');

exports.orders = async (req, res) => {
    try {
        const { noOfApplications, plan } = req.body;
        const amount = Math.round(parseInt(noOfApplications) * constants.applications[plan.toLowerCase()] * 100 || 0);
        const token = cookieToken(req);
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            else {
                const instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_SECRET,
                });
                const options = {
                    amount: amount, // amount in smallest currency unit
                    currency: "INR",
                    receipt: `receipt_order_${nanoid()}`,
                };
                instance.orders.create(options, (err, order) => {
                    if (err) {
                        return res.status(500).send("Some error occured");
                    } else {
                        res.status(200).json({ ...order, razorpay_key: process.env.RAZORPAY_KEY_ID });
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.success = async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });
        else {
            // GENERATE INVOICE ON SUCCESSFUL TRANSACTION
            generateInvoice(req);
            // THE PAYMENT IS LEGIT & VERIFIED
            // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

            res.json({
                msg: "success",
                orderId: razorpayOrderId,
                paymentId: razorpayPaymentId,
            });
        }


    } catch (error) {
        res.status(500).send(error);
    }
}

const generateInvoice = async (req) => {
    try {
        const { plan, user, amount } = req.body;
        const { line1, line2, zipcode, city, state } = user.billing_address;
        const options = {
            type: "invoice",
            description: `${plan} plan`,
            
            customer: {
                name: user.organization,
                contact: user.phone,
                email: user.email,
                billing_address: {
                    line1,
                    line2,
                    zipcode,
                    city,
                    state,
                    country: "in"
                }
            },
            line_items: [
                {
                    "name": "Credq",
                    "description": "Essentials Plan",
                    "amount": amount,
                    "currency": "INR",
                    "quantity": 1
                }
            ],
            sms_notify: 1,
            email_notify: 1,
        };
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const invoice = await instance.invoices.create(options);
        if (!invoice) throw 'Invoice not created';
        const updatedInvoice = { ...invoice, invoice_number: invoice.id, user: user.username };
        await Invoice.create(updatedInvoice, (err, invoice) => {
            if (err) throw 'Invoice not added to database';
        });
    } catch (err) {
        throw err;
    }
}