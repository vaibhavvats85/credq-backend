const jwt = require("jsonwebtoken");
const Invoices = require("../models/Invoices");
const { cookieToken } = require("../utils/service");

exports.invoices = async (req, res) => {
    const { user } = req.body;
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        Invoices.find({ user }, (err, invoices) => {
            if(err) return res.status(500).send({ message: "There was a problem finding the invoices" }); 
            if (invoices.length === 0) return res.status(204).send('No Invoice present for this user');
            res.status(200).send(invoices);
        });
    });
}