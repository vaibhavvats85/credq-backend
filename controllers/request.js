const { cookieToken } = require("../utils/service");
const jwt = require("jsonwebtoken");
const Requests = require('../models/Requests');

exports.upgradeplan = async (req, res) => {
    const { username } = req.body;
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, (err,) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        Requests.findOne({ username }, async (err, user) => {
            if (err) return res.status(500).send('Some problem occurred while registering your request');
            if (user) return res.status(200).send('You have already registered a request. One of our team member will contact you shortly');
            else {
                Requests.create(req.body, (err, requests) => {
                    if (err) return res.status(500).send('Some problem occurred while registering your request');
                    res.status(200).send('Your request has been sent. One of our team member will contact you shortly');
                });
            }
        })

    });
}