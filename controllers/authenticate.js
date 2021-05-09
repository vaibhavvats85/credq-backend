const mongoose = require("mongoose");
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const constants = require('../utils/constants');
const { cookieToken } = require("../utils/service");
const crypto = require('crypto');
const { nanoid } = require('nanoid');

const domain = process.env.ENV === 'DEVELOPMENT' ? null : '.credq.org';

exports.register = async (req, res) => {
    const password = nanoid(10).replace(/[-_]/gi, '');
    const shasum = crypto.createHmac("sha256", process.env.SECRET);
    shasum.update(password);
    const encodedPassword = shasum.digest("hex");
    res.json({
        password,
        encodedPassword
    });
}

exports.changePassword = async (req, res) => {
    const { username, password } = req.body;
    const shasum = crypto.createHmac("sha256", process.env.SECRET);
    shasum.update(password);
    const encodedPassword = shasum.digest("hex");
    const user = await User.updateOne({ username }, { password: encodedPassword, first_login: false });
    if (user.ok) {
        res.status(200).json({ message: 'Password Updated Successfully' });
    } 
    res.status(400).json({ message: 'Password not updated' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const shasum = crypto.createHmac("sha256", process.env.SECRET);
    shasum.update(password);
    const encodedPassword = shasum.digest("hex");
    const user = await User.findOne({
        username,
        password: encodedPassword,
    });

    if (!user) throw "Email and Password did not match.";


    jwt.sign({ name: user.organization, id: user.id }, process.env.SECRET, {
        expiresIn: 86400
    }, (err, token) => {
        if (err) {
            res.json({
                message: "There is some problem signing you in. Please try again!",
            });
        } else {
            res.cookie(constants.jwt_identifier, token, {
                maxAge: 86400 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                domain: domain
            });
            User.findById(user.id, { password: 0, _id: 0, userid: 0 }, (err, loggedInUser) => {
                res.json({
                    message: "User logged in successfully!",
                    token,
                    user: loggedInUser
                });
            });

        }
    });
};

exports.authenticate = async (req, res) => {
    const token = cookieToken(req);
    if (!token) return res.status(401).send('Resource Unauthorized');
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        User.findById(decoded.id, { password: 0 }, function (err, user) {
            if (err) return res.status(500).send({ message: "There was a problem finding the user." });
            if (!user) return res.status(404).send({ message: "No user found." });

            res.status(200).json({
                message: "User logged in successfully!",
                token,
                user
            });
        });
    })
};

exports.logout = (req, res) => {
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        res.clearCookie(constants.jwt_identifier, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: domain
        });
        req.session.destroy();
    });
};

