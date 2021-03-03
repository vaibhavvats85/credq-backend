const mongoose = require("mongoose");
const User = require('../models/User');
const jwt = require("jwt-then");

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username,
        password,
    });

    if (!user) throw "Email and Password did not match.";

    const token = await jwt.sign({ name: user.organization, id: user.id }, process.env.SECRET);

    res.json({
        message: "User logged in successfully!",
        token
    });
};