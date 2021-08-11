const { cookieToken } = require("../utils/service");
const jwt = require("jsonwebtoken");
const Requests = require('../models/Requests');
const User = require("../models/User");
const Reports = require("../models/Reports");
const { nanoid } = require("nanoid");
const appData = require("../models/appData");

exports.updateApplications = async (req, res) => {
    const { username } = req.body;
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, async (err,) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        await Reports.create({...req.body, member_id: nanoid(5)});
        User.findOne({ username }, async (err, user) => {
            const updatedApplications = (parseInt(user.applications) - 1).toString();
            console.log(updatedApplications);
            const updateUser = await User.updateOne({ username }, { applications: updatedApplications });
            if (updateUser.ok) {
                res.status(200).json({
                    applications: updatedApplications,
                    message: 'Application Updated Successfully'
                });
            }
            res.status(400).json({ message: 'Application not updated' });
        })

    });
}

exports.updateExcelData = async (req, res) => {
    const { username } = req.body;
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, async (err,) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        await appData.create({...req.body, member_id: nanoid(5)},(err, requests) => {
            if (err) return res.status(500).send('Some problem occurred while creating your excel');
            res.status(200).send('Your request has been sent. One of our team member will contact you shortly');
        });

    });
}

exports.reports = async (req,res) =>{
    const { user } = req.body;
    const token = cookieToken(req);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        Reports.find({ user }, (err, reports) => {
            if(err) return res.status(500).send({ message: "There was a problem finding the reports" }); 
            if (reports.length === 0) return res.status(204).send('No report present for this user');
            res.status(200).send(reports);
        });
    });
}