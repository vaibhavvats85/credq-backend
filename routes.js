const router = require('express').Router();

const { catchErrors } = require("./handlers/errorHandlers");
const authenticationController = require('./controllers/authenticate');
const payment = require('./controllers/payment');
const invoices = require('./controllers/invoice');
const request = require('./controllers/request');
const report = require('./controllers/report');
const email = require('./controllers/email');

router.get("/", (req, res) => {
    res.json({
        'message': 'Hello'
    })
});
router.post("/register", catchErrors(authenticationController.register));
router.post("/changePassword", catchErrors(authenticationController.changePassword));
router.post("/login", catchErrors(authenticationController.login));
router.get("/authenticate", catchErrors(authenticationController.authenticate));
router.get("/logout", authenticationController.logout);
router.post("/payment/orders", catchErrors(payment.orders));
router.post("/payment/success", payment.success);
router.post("/invoices", invoices.invoices);
router.post("/request/upgradeplan", request.upgradeplan);
router.post("/report/updateApplications", report.updateApplications);
router.post("/reports", report.reports);
router.post("/email", email.email);


module.exports = router;    