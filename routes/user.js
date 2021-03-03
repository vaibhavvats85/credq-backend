const router = require('express').Router();

const { catchErrors } = require("../handlers/errorHandlers");
const authenticationController = require('../controllers/authenticate');
router.get("/", (req, res) => {
    res.json({
        'message': 'Hello'
    })
});
router.post("/login", catchErrors(authenticationController.login));

module.exports = router;