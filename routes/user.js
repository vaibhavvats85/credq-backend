const router = require('express').Router();

const { catchErrors } = require("../handlers/errorHandlers");
const authenticationController = require('../controllers/authenticate');

router.post("/login", catchErrors(authenticationController.login));

module.exports = router;