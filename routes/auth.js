const express = require('express');

const validationCheck = require('../controller/validationCheck');
const authController = require('../controller/auth');
const isAuth = require('../util/isAuth');

const router = express.Router();

router.put('/signup', validationCheck.checkSignup, validationCheck.validationHandler, authController.signup);
router.post('/login', authController.login);
router.get('/status', isAuth, authController.getStatus);
router.patch('/status', isAuth, authController.patchStatus);

module.exports = router;