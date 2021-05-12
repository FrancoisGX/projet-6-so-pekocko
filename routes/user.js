const express = require('express');
const router = express.Router();
const verifPassword = require('../middleware/verifPassword');
const userCtrl = require('../controllers/user');

router.post('/signup',verifPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports =  router;