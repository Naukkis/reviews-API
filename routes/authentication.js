const express = require('express');
const users = require('../queries/users');

const router = express.Router();

router.post('/register', users.registerUser);
router.post('/login', users.login);

module.exports = router;