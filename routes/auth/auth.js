const express = require('express');
const { registeruser, loginuser, activateUser, logout, forgotpass, resetPassword } = require('../../controllers/auth/auth');
const { RequireAuth, RequireActive } = require('../../middlewares/auth/auth');
const router =express.Router()

router.get('/register',registeruser);
router.post('/register',registeruser);
router.get('/login',loginuser);
router.post('/login',loginuser);
router.get('/activate',RequireAuth,activateUser);
router.post('/activate',RequireAuth,activateUser)
router.get('/logout',RequireAuth,RequireActive,logout)
router.get('/forgot_password',forgotpass)
router.post('/forgot_password',forgotpass)
router.get('/reset_password/:resettoken',resetPassword)
router.post('/reset_password/:resettoken',resetPassword)
