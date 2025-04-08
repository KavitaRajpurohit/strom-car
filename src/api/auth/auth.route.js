const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const upload = require('../../config/multer');
// const auth = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * definitions:
 *   login:
 *     required:
 *       - email
 *       - password
 *       - role
 *     properties:
 *       email:
 *         type: string
 *         example: xyz@domain.com
 *       password:
 *         type: string
 *         example: Test@123
 *       role:
 *         type: string
 *         example: 1
 */

/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     tags:
 *       - "Auth"
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Email and password for login.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/login"
 *     responses:
 *       200:
 *         description: You have successfully logged in!!
 */

router.post('/login', validate(authValidation.login), authController.login);

router.post('/refresh-tokens', authController.refreshTokens);

module.exports = router;
