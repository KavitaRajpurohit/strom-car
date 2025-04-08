const express = require('express');
const upload = require('../../config/multer');
const commonController = require('./common.controller');

const router = express.Router();


/**
 * @swagger
 *
 * /common/upload-pic:
 *   post:
 *     tags:
 *       - "Common"
 *     description: Upload pic
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: pic
 *         description: Profile pic to upload
 *         in: formData
 *         required: true
 *         type: file
 *     responses:
 *       201:
 *         description: successfull operation
 *     security:
 *      - Bearer: []
 */
router.route('/upload-pic').post(upload.single('pic'), commonController.uploadPic);

module.exports = router;
