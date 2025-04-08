const express = require('express');
const publicRoute = require('./public.route');
const apiDocsRoute = require('./api-docs.route');
const authRoute = require('../../api/auth/auth.route');
const adminRoute = require('../../api/admin/admin.route')
const fleetManagerRoute = require('../../api/fleetmanager/fleetmanager.route')

const router = express.Router();

router.use('/', publicRoute);
router.use('/api-docs', apiDocsRoute);
router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/fleetmanager', fleetManagerRoute);

module.exports = router;
