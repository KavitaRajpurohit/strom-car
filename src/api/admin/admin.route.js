const express = require('express');
const validate = require('../../middlewares/validate');
const adminValidation = require('./admin.validation');
const adminController = require('./admin.controller');
const auth = require('../../middlewares/auth')
// const upload = require('../../config/multer');
// const auth = require('../../middlewares/auth');
const router = express.Router();

// ******************************  AUTHENTICATION RELATED APIs ************************************ //

router.post('/login', validate(adminValidation.login), adminController.login);
router.post('/forgotpassword', adminController.forgotPassword);
router.post('/resetpassword/:token', adminController.resetPassword);
router.post('/resetPasswordCheck', validate(adminValidation.resetPasswordCheck), adminController.resetPasswordCheck);
router.post('/setPasswordCheck', validate(adminValidation.setPasswordCheck), adminController.setPasswordCheck);
router.post('/setPassword', validate(adminValidation.setPassword), adminController.setPassword)

// ******************************  REGION RELATED APIs ************************************ //

router.post('/region/add', auth('admin'), adminController.addRegion);
router.put('/region/edit', auth('admin'), adminController.editRegion);
router.delete('/region/delete', auth('admin'), adminController.deleteRegion);
router.get('/region/get', auth('admin'), adminController.getRegion);
router.get('/region/getregiondetails', auth('admin'), adminController.getRegionDetails);
router.get('/getregionlist', auth('regionList'), adminController.getRegionList);
router.get('/getregionlistforcar', auth('admin'), adminController.getRegionForCar);
router.put('/region/removemanager', auth('admin'), adminController.removeFleetManager);


// ******************************  FLEETMANAGER RELATED APIs ************************************ //

router.post('/fleetmanager/add', auth('admin'), adminController.addFleetManager);
router.put('/fleetmanager/edit', auth('admin'), adminController.editFleetManager);
router.delete('/fleetmanager/delete', auth('admin'), adminController.deleteFleetManager);
router.get('/fleetmanager/get', auth('admin'), adminController.getFleetManager);
router.put('/fleetmanager/unassignregion', auth('admin'), adminController.unassignRegion);
router.put('/fleetmanager/unassigncar', auth('admin'), adminController.unassignCar);



// ******************************  CAR RELATED APIs ************************************ //

router.post('/car/add', auth('admin'), adminController.addCar);
router.put('/car/edit', auth('admin'), adminController.editCar);
router.get('/car/get', auth('admin'), adminController.getCar);
router.get('/getunassignedcar', adminController.getUnAssignCar)

// ******************************  Dashboard API ************************************ //

router.get('/dashboard', auth('dashboard'), adminController.getDashboardData);
router.get('/dashboardfilter', auth('dashboard'), adminController.getDashboardFilter);
router.get('/getcardata', auth('dashboard'), adminController.getCarData);

router.get('/getheaderdata', auth('dashboard'), adminController.getHeaderData);

module.exports = router;
