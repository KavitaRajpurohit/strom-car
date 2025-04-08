const express = require('express');
const validate = require('../../middlewares/validate');
const fleetmanagerValidation = require('./fleetmanager.validation');
const fleetmanagerController = require('./fleetmanager.controller');
const auth = require('../../middlewares/auth')
const router = express.Router();

// ******************************  Regional Manager RELATED APIs ************************************ //

router.post('/regionalmanager/add', auth('fleetmanager'), fleetmanagerController.addRegionalManager);
router.put('/regionalmanager/edit', auth('fleetmanager'), fleetmanagerController.editRegionalManager);
router.delete('/regionalmanager/delete', auth('fleetmanager'), fleetmanagerController.deleteRegionalManager);
router.get('/regionalmanager/get', auth('fleetmanager'), fleetmanagerController.getRegionalManager);
router.get('/getuserdata', auth('fleetmanager'), fleetmanagerController.getUserData);
router.get('/getunassignedcar', auth('fleetmanager'), fleetmanagerController.getUnAssignCar)
router.put('/regionalmanager/unassigncar', auth('fleetmanager'), fleetmanagerController.unassignCar);
router.put('/regionalmanager/unassignregion', auth('fleetmanager'), fleetmanagerController.unassignRegion);

// ******************************  CAR API ************************************ //

router.put('/car/edit', auth('fleetmanager'), fleetmanagerController.editCar);
router.get('/car/get', auth('fleetmanager'), fleetmanagerController.getCar);

module.exports = router;
