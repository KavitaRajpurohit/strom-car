const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const fleetManagerService = require('./fleetmanager.service')
const httpStatus = require('http-status')
const emailService = require('../common/email.service')
const bcrypt = require('bcrypt');

// ****************************** FLEET MANAGER RELATED API ********************************************* //

const addRegionalManager = catchAsync(async (req, res) => {
    const RegionalData = await fleetManagerService.addRegionalManager(req.user.id, req.body);
    const token = await fleetManagerService.generatesetPasswordToken(RegionalData)
    if (RegionalData) {
        await emailService.setPasswordEmail(req.body.email, { RegionalData, token })
    }
    createResponse(res, httpStatus.OK, Messages.REGIONAL_ADD, {});
})

const editRegionalManager = catchAsync(async (req, res) => {
    await fleetManagerService.editRegionalManager(req.query, req.body);
    createResponse(res, httpStatus.OK, Messages.REGIONAL_EDIT, {});
})

const deleteRegionalManager = catchAsync(async (req, res) => {
    await fleetManagerService.deleteRegionalManager(req.query.regionalManagerId);
    createResponse(res, httpStatus.OK, Messages.REGIONAL_DELETE, {});
})

const getRegionalManager = catchAsync(async (req, res) => {
    let Data = await fleetManagerService.getRegionalManager(req);
    createResponse(res, httpStatus.OK, Messages.REGIONAL_GET, Data);
})

// ****************************** CAR RELATED API *********************************************

const editCar = catchAsync(async (req, res) => {
    await fleetManagerService.editCar(req.query, req.body);
    createResponse(res, httpStatus.OK, Messages.CAR_EDIT, {});
})

const getCar = catchAsync(async (req, res) => {
    let Data = await fleetManagerService.getCar(req);
    createResponse(res, httpStatus.OK, Messages.CAR_GET, Data);
})

const getUnAssignCar = catchAsync(async (req, res) => {
    let Data = await fleetManagerService.getUnAssignCar(req);
    createResponse(res, httpStatus.OK, Messages.CAR_GET, Data);
})

const unassignCar = catchAsync(async (req, res) => {
    let Data = await fleetManagerService.unassignCar(req);
    createResponse(res, httpStatus.OK, Messages.FLEET_GET, Data);
})

const getUserData = catchAsync(async (req, res) => {
    let userData = await fleetManagerService.getUserData(req.user.id);
    createResponse(res, httpStatus.OK, Messages.USERDATA, userData);
})

const unassignRegion = catchAsync(async (req, res) => {
    let userData = await fleetManagerService.unassignRegion(req.user.id);
    createResponse(res, httpStatus.OK, Messages.USERDATA, userData);
})

module.exports = {
    addRegionalManager,
    editRegionalManager,
    deleteRegionalManager,
    getRegionalManager,
    getUserData,
    getUnAssignCar,
    unassignCar,
    getCar,
    editCar,
    unassignRegion
};
