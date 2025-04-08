const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const adminService = require('./admin.service')
const httpStatus = require('http-status')
const emailService = require('../common/email.service')
const bcrypt = require('bcrypt');
const TokenModel = require('../../models/tokens.model')
const UserModel = require('../../models/user.model');
const userData = require('../../models/user.model');
// ****************************** AUTHENTICATION RELATED API *********************************************

const login = catchAsync(async (req, res) => {
	let { email, password } = req.body;
	const user = await adminService.login(email, password);
	const tokens = await adminService.generateAuthTokens(user._id, user.role);
	const response = { user: user.transform(), tokens };
	createResponse(res, httpStatus.OK, Messages.LOGIN, response)
});

const forgotPassword = catchAsync(async (req, res) => {
	const forgotPassTokenId = '';
	const user = await adminService.getUserByEmail(req.body.email);
	if (user) {
		if (user.forgotPassTokenId) {
			const tokenData = TokenModel.findById(forgotPassTokenId)
			if (new Date(tokenData.expiresAt) < new Date()) {
				createResponse(res, httpStatus.OK, "Reset password already requested, please check your email account", {});
			} else {
				const resetPasswordToken = await adminService.generateResetPasswordToken(
					{ email: user.email }
				);
				await emailService.sendForgotPasswordEmail(req.body.email, {
					...user._doc,
					token: resetPasswordToken,
				});
				const tokenData = await TokenModel.findOne({ token: resetPasswordToken })
				await UserModel.findByIdAndUpdate(user._id, { forgotPassTokenId: tokenData._id, isPasswordReset: false })
				createResponse(res, httpStatus.OK, Messages.FORGOT_PWD_SUCCESS, {});
			}
		} else {

			const resetPasswordToken = await adminService.generateResetPasswordToken(
				{ email: user.email }
			);
			await emailService.sendForgotPasswordEmail(req.body.email, {
				...user._doc,
				token: resetPasswordToken,
			});
			const tokenData = await TokenModel.findOne({ token: resetPasswordToken })
			await UserModel.findByIdAndUpdate(user._id, { forgotPassTokenId: tokenData._id, isPasswordReset: false })
			createResponse(res, httpStatus.OK, Messages.FORGOT_PWD_SUCCESS, {});
		}
	} else {
		createResponse(res, httpStatus.NOT_FOUND, Messages.USER_NOT_FOUND, {});
	}
});

const resetPassword = catchAsync(async (req, res) => {
	req.body.password = await bcrypt.hash(req.body.password, 8);
	const UserData = await adminService.resetPassword(req.params.token, req.body.password);
	await UserModel.findByIdAndUpdate(userData._id, { isPasswordReset: true })
	await UserModel.updateOne({ _id: userData._id }, { $unset: { forgotPassTokenId: null } })
	createResponse(res, httpStatus.OK, Messages.RESET_PWD_SUCCESS, {});
})

const resetPasswordCheck = catchAsync(async (req, res) => {
	const resetPasswordCheck = await adminService.resetPasswordCheck(req.body)
	createResponse(res, httpStatus.OK, "checked")
})

const setPasswordCheck = catchAsync(async (req, res) => {
	const setPasswordCheck = await adminService.setPasswordCheck(req.body)
	createResponse(res, httpStatus.OK, "checked", setPasswordCheck)
})

const setPassword = catchAsync(async (req, res) => {
	const setPassword = await adminService.setPassword(req.body)
	createResponse(res, httpStatus.OK, Messages.SET_PASSWORD_SUCCESS, {})
})

// ****************************** REGION RELATED API *********************************************

const addRegion = catchAsync(async (req, res) => {
	await adminService.addRegion(req.body);
	createResponse(res, httpStatus.OK, Messages.REGION_ADD, {});
})

const editRegion = catchAsync(async (req, res) => {
	await adminService.editRegion(req.query, req.body);
	createResponse(res, httpStatus.OK, Messages.REGION_EDIT, {});
})

const deleteRegion = catchAsync(async (req, res) => {
	const RegionData = await adminService.deleteRegion(req.query.regionId);
	createResponse(res, httpStatus.OK, Messages.REGION_DELETE, RegionData);
})

const getRegion = catchAsync(async (req, res) => {
	let Data = await adminService.getRegion(req);
	createResponse(res, httpStatus.OK, Messages.GET_REGION, Data);
})

const getRegionList = catchAsync(async (req, res) => {
	let Data = await adminService.getRegionList();
	createResponse(res, httpStatus.OK, Messages.GET_REGION, Data);
})

const getRegionForCar = catchAsync(async (req, res) => {
	let Data = await adminService.getRegionForCar();
	createResponse(res, httpStatus.OK, Messages.GET_REGION, Data);
})

const getRegionDetails = catchAsync(async (req, res) => {
	let Data = await adminService.getRegionDetails(req.query.regionId);
	createResponse(res, httpStatus.OK, Messages.GET_REGION, Data);
})

const removeFleetManager = catchAsync(async (req, res) => {
	let Data = await adminService.removeFleetManager(req);
	createResponse(res, httpStatus.OK, Messages.GET_REGION, Data);
})

// ****************************** FLEET MANAGER RELATED API ********************************************* //

const addFleetManager = catchAsync(async (req, res) => {
	const FleetData = await adminService.addFleetManager(req.body);
	const token = await adminService.generatesetPasswordToken(FleetData)
	if (FleetData) {
		await emailService.setPasswordEmail(req.body.email, { FleetData, token })
	}
	createResponse(res, httpStatus.OK, Messages.FLEET_ADD, {});
})

const editFleetManager = catchAsync(async (req, res) => {
	await adminService.editFleetManager(req.query, req.body);
	createResponse(res, httpStatus.OK, Messages.FLEET_EDIT, {});
})

const deleteFleetManager = catchAsync(async (req, res) => {
	await adminService.deleteFleetManager(req.query.fleetManagerId);
	createResponse(res, httpStatus.OK, Messages.FLEET_DELETE, {});
})

const getFleetManager = catchAsync(async (req, res) => {
	let Data = await adminService.getFleetManager(req);
	createResponse(res, httpStatus.OK, Messages.FLEET_GET, Data);
})

const unassignRegion = catchAsync(async (req, res) => {
	let Data = await adminService.unassignRegion(req);
	let message = Data.name + " removed from current Fleet managers list successfully"
	createResponse(res, httpStatus.OK, message, true);
})

const unassignCar = catchAsync(async (req, res) => {
	let Data = await adminService.unassignCar(req);
	createResponse(res, httpStatus.OK, Messages.FLEET_GET, Data);
})


// ****************************** CAR RELATED API *********************************************

const addCar = catchAsync(async (req, res) => {
	await adminService.addCar(req.body);
	createResponse(res, httpStatus.OK, Messages.CAR_ADD, {});
})

const editCar = catchAsync(async (req, res) => {
	await adminService.editCar(req.query, req.body);
	createResponse(res, httpStatus.OK, Messages.CAR_EDIT, {});
})

const getCar = catchAsync(async (req, res) => {
	let Data = await adminService.getCar();
	createResponse(res, httpStatus.OK, Messages.CAR_GET, Data);
})

const getUnAssignCar = catchAsync(async (req, res) => {
	let Data = await adminService.getUnAssignCar(req.query.regionId);
	createResponse(res, httpStatus.OK, Messages.CAR_GET, Data);
})

// ******************** Dashboard Data API  *************************//

const getDashboardData = catchAsync(async (req, res) => {
	let Data = await adminService.getDashboardData(req);
	createResponse(res, httpStatus.OK, Messages.DASHBOARD, Data);
})

const getDashboardFilter = catchAsync(async (req, res) => {
	let Data = await adminService.getDashboardFilter(req);
	createResponse(res, httpStatus.OK, Messages.DASHBOARD, Data);
})

const getCarData = catchAsync(async (req, res) => {
	let Data = await adminService.getCarData(req);
	createResponse(res, httpStatus.OK, Messages.CARDATA, Data);
})

const getHeaderData = catchAsync(async (req, res) => {
	let Data = await adminService.getHeaderData(req);
	createResponse(res, httpStatus.OK, Messages.HEADER_DATA, Data);
})

module.exports = {
	login,
	forgotPassword,
	resetPassword,
	addRegion,
	editRegion,
	deleteRegion,
	getRegion,
	addFleetManager,
	editFleetManager,
	deleteFleetManager,
	getFleetManager,
	addCar,
	editCar,
	getCar,
	getRegionList,
	getUnAssignCar,
	getRegionForCar,
	resetPasswordCheck,
	setPasswordCheck,
	setPassword,
	getDashboardData,
	unassignRegion,
	unassignCar,
	getRegionDetails,
	removeFleetManager,
	getDashboardFilter,
	getCarData,
	getHeaderData
};
