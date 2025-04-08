const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const AuthService = require('./auth.service')
const reader = require('xlsx')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
const httpStatus = require('http-status');
const moment = require('moment')
const authService = require('./auth.service')

const login = catchAsync(async (req, res) => {

	createResponse(res, Messages.LOGIN_WITH_OTP, {});
});

const refreshTokens = catchAsync(async (req, res) => {
	const tokens = await authService.refreshAuthTokens(req.body.refreshToken);
	const response = { ...tokens };
	createResponse(res, httpStatus.OK, Messages.REFRESH_TOKEN, { tokens: response });
});



module.exports = {
	login,
	refreshTokens,
};
