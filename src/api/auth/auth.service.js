const moment = require('moment');
const config = require('../../config/config');
const tokenService = require('../common/token.service');
const { TOKEN_TYPE } = require('../../config/constant');
const httpStatus = require('http-status')
const UserModel = require('../../models/user.model')
const Messages = require('../../utils/messages');
const AppError = require('../../utils/AppError')
const generateAuthTokens = async (userId, role) => {
	const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
	const accessToken = tokenService.generateToken(userId, role, accessTokenExpires);
	const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
	const refreshToken = tokenService.generateToken(userId, role, refreshTokenExpires);
	await tokenService.saveToken(refreshToken, userId, refreshTokenExpires, TOKEN_TYPE.REFRESH_TOKEN);

	return {
		access: {
			token: accessToken,
			expires: accessTokenExpires.toDate(),
		},
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires.toDate(),
		},
	};
};

const refreshAuthTokens = async (refreshToken) => {
	try {
		const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TOKEN_TYPE.REFRESH_TOKEN);
		const userId = refreshTokenDoc.sub.user;
		const user = await UserModel.findById(userId)
		return await generateAuthTokens(userId, refreshTokenDoc.sub.role);
	} catch (error) {
		throw new AppError(httpStatus.UNAUTHORIZED, Messages.INVALID_TOKEN);
	}
};

module.exports = {
	generateAuthTokens,
	refreshAuthTokens,
};
