const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../../config/config');
const Token = require('../../models/tokens.model');
const AppError = require('../../utils/AppError');

const generateToken = (user, role, expires, secret = config.jwt.secret) => {
	const payload = {
		sub: { user, role },
		iat: moment().unix(),
		exp: expires.unix()
	};
	return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
	const tokenDoc = await Token.create({
		token,
		user: userId,
		expiresAt: expires.toDate(),
		type,
		blacklisted,
	});
	return tokenDoc;
};

const verifyToken = async (token, type) => {
	const payload = jwt.verify(token, config.jwt.secret);
	const tokenDoc = await Token.findOne({ token, type, user: payload.sub.user });
	if (!tokenDoc) {
		throw new AppError(httpStatus.NOT_FOUND, 'Token not found');
	}
	return payload;
};


module.exports = {
	generateToken,
	saveToken,
	verifyToken
};
