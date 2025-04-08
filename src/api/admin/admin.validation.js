const Joi = require('@hapi/joi');
const { ROLES } = require('../../config/constant');

const login = {
	body: Joi.object().keys({
		email: Joi.string().email().required().messages({
			'string.email': 'Are you sure you entered the valid email address?',
			'string.empty': 'Email address cannot be empty.'
		}),
		password: Joi.string().required().messages({
			'string.empty': 'Password cannot be empty.'
		}),
		role: Joi.number().valid(ROLES.ADMIN)
	}),
};

const resetPasswordCheck = {
	body: Joi.object().keys({
		token: Joi.string().required()
	})
}

const setPasswordCheck = {
	body: Joi.object().keys({
		token: Joi.string().required()
	})
}

const setPassword = {
	body: Joi.object().keys({
		password: Joi.string().required(),
		token: Joi.string().required()
	})
}

module.exports = {
	login,
	resetPasswordCheck,
	setPasswordCheck,
	setPassword
};
