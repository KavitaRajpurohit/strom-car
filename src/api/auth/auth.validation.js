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


module.exports = {
	login,
};
