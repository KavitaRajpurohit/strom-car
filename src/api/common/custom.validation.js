const objectId = (value, helpers) => {
	if (!value.match(/^[0-9a-fA-F]{24}$/)) {
		return helpers.message('{{#label}} must be a valid mongo id');
	}
	return value;
};

const password = (value, helpers) => {
	// if (value.length < 8) {
	//   return helpers.message('password must be at least 8 characters');
	// }
	if (!value.match(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,8})/)) {
		return helpers.message('Password must be Minimum of  8 characters || 1 Lower and Upper case || 1 Special Character || 1 Number');
	}
	return value;
};

module.exports = {
	objectId,
	password,
};
