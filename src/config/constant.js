const ROLES = {
	ADMIN: 'Admin',
	FLEETMANAGER: 'FleetManager',
	REGIONALMANAGER: 'RegionalManager'
};

const TOKEN_TYPE = {
	ACCESS_TOKEN: 1,
	REFRESH_TOKEN: 2,
	VERIFICATION_TOKEN: 3,
	RESET_PASSWORD: 4,
};
module.exports = {
	ROLES,
	TOKEN_TYPE
};
