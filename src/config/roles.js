const { ROLES } = require('../config/constant');
const roles = [ROLES.ADMIN, ROLES.FLEETMANAGER, ROLES.REGIONALMANAGER];
const roleRights = new Map();

roleRights.set(roles[0], ['admin', 'dashboard','regionList']);
roleRights.set(roles[1], ['fleetmanager', 'dashboard','regionList']);
roleRights.set(roles[2], ['dashboard']);
module.exports = {
	roles,
	roleRights,
};
