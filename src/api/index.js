// Import controller file
module.exports.authController = require('./auth/auth.controller');
module.exports.userController = require('./user/user.controller');
module.exports.adminController = require('./admin/admin.controller');
module.exports.fleetManagerController = require('./fleetmanager/fleetmanager.controller');


// Import services file
module.exports.authService = require('./auth/auth.service');
module.exports.userService = require('./user/user.service');
module.exports.adminService = require('./admin/admin.service');
module.exports.emailService = require('./common/email.service');
module.exports.tokenService = require('./common/token.service');
module.exports.fleetManagerService = require('./fleetmanager/fleetmanager.service');