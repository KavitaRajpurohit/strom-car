
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
	info: {
		title: process.env.PROJECT_NAME,
		version: '1.0.0',
		description: 'API Collection',
	},
	host: `${process.env.API_HOST}`,
	schemes: ['http', 'https'],
	// basePath: '/v1/',
};
// let sd = require('../routes/v1/index')
const options = {
	swaggerDefinition,
	apis: ['./src/api/auth/auth.route.js', './src/utils/swagger.yml'],
};

module.exports = swaggerJSDoc(options);