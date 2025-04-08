
var mongoose = require('mongoose');
var { TOKEN_TYPE } = require('../config/constant.js');
var Schema = mongoose.Schema;
var tokensSchema = new Schema({
	token: { type: String, required: true, index: true, },
	type: {
		type: Number,
		required: true,
		enum: [
			TOKEN_TYPE.ACCESS_TOKEN,
			TOKEN_TYPE.REFRESH_TOKEN,
			TOKEN_TYPE.VERIFICATION_TOKEN,
			TOKEN_TYPE.RESET_PASSWORD
		]
	},
	expiresAt: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
});

const Tokens = mongoose.model('Tokens', tokensSchema);

module.exports = Tokens;