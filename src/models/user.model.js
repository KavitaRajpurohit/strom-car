
const mongoose = require('mongoose');
const { pick } = require('lodash');
var Schema = mongoose.Schema;
const userSchema = mongoose.Schema(
    {
        fullName: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        isPassSet: {
            type: Boolean,
        },
        phoneCode: {
            type: String
        },
        contact: {
            type: String
        },
        status: {
            type: String,
            enum: ['Activate', 'Deactivate'],
            default: 'Activate'
        },
        role: {
            type: String
        },
        profilePhoto: {
            type: String
        },
        regionId: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'regions'
        },
        fleetManagerId: {
            type: Schema.Types.ObjectId
        },
        cars: [{
            type: Schema.Types.ObjectId,
            ref: 'cars'
        }],
        forgotPassTokenId: {
            type: Schema.Types.ObjectId,
            ref: 'tokens'
        },
        isPasswordReset: {
            type: Boolean
        }
    },
    {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    },
);

userSchema.methods.transform = function () {
    const user = this;
    return pick(user.toJSON(), ['id', 'fullName', 'email', "role", "profilePhoto"]);
};

const userData = mongoose.model('user', userSchema);

module.exports = userData;