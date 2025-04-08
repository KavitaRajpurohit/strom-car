
const mongoose = require('mongoose');
const { pick } = require('lodash');
const { array } = require('@hapi/joi');
var Schema = mongoose.Schema;
const carSchema = mongoose.Schema(
    {
        vehicleId: {
            type: String
        },
        macId: {
            type: String
        },
        carName: {
            type: String
        },
        assignedStatus: {
            type: Boolean,
            default: false
        },
        assignedStatusRegional: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['Activate', 'Deactivate'],
            default: 'Activate'
        },
        regionId: {
            type: Schema.Types.ObjectId,
            ref: 'regions'
        },
        fleetManagerId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        regionalManagerId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        carTrip: { type: Array },

    },
    {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    },
);

const carData = mongoose.model('car', carSchema);

module.exports = carData;