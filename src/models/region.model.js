const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const regionSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        isAssigned: {
            type: Boolean,
            default: false
        },
        fleetManagerId: {
            type: Schema.Types.ObjectId,
            ref: 'fleetmanagers'
        }
    },
    {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    },
);

const regionData = mongoose.model('region', regionSchema);

module.exports = regionData;