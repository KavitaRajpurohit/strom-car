const moment = require('moment');
const config = require('../../config/config');
const tokenService = require('../common/token.service');
const { TOKEN_TYPE } = require('../../config/constant');
const UserModel = require('../../models/user.model');
const RegionModel = require('../../models/region.model')
// const UserModel = require('../../models/fleetManager.model')
const CarModel = require('../../models/car.model')
const Messages = require('../../utils/messages');
const AppError = require('../../utils/AppError')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const httpStatus = require('http-status')
const bcrypt = require('bcrypt');
const { getQueryOptions } = require("../../utils/service.util");

// ********************************* FLEETMANAGER related api ************************** //

const addRegionalManager = async (fleetManagerId, body) => {
	const checkUser = await getUserByEmail(body.email)
	if (!checkUser) {
		body.role = 'RegionalManager'
		body.isPassSet = false
		body.fleetManagerId = fleetManagerId
		const Data = await UserModel.create(body)
		if (Data) {
			if (body.cars) {
				for (var i = 0; i < body.cars.length; i++) {
					await CarModel.findByIdAndUpdate(body.cars[i], { regionalManagerId: Data._id, assignedStatusRegional: true },{multi:true})
				}
			}
		}
		return Data
	} else {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_ALREADY_EXIST);
	}

};

const editRegionalManager = async (query, body) => {
	const regionalManagerData = await UserModel.findById(query.regionalManagerId)
	if (regionalManagerData.cars.length > 0) {
		for (var i = 0; i < regionalManagerData.cars.length; i++) {
			await CarModel.findByIdAndUpdate(regionalManagerData.cars[i], { assignedStatusRegional: false })
			await CarModel.updateOne({ _id: regionalManagerData.cars[i] }, { $unset: { regionalManagerId: "" } })
		}
	}
	if (body.cars.length>0) {
		for (var i = 0; i < body.cars.length; i++) {
			console.log('body.cars[i].id :',body.cars[i])
			const carData = await CarModel.findByIdAndUpdate(body.cars[i], { regionalManagerId: regionalManagerData._id, assignedStatusRegional: true })
			
		}
	}
	
	const Data = await UserModel.findByIdAndUpdate(query.regionalManagerId, body, { new: true })
	return Data
};

const deleteRegionalManager = async (regionalManagerId) => {
	const Data = await UserModel.findById(regionalManagerId)

	if (Data.cars.length > 0) {
		for (var i = 0; i < Data.cars.length; i++) {
			await CarModel.findByIdAndUpdate(Data.cars[i], { assignedStatusRegional: false })
			await CarModel.updateOne({ _id: Data.cars[i]}, { $unset: { regionalManagerId: "" } })
		}
	}
	return await UserModel.findByIdAndDelete(ObjectId(regionalManagerId))
};

const getRegionalManager = async (req) => {
	let { sort, skip, limit } = getQueryOptions(req.query);
	const FleetManagerData = await UserModel.aggregate([
		{
			'$match': {
				'role': 'RegionalManager',
				'fleetManagerId': ObjectId(req.user._id)
			}
		}, {
			'$lookup': {
				'from': 'regions',
				'let': {
					'id': '$regionId'
				},
				'pipeline': [
					{
						'$match': {
							'$expr': {
								'$eq': [
									'$_id', '$$id'
								]
							}
						}
					}, {
						'$project': {
							'name': 1
						}
					}
				],
				'as': 'RegionData'
			}
		}, {
			'$unwind': {
				'path': '$RegionData',
				'preserveNullAndEmptyArrays': true
			}
		}, {
			'$addFields': {
				'regionName': '$RegionData.name'
			}
		}, {
			'$lookup': {
				'from': 'cars',
				'let': {
					'id': '$_id'
				},
				'pipeline': [
					{
						'$match': {
							'$expr': {
								'$eq': [
									'$regionalManagerId', '$$id'
								]
							}
						}
					}
				],
				'as': 'carData'
			}
		}, {
			'$addFields': {
				'carAssigned': {
					'$size': '$carData'
				}
			}
		}, {
			$skip: parseInt(skip)
		}, {
			$limit: parseInt(limit)
		}
	])
	return FleetManagerData;
}

const generatesetPasswordToken = async (data) => {
	const user = await UserModel.findOne({ email: data.email });
	const expires = moment().add(
		config.jwt.verifyPasswordExpirationMinutes,
		"minutes"
	)
	const resetPasswordToken = tokenService.generateToken(
		user._id,
		user.role,
		expires,

	);
	await tokenService.saveToken(
		resetPasswordToken,
		user._id,
		expires,
		TOKEN_TYPE.VERIFICATION_TOKEN,
		user.role
	);
	return resetPasswordToken;
};

const getUserByEmail = async (email) => {
	let user = await UserModel.findOne({ email: email });
	return user;
};

const getUserData = async (userId) => {
	const userData= await UserModel.findById(userId);
	return await RegionModel.findById(userData.regionId);
}

const getCar = async (req) => {
	const carData = await CarModel.aggregate([
		{
		  '$match': {
			'fleetManagerId': new ObjectId(req.user.id)
		  }
		}, {
		  '$lookup': {
			'from': 'regions', 
			'let': {
			  'id': '$regionId'
			}, 
			'pipeline': [
			  {
				'$match': {
				  '$expr': {
					'$eq': [
					  '$_id', '$$id'
					]
				  }
				}
			  }, {
				'$project': {
				  'name': 1
				}
			  }
			], 
			'as': 'RegionData'
		  }
		}, {
		  '$unwind': {
			'path': '$RegionData', 
			'preserveNullAndEmptyArrays': true
		  }
		}
	  ])
	  return carData;
}

const editCar = async (query, body) => {
	const Data = await CarModel.findByIdAndUpdate(query.carId, { status: body.status })
	return Data;
}

const getUnAssignCar = async (req) => {
	return await CarModel.find({ fleetManagerId: req.user.id, assignedStatusRegional: false })
}
const unassignCar = async (req) => {
	await CarModel.findByIdAndUpdate(req.query.carId, { assignedStatusRegional: false })
	await CarModel.updateOne({ _id: req.query.carId }, { $unset: { regionalManagerId: "" } })
	return true
}

const unassignRegion = async (userId) => {
	return await CarModel.find({ fleetManagerId: userId, assignedStatusRegional: false });
}

module.exports = {
	getUserByEmail,
	addRegionalManager,
	editRegionalManager,
	deleteRegionalManager,
	getRegionalManager,
	generatesetPasswordToken,
	getUserData,
	getCar,
	editCar,
	getUnAssignCar,
	unassignCar,
	unassignRegion
};