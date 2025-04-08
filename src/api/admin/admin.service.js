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
const { stromMotor } = require('../../utils/Axios');
const { object } = require('@hapi/joi');
const { findByIdAndUpdate } = require('../../models/user.model');

// ********************************* Auth related api ************************** //
const generateAuthTokens = async (userId, role) => {
	const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
	const accessToken = tokenService.generateToken(userId, role, accessTokenExpires);
	const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
	const refreshToken = tokenService.generateToken(userId, role, refreshTokenExpires);
	await tokenService.saveToken(refreshToken, userId, refreshTokenExpires, TOKEN_TYPE.REFRESH_TOKEN);

	return {
		access: {
			token: accessToken,
			expires: accessTokenExpires.toDate(),
		},
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires.toDate(),
		},
	};
};

const login = async (email, password) => {
	let user = await UserModel.findOne({ email: email })
	if (user) {
		await isPassSet(user)
		await checkPassword(password, user.password);
		return user
	}
	else {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_NOT_FOUND);
	}
};

const checkPassword = async (password, correctPassword) => {
	const isPasswordMatch = await bcrypt.compare(password, correctPassword);
	if (!isPasswordMatch) {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PASSWORD_NOT_MATCH);
	}
};

const isPassSet = async (user) => {
	if (user.isPassSet === false) {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PASSWORD_NOT_SET);
	}
};

const getUserByEmail = async (email) => {
	let user = await UserModel.findOne({ email: email });
	return user;
};

const generateResetPasswordToken = async (data) => {
	const user = await UserModel.findOne({ email: data.email });
	const expires = moment().add(
		config.jwt.resetPasswordExpirationMinutes,
		"minutes"
	)
	const resetPasswordToken = tokenService.generateToken(
		{ _id: user._id },
		user.role,
		expires,

	);
	await tokenService.saveToken(
		resetPasswordToken,
		user._id,
		expires,
		TOKEN_TYPE.RESET_PASSWORD,
		user.role
	);
	return resetPasswordToken;
};

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

const resetPassword = async (resetPasswordToken, newPassword) => {
	let userId;
	const resetPasswordTokenDoc = await tokenService.verifyToken(
		resetPasswordToken,
		TOKEN_TYPE.RESET_PASSWORD
	);
	userId = resetPasswordTokenDoc.sub.user;
	user = await UserModel.findByIdAndUpdate(userId, { password: newPassword }, { new: true });
	return user;
};

const resetPasswordCheck = async (body) => {
	try {
		const resetPasswordTokenDoc = await tokenService.verifyToken(
			body.token,
			TOKEN_TYPE.RESET_PASSWORD
		);
		const getUser = await Users.findById(resetPasswordTokenDoc.sub.user._id)
		if (getUser.isPassSet == true) {
			throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.RE_RESET_PASSWORD)
		}
		else {
			return resetPasswordTokenDoc
		}
	} catch (error) {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.RE_RESET_PASSWORD)
	}
}

const setPasswordCheck = async (body) => {
	try {
		const setPasswordTokenDoc = await tokenService.verifyToken(
			body.token,
			TOKEN_TYPE.VERIFICATION_TOKEN
		);
		const getUser = await UserModel.findById(setPasswordTokenDoc.sub.user)
		if (getUser.isPassSet == true) {
			throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.SET_PASSWORD_EXPIRE)
		}
		else {
			return setPasswordTokenDoc
		}
	} catch (error) {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.SET_PASSWORD_EXPIRE)

	}
}

const setPassword = async (body) => {
	body.password = await bcrypt.hash(body.password, 8);
	const setPasswordTokenDoc = await tokenService.verifyToken(
		body.token,
		TOKEN_TYPE.VERIFICATION_TOKEN
	);
	const getUser = await UserModel.findById(setPasswordTokenDoc.sub.user)
	let user = await UserModel.findOneAndUpdate({ _id: ObjectId(getUser._id) }, { $set: { "password": body.password, 'isPassSet': true } }, { new: true })
	return user
}

// ********************************* REGION related api ************************** //

const addRegion = async (body) => {
	let obj = {
		name: body.name
	}
	return await RegionModel.create(obj)
};

const editRegion = async (query, body) => {
	return await RegionModel.findByIdAndUpdate(query.regionId, body, { new: true })
};

const deleteRegion = async (regionId) => {
	const ifFleetAssogned = await UserModel.findOne({ regionId: regionId })
	const isCarAssigned = await CarModel.find({ regionId: regionId })


	if (ifFleetAssogned && isCarAssigned.length > 0) {
		await UserModel.findByIdAndUpdate({ regionId: null })
		await CarModel.updateOne({ regionId: null })
		//throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REMOVE_DEPENDENCY);
	}
	return await RegionModel.findByIdAndDelete(regionId)
};
// const deleteFleetManager = async (fleetManagerId) => {
// 	const Data = await UserModel.findById(fleetManagerId)

// 	if (Data.cars.length > 0) {
// 		for (var i = 0; i < Data.cars.length; i++) {
// 			await CarModel.findByIdAndUpdate(Data.cars[i], { assignedStatus: false })
// 			await CarModel.updateOne({ _id: Data.cars[i] }, { $unset: { fleetManagerId: "" } })
// 		}
// 	}
// 	if (Data.regionId && Data.regionId != null) {
// 		await RegionModel.findByIdAndUpdate(Data.regionId, { isAssigned: false })
// 		await RegionModel.updateOne({ _id: Data.regionId }, { $unset: { fleetManagerId: "" } })
// 	}
// 	await UserModel.deleteMany({fleetManagerId:fleetManagerId})
// 	return await UserModel.findByIdAndDelete(ObjectId(fleetManagerId))
// };

const getRegion = async (req) => {
	let { sort, skip, limit } = getQueryOptions(req.query);

	const RegionData = await RegionModel.aggregate([
		{
			'$lookup': {
				'from': 'users',
				'let': {
					'id': '$fleetManagerId'
				},
				'pipeline': [
					{
						'$match': {
							'$expr': {
								'$and': [
									{
										'$eq': [
											'$_id', '$$id'
										]
									}, {
										'$eq': [
											'$role', 'FleetManager'
										]
									}
								]
							}
						}
					}, {
						'$project': {
							'fullName': 1,
							'phoneCode': 1,
							'contact': 1
						}
					}
				],
				'as': 'FleetManagers'
			}
		}, {
			'$addFields': {
				'FleetManager': '$FleetManagers'
			}
		}, {
			'$unwind': {
				'path': '$FleetManager',
				'preserveNullAndEmptyArrays': true
			}
		}, {
			'$addFields': {
				'FleetManagerId': '$FleetManager._id'
			}
		}, {
			'$lookup': {
				'from': 'users',
				'let': {
					'id': '$_id'
				},
				'pipeline': [
					{
						'$match': {
							'$expr': {
								'$and': [
									{
										'$eq': [
											'$regionId', '$$id'
										]
									}, {
										'$eq': [
											'$fleetManagerId', '$FleetManagerId'
										]
									}
								]
							}
						}
					}
				],
				'as': 'RegionalManager'
			}
		}, {
			'$addFields': {
				'TotalRegionalManager': {
					'$size': '$RegionalManager'
				}
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
									'$regionId', '$$id'
								]
							}
						}
					}
				],
				'as': 'Cars'
			}
		}, {
			'$addFields': {
				'carAssigned': {
					'$size': '$Cars'
				}
			}
		}, {
			'$addFields': {
				'Status': {
					'$cond': {
						'if': {
							'$eq': [
								{
									'$size': '$FleetManagers'
								}, 1
							]
						},
						'then': 'Assigned',
						'else': 'Unassigned'
					}
				}
			}
		},
		{
			$skip: parseInt(skip)
		},
		{
			$limit: parseInt(limit)
		}
	])
	return RegionData
}

const getRegionList = async () => {
	return await RegionModel.find({ isAssigned: false });
}

const getRegionForCar = async () => {
	return await RegionModel.find();
}

const getRegionDetails = async (regionId) => {
	const RegionData = await UserModel.aggregate([
		{
			'$match': {
				'$and': [
					{
						'role': 'FleetManager'
					}, {
						'$or': [
							{
								'regionId': {
									'$eq': null
								}
							}, {
								'regionId': {
									'$eq': new ObjectId(regionId)
								}
							}
						]
					}
				]
			}
		}, {
			'$addFields': {
				'IsAssignedFleetManager': {
					'$cond': {
						'if': {
							'$eq': [
								new ObjectId(regionId), '$regionId'
							]
						},
						'then': 'Unassigned',
						'else': 'Assigned'
					}
				}
			}
		}
	])
	return RegionData
}

const removeFleetManager = async (req) => {
	let { regionId, newFleetManagerId } = req.query
	const regionData = await RegionModel.findById(regionId);
	if (regionData.fleetManagerId) {
		const fleetData = await UserModel.findById(regionData.fleetManagerId)
		await RegionModel.findByIdAndUpdate(regionId, { fleetManagerId: newFleetManagerId })
		await UserModel.findByIdAndUpdate(regionData.fleetManagerId, { $unset: { regionId: "" } })
		await UserModel.findByIdAndUpdate(newFleetManagerId, { regionId: regionId, cars: fleetData.cars })
		await UserModel.updateMany({ role: "RegionalManager", fleetManagerId: regionData.fleetManagerId }, { fleetManagerId: newFleetManagerId })
		await CarModel.updateMany({ regionId: regionId, fleetManagerId: regionData.fleetManagerId }, { fleetManagerId: newFleetManagerId })
	}
	else {
		await RegionModel.findByIdAndUpdate(regionId, { fleetManagerId: newFleetManagerId })
		await UserModel.findByIdAndUpdate(newFleetManagerId, { regionId: regionId })
		await CarModel.updateMany({ regionId: regionId }, { fleetManagerId: newFleetManagerId })
	}
}


// ********************************* FLEETMANAGER related api ************************** //

const addFleetManager = async (body) => {
	const checkUser = await getUserByEmail(body.email)
	if (!checkUser) {
		body.role = 'FleetManager'
		body.isPassSet = false
		const Data = await UserModel.create(body)
		if (Data) {
			if (body.cars) {
				for (var i = 0; i < body.cars.length; i++) {
					await CarModel.findByIdAndUpdate(body.cars[i], { fleetManagerId: Data._id, assignedStatus: true })
				}
			}
			if (body.regionId) {
				await RegionModel.findByIdAndUpdate(body.regionId, { fleetManagerId: Data._id, isAssigned: true })
			}
		}
		return Data
	} else {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_ALREADY_EXIST);
	}

};

const editFleetManager = async (query, body) => {
	const fleetmanagerData = await UserModel.findById(query.fleetManagerId)
	if (fleetmanagerData.cars.length > 0) {
		for (var i = 0; i < fleetmanagerData.cars.length; i++) {
			await CarModel.findByIdAndUpdate(fleetmanagerData.cars[i], { assignedStatus: false })
			await CarModel.updateOne({ _id: fleetmanagerData.cars[i] }, { $unset: { fleetManagerId: "" } })
		}
	}
	if (fleetmanagerData.regionId) {
		await RegionModel.findByIdAndUpdate(fleetmanagerData.regionId, { isAssigned: false })
		await RegionModel.updateOne({ _id: fleetmanagerData.regionId }, { $unset: { fleetManagerId: "" } })
	}

	if (body.cars) {
		for (var i = 0; i < body.cars.length; i++) {
			await CarModel.findByIdAndUpdate(body.cars[i], { fleetManagerId: fleetmanagerData._id, assignedStatus: true })
		}
	}

	if (body.regionId) {
		await RegionModel.findByIdAndUpdate(body.regionId, { fleetManagerId: fleetmanagerData._id, isAssigned: true })
	}
	const Data = await UserModel.findByIdAndUpdate(query.fleetManagerId, body, { new: true })
	return Data

};

const deleteFleetManager = async (fleetManagerId) => {
	const Data = await UserModel.findById(fleetManagerId)

	if (Data.cars.length > 0) {
		for (var i = 0; i < Data.cars.length; i++) {
			await CarModel.findByIdAndUpdate(Data.cars[i], { assignedStatus: false })
			await CarModel.updateOne({ _id: Data.cars[i] }, { $unset: { fleetManagerId: "" } })
		}
	}
	if (Data.regionId && Data.regionId != null) {
		await RegionModel.findByIdAndUpdate(Data.regionId, { isAssigned: false })
		await RegionModel.updateOne({ _id: Data.regionId }, { $unset: { fleetManagerId: "" } })
	}
	await UserModel.deleteMany({ fleetManagerId: fleetManagerId })
	return await UserModel.findByIdAndDelete(ObjectId(fleetManagerId))
};

const getFleetManager = async (req) => {
	let { sort, skip, limit } = getQueryOptions(req.query);
	const FleetManagerData = await UserModel.aggregate([
		{
			'$match': {
				'role': 'FleetManager'
			}
		},
		{
			'$lookup': {
				'from': 'regions',
				'let': {
					'id': '$_id'
				},
				'pipeline': [
					{
						'$match': {
							'$expr': {
								'$eq': [
									'$fleetManagerId', '$$id'
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
									'$fleetManagerId', '$$id'
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
const unassignRegion = async (req) => {
	await RegionModel.findByIdAndUpdate(req.query.regionId, { isAssigned: false })
	await RegionModel.updateOne({ _id: req.query.regionId }, { $unset: { fleetManagerId: "" } })

	const carAssignWith = await CarModel.find({ regionId: req.query.regionId })

	if (carAssignWith.length > 0) {
		for (var i = 0; i < carAssignWith.length; i++) {
			await CarModel.findByIdAndUpdate(carAssignWith[i], { assignedStatus: false })
			await CarModel.updateOne({ _id: carAssignWith[i] }, { $unset: { fleetManagerId: "" } })
		}
	}
	return await RegionModel.findById(req.query.regionId, { name: 1 })
}

const unassignCar = async (req) => {
	await CarModel.findByIdAndUpdate(req.query.carId, { assignedStatus: false })
	await CarModel.updateOne({ _id: req.query.carId }, { $unset: { fleetManagerId: "" } })
	const carData = await CarModel.findById(req.query.carId, { $pull: { "cars": req.query.carId } })
}


// ********************************* CAR related api ************************** //

const addCar = async (body) => {
	return await CarModel.create(body)
};

const editCar = async (query, body) => {
	return await CarModel.findByIdAndUpdate(query.carId, body, { new: true })
};

const getCar = async () => {
	const Data = await CarModel.aggregate([
		{
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
	return Data
}

const getUnAssignCar = async (regionId) => {
	return await CarModel.find({ regionId: ObjectId(regionId), assignedStatus: false })
}

//  ********************************* CAR related api ************************** //

const getDashboardData = async (req) => {
	let filter = {};
	let { dateFilter } = req.query;
	if (req.user.role === "Admin") {
		let fleetManagerIds = [];
		let carId = [];
		if (req.query.fleetManagerIds || req.query.carIds) {
			filter.$or = [];
		}
		if (req.query.fleetManagerIds) {
			req.query.fleetManagerIds = JSON.parse(req.query.fleetManagerIds)
			var array = req.query.fleetManagerIds
			fleetManagerIds = array.map(s => mongoose.Types.ObjectId(s));
			console.log(fleetManagerIds);
			filter.$or.push({
				fleetManagerId: {
					$in: fleetManagerIds
				}
			});
		}
		if (req.query.carIds) {
			req.query.carIds = JSON.parse(req.query.carIds)
			var array = req.query.carIds
			carId = array.map(s => mongoose.Types.ObjectId(s));
			//console.log(carId);
			filter.$or.push({
				_id: {
					$in: carId
				}
			});
		}
		const DashboardData = await CarModel.aggregate([
			{
				'$match': {
					'fleetManagerId': {
						'$ne': null
					},
					'status': "Activate"
				}
			}, {
				$match: filter
			}, {
				'$lookup': {
					'from': 'users',
					'localField': 'fleetManagerId',
					'foreignField': '_id',
					'as': 'FleetMangerData'
				}
			}, {
				'$unwind': {
					'path': '$FleetMangerData'
				}
			}, {
				'$addFields': {
					'fleetId': '$FleetMangerData._id',
					'fleetName': '$FleetMangerData.fullName'
				}
			}, {
				'$group': {
					'_id': {
						'fleetId': '$fleetId',
						'fleetName': '$fleetName'
					},
					'Cardata': {
						'$push': '$$ROOT'
					}
				}
			}
		])
		const nonFlightPromise = DashboardData.map(async (item, index) => {
			let carDetail = item.Cardata
			for (let i = 0; i < carDetail.length; i++) {
				let vehicleId = carDetail[i].vehicleId
				let link = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}`
				await stromMotor(link, "get").then(async (response) => {
					carDetail[i]['data'] = [...response.data.payload]
				}).catch(err => {
					console.log(err);
				})

				let linkData = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}`;
				await stromMotor(linkData, "get").then(async (response) => {
					// console.log(response.data.payload);
					// if (response.data.payload.length > 0) {
					carDetail[i].totalDistance = response.data.payload.totalDistance
					carDetail[i].totalTrip = response.data.payload.totalTrip
					// } else {
					// 	carDetail[i].totalDistance = 0;
					// }
				}).catch(err => {
					console.log(err);
				})
			}
			item.Cardata = carDetail
			return item;
		})
		return Promise.all(nonFlightPromise).then((response) => {
			return response
		})
	}
	else if (req.user.role === "FleetManager") {
		let carId = [], regionalManagerIds = [];
		if (req.query.regionalManagerIds || req.query.carIds) {
			filter.$or = [];
		}
		if (req.query.regionalManagerIds) {
			req.query.regionalManagerIds = JSON.parse(req.query.regionalManagerIds)
			var array = req.query.regionalManagerIds
			regionalManagerIds = array.map(s => mongoose.Types.ObjectId(s));
			filter.$or.push({
				regionalId: {
					$in: regionalManagerIds
				}
			});
		}
		if (req.query.carIds) {
			req.query.carIds = JSON.parse(req.query.carIds)
			var array = req.query.carIds
			carId = array.map(s => mongoose.Types.ObjectId(s));
			filter.$or.push({
				_id: {
					$in: carId
				}
			});
		}
		const DashboardData = await CarModel.aggregate([
			{
				'$match': {
					'fleetManagerId': new ObjectId(req.user.id),
					'assignedStatusRegional': true,
					'status': "Activate"
				}
			}, {
				$match: filter
			}, {
				'$lookup': {
					'from': 'users',
					'localField': 'fleetManagerId',
					'foreignField': '_id',
					'as': 'FleetMangerData'
				}
			}, {
				'$unwind': {
					'path': '$FleetMangerData'
				}
			}, {
				'$addFields': {
					'regionalId': '$FleetMangerData._id',
					'regionalName': '$FleetMangerData.fullName'
				}
			}, {
				'$group': {
					'_id': {
						'regionalId': '$regionalId',
						'regionalName': '$regionalName'
					},
					'Cardata': {
						'$push': '$$ROOT'
					}
				}
			}
		]);
		const nonFlightPromise = DashboardData.map(async (item, index) => {
			let carDetail = item.Cardata
			for (let i = 0; i < carDetail.length; i++) {
				let vehicleId = carDetail[i].vehicleId
				let link = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}`
				await stromMotor(link, "get").then(async (response) => {
					carDetail[i]['data'] = [...response.data.payload]
				}).catch(err => {
					console.log(err);
				});

				let linkData = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}`;
				await stromMotor(linkData, "get").then(async (response) => {
					if (response.data.payload.length > 0) {
						carDetail[i].totalDistance = response.data.payload[0].total
					} else {
						carDetail[i].totalDistance = 0;
					}
				}).catch(err => {
					console.log(err);
				})
			}
			item.Cardata = carDetail
			return item;
		})
		return Promise.all(nonFlightPromise).then((response) => {
			return response
		})
	} else {
		let carId = [];

		if (req.query.carIds) {
			req.query.carIds = JSON.parse(req.query.carIds)
			var array = req.query.carIds
			carId = array.map(s => mongoose.Types.ObjectId(s));
			filter._id = {
				$in: carId
			}
		}
		const DashboardData = await CarModel.aggregate([
			{
				'$match': {
					'regionalManagerId': new ObjectId(req.user.id),
					'assignedStatusRegional': true,
					'status': "Activate"
				}
			}, {
				$match: filter
			}, {
				'$lookup': {
					'from': 'users',
					'localField': 'regionalManagerId',
					'foreignField': '_id',
					'as': 'FleetMangerData'
				}
			}, {
				'$unwind': {
					'path': '$FleetMangerData'
				}
			}, {
				'$addFields': {
					'regionalId': '$FleetMangerData._id',
					'regionalName': '$FleetMangerData.fullName'
				}
			}, {
				'$group': {
					'_id': {
						'regionalId': '$regionalId',
						'regionalName': '$regionalName'
					},
					'Cardata': {
						'$push': '$$ROOT'
					}
				}
			}
		])
		const nonFlightPromise = DashboardData.map(async (item, index) => {
			let carDetail = item.Cardata
			for (let i = 0; i < carDetail.length; i++) {
				let vehicleId = carDetail[i].vehicleId
				let link = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${vehicleId}`
				console.log(link);
				await stromMotor(link, "get").then(async (response) => {
					carDetail[i]['data'] = [...response.data.payload]
				}).catch(err => {
					console.log(err);
				});

				let linkData = dateFilter ? `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}&dateFilter=${dateFilter}` : `${process.env.GET_MOBILE_DATA}/writedata/getritedistance?carId=${vehicleId}`;
				await stromMotor(linkData, "get").then(async (response) => {
					if (response.data.payload.length > 0) {
						carDetail[i].totalDistance = response.data.payload[0].total
					} else {
						carDetail[i].totalDistance = 0;
					}
				}).catch(err => {
					console.log(err);
				})
			}
			item.Cardata = carDetail
			return item;
		})
		return Promise.all(nonFlightPromise).then((response) => {
			return response
		})
	}

}

const getDashboardFilter = async (req, query) => {
	let filter = {
		'fleetManagerId': {
			'$ne': null
		},
		'status': "Activate"
	};

	let { dateFilter } = req.query
	// if(req.query.dateFilter){
	// 	var date = new Date(dateFilter);
	// 	filter.createdAt={
	// 		$gte: new Date(dateFilter),
	// 		$lt: new Date(date.setDate(date.getDate() + 1))
	// 	}
	// }
	let Dashboard;
	if (req.user.role === 'Admin') {
		let searchFilter = {};
		if (req.query.search) {
			const { search } = req.query;
			const searchFields = ["vehicleId", "carName"];
			searchFilter["$or"] = searchFields.map((field) => ({
				[field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
			}));
		}
		Dashboard = await CarModel.aggregate([
			{
				'$match': filter
			},
			{
				'$match': searchFilter
			},
			{
				'$lookup': {
					'from': 'users',
					'localField': 'fleetManagerId',
					'foreignField': '_id',
					'as': 'FleetMangerData'
				}
			}, {
				'$unwind': {
					'path': '$FleetMangerData'
				}
			}, {
				'$addFields': {
					'fleetId': '$FleetMangerData._id',
					'fleetName': '$FleetMangerData.fullName'
				}
			},

			{
				'$group': {
					'_id': {
						'fleetId': '$fleetId',
						'fleetName': '$fleetName'
					},
					'Cardata': {
						'$push': {
							'carName': '$carName',
							'carId': '$_id',
							'vehicleId': '$vehicleId'

						}
					}
				}
			}
		])
	} else if (req.user.role === 'FleetManager') {
		Dashboard = await CarModel.aggregate([

			{
				'$match': {
					'fleetManagerId': new ObjectId(req.user.id),
					'status': "Activate",
					'assignedStatusRegional': true
				}

			},
			// {
			// 	'$match': {
			// 		'regionalManagerId': {
			// 			'$ne': null
			// 		}
			// 	}
			// }, 
			{
				'$lookup': {
					'from': 'users',
					'localField': 'fleetManagerId',
					'foreignField': '_id',
					'as': 'RegionalMangerData'
				}
			}, {
				'$unwind': {
					'path': '$RegionalMangerData'
				}
			}, {
				'$addFields': {
					'fleetId': '$RegionalMangerData._id',
					'fleetName': '$RegionalMangerData.fullName'
				}
			}, {
				'$group': {
					'_id': {
						'fleetId': '$fleetId',
						'fleetName': '$fleetName'
					},
					'Cardata': {
						'$push': {
							'carName': '$carName',
							'carId': '$_id',
							'vehicleId': '$vehicleId'
						}
					}
				}
			}
		]);
	} else {
		Dashboard = await CarModel.aggregate([
			{
				'$match': {
					'regionalManagerId': new ObjectId(req.user.id),
					'status': "Activate"
				}
			}, {
				'$lookup': {
					'from': 'users',
					'localField': 'regionalManagerId',
					'foreignField': '_id',
					'as': 'RegionalMangerData'
				}
			}, {
				'$unwind': {
					'path': '$RegionalMangerData'
				}
			}, {
				'$addFields': {
					'fleetId': '$RegionalMangerData._id',
					'fleetName': '$RegionalMangerData.fullName'
				}
			}, {
				'$group': {
					'_id': {
						'fleetId': '$fleetId',
						'fleetName': '$fleetName'
					},
					'Cardata': {
						'$push': {
							'carName': '$carName',
							'carId': '$_id'
						}
					}
				}
			}
		])
	}
	let finalDashboardData = [];
	for (var i = 0; i < Dashboard.length; i++) {
		// console.log(Dashboard[i].Cardata);
		let cardData = Dashboard[i].Cardata;
		finalDashboardData.push({ _id: Dashboard[i]._id, Cardata: [] });
		for (var j = 0; j < cardData.length; j++) {
			let link = req.query.search ? `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${cardData[j].vehicleId}` : `${process.env.GET_MOBILE_DATA}/writedata/getdatacar?carId=${cardData[j].vehicleId}&dateFilter=${dateFilter}`
			await stromMotor(link, "get").then(async (response) => {
				if (response.data.payload.length > 0) {
					finalDashboardData[i].Cardata.push(cardData[j]);
				}
			}).catch(err => {
				console.log(err);
			});
		}
	}
	return finalDashboardData.filter((a) => a.Cardata.length > 0);
}

const getCarData = async (req) => {
	let { datefilter } = req.query
	if (req.query.carId && req.query.carId !== "undefined") {
		const DashboardData = await CarModel.findOne({ vehicleId: req.query.carId, date: req.query.dateFilter })
		let result;
		await stromMotor(`${process.env.GET_MOBILE_DATA}/writedata/getcartrip?carId=${req.query.carId}&dateFilter=${datefilter}`, "get").then(async (response) => {
			// console.log(dateFilter, 'req.query.dateFilter');
			result = response.data.payload
		}).catch(err => {
			console.log(err);
		})
		return result
	}
	else {
		throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PROVIDE_CARID);
	}
}

const getHeaderData = async (req) => {
	let activeCar, totalCar;
	if (req.user.role === "Admin") {
		activeCar = await CarModel.find({ status: "Activate" }).count()
		totalCar = await CarModel.find().count()
	} else if (req.user.role === "FleetManager") {
		activeCar = await CarModel.find({ status: "Activate", fleetManagerId: ObjectId(req.user.id) }).count()
		totalCar = await CarModel.find({ fleetManagerId: ObjectId(req.user.id) }).count()
	} else {
		totalCar = await CarModel.find({ status: "Activate", regionalManagerId: ObjectId(req.user.id) }).count()
		activeCar = await CarModel.find({ regionalManagerId: ObjectId(req.user.id) }).count()
	}
	return { activeCar, totalCar }
}

module.exports = {
	generateAuthTokens,
	login,
	resetPasswordCheck,
	checkPassword,
	getUserByEmail,
	generateResetPasswordToken,
	resetPassword,
	addRegion,
	editRegion,
	deleteRegion,
	getRegion,
	addFleetManager,
	editFleetManager,
	deleteFleetManager,
	getFleetManager,
	addCar,
	editCar,
	getCar,
	getRegionList,
	getUnAssignCar,
	getRegionForCar,
	setPasswordCheck,
	setPassword,
	generatesetPasswordToken,
	isPassSet,
	getDashboardData,
	unassignRegion,
	unassignCar,
	getRegionDetails,
	getDashboardFilter,
	getCarData,
	getHeaderData,
	removeFleetManager
};