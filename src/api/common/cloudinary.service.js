const cloudinary = require('../../config/cloudinary');
const AppError = require('../../utils/AppError');
const httpStatus = require('http-status');

const uploadOnCloudinary = async (filePath, originalname) => {
	try {
		let obj;
		let check = originalname.split('.').pop();
		if (check === 'docx' || check === 'doc' || check === 'xlsx' || check === 'xls') {
			obj = {
				folder: process.env.CLOUDINARY_FOLDER,
				resource_type: 'raw',
				public_id: originalname,
			};
		} else {
			obj = {
				folder: process.env.CLOUDINARY_FOLDER
			};
		}
		const imageData = await cloudinary.v2.uploader.upload(filePath, obj);
		return imageData;
	} catch (err) {
		throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Fail to upload on cloudinary');
	}
};

module.exports = { uploadOnCloudinary }; 