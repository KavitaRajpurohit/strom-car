class Messages {
	static LOGIN = 'You have successfully logged in';
	static PASSWORD_NOT_MATCH = 'Password does not match'
	static REGISTER_SUCCESS = 'You have successfully registered, please verify your account to login';
	static VERIFIED_SUCCESS = 'User verified successfully, now you can login';
	static REGISTERED_WITH_FACEBOOK = 'You have registered your account using  Facebook. Please use sign-in via Facebook to successfully login to your account.';
	static REGISTERED_WITH_GOOGLE = 'You have registered your account using Google. Please use sign-in via Google to successfully login to your account.';
	static REGISTERED_WITH_APPLEID = 'You have registered your account using AppleId. Please use sign-in via AppleId to successfully login to your account.';
	static REGISTERED_WITH_EMAIL = 'You have registered your account using Emailid. Please use sign-in via Email to successfully login to your account.';
	static EMAIL_TAKEN = 'Email already used.';
	static ALREADY_EXITS = 'Account having same email already exist';
	static ALREADY_VERIFY = 'Your account is already verifeid';
	static EMAIL_NOT_FOUND = 'Account not find with given email id';
	static PASSWORD_NOT_MATCH = 'Password does not match';
	static PASSWORD_CHANGE_FAILED = 'Password change failed';
	static PASSWORD_CHANGE_SUCCESS = 'Password changed successfully.'
	static NEW_OLD_SAME = 'New password should not same as old current password';
	static OLD_NOT_MATCH = 'Old password doesnot match, please try again with right current password';
	static FORGOT_PWD_SUCCESS = 'Reset password link successfully sent to your registered email account';
	static USER_NOT_FOUND = 'User not found';
	static RESET_PWD_SUCCESS = 'Password reset successfully.';
	static ACC_NOT_VERIFIED = 'Account not verified.'
	static REGISTER = "Registered using social media";
	static SUB_DATA_SAVED = 'Subscription data saved';
	static LETEST_SUBS = 'Letest subcription';
	static PREFERENCE = 'Preference fetched successgfully';

	static INVALID_TOKEN = 'Invalid token';
	static REFRESH_TOKEN = 'Refresh token.'

	static EMAIL_ALREADY_EXIST = 'This email address is already registered with us. Please use another email address'
	static SET_PASSWORD_EXPIRE = 'Unfortunately, this link is expired'
	static SET_PASSWORD_SUCCESS = 'Your password has been set successfully, Now you can login using Email and Password.'
	static RE_RESET_PASSWORD = 'Unfortunately, this is expired. Please request a new link by clicking "forgot password" on the login panel.'
	static PASSWORD_NOT_SET = 'Password not set yet, please set password first'

	static REGION_ADD = 'Region Added successfully'
	static REGION_EDIT = 'Region Edited successfully'
	static REGION_DELETE = 'Region Deleted successfully'
	static GET_REGION = 'Region list get successfully'

	static FLEET_ADD = 'Fleetmanager Added successfully'
	static FLEET_EDIT = 'Fleetmanager Edited successfully'
	static FLEET_DELETE = 'Fleetmanager Deleted successfully'
	static FLEET_GET = 'Fleetmanager list get successfully'

	static REGIONAL_ADD = 'RegionalManager Added successfully'
	static REGIONAL_EDIT = 'RegionalManager Edited successfully'
	static REGIONAL_DELETE = 'RegionalManager Deleted successfully'
	static REGIONAL_GET = 'RegionalManager list get successfully'

	static CAR_ADD = 'Car Added successfully'
	static CAR_EDIT = 'Car Updated successfully'
	static CAR_GET = 'Car list get successfully'

	static DASHBOARD = 'Dashboard data fetched successfully'
	static PROVIDE_CARID = "Please Provide carId"
	static CARDATA = "Car data fetched successfully"
	static USERDATA = "UserData fetched success"

	static HEADER_DATA ="Header data fetched successfully"

	static REMOVE_DEPENDENCY = 'Please remove all dependency first to delete region'
}

module.exports = Messages;
