const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const config = require('../../config/config');
// const logger = require('../../config/logger');
const sgTransport = require('nodemailer-sendgrid-transport');
let BASE_PATH = __dirname.split('/');
BASE_PATH.splice(-1, 1);
BASE_PATH = BASE_PATH.join('/');

const emailConfig = () => {
	var options = {
		service: 'SendGrid',
		auth: {
			api_key: process.env.SEND_GRID_KEY
		}
	};
	return options;
};

const transporter = nodemailer.createTransport(sgTransport(emailConfig()));
const mailBody = (to, htmlToSend, subject) => {
	var mailOptions = {
		from: process.env.EMAIL_FROM,
		to: to,
		fromname: 'Strom-Motors',
		replyTo: process.env.EMAIL_FROM,
		subject: subject,
		html: htmlToSend
	};
	return mailOptions;
};

const sendEmail = async (mailOptions) => {
	var info = '';
	try {
		info = await transporter.sendMail(mailOptions);
	} catch (error) {
	}
	return info;
};

const sendForgotPasswordEmail = async (to, body) => {
	console.log(body, 'body>>>');
	const subject = 'Password Reset On Strom Motors'
	const html = fs.readFileSync(path.join(BASE_PATH, '/public/template/ForgotPassword.html'), { encoding: 'utf-8' })
	var url = `${process.env.HOST}/resetpassword?token=${body.token}`

	const template = handlebars.compile(html)
	const htmlToSend = template({
		name:body.fullName,
		email: body.email,
		url,
	})
	const mailOptions = mailBody(to, htmlToSend, subject)
	await sendEmail(mailOptions)
}

const setPasswordEmail = async (to, body) => {
	console.log(body, 'body');
	const subject = 'Set Your Strom-Motors Password?';
	const html = fs.readFileSync(path.join(BASE_PATH, "/public/template/SetPassword.html"), { encoding: "utf-8" });


	var url = `${process.env.HOST}/setpassword?token=${body.token}`;

	const template = handlebars.compile(html);   

	const htmlToSend = template({
		name: body.RegionalData ? body.RegionalData.fullName  : body.FleetData.fullName  ,
		url,
	});
	const mailOptions = mailBody(to, htmlToSend, subject)
	await sendEmail(mailOptions)
}
module.exports = {
	emailConfig,
	mailBody,
	sendEmail,
	sendForgotPasswordEmail,
	setPasswordEmail
};
