const axios = require('axios')
const stromMotor = (url, method, body) => {
    const options = {
        url,
        method,
        data: method !== "GET" ? body : null
    };

    // options.headers = Object.assign(options.headers, { 'Content-Type': 'multipart/form-data' })

    // options.headers = { Authorization: process.env.FLESPITOKEN }
    return axios.request(options)
};

module.exports = { stromMotor }