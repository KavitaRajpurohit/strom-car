const router = require('express').Router();
 
router.route('/').get((req, res) => {
	res.send('API working fine');
});

module.exports = router;