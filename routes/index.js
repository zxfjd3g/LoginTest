var express = require('express');
var router = express.Router();

var loginServer = require('../login/login_server')
loginServer(router)
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
