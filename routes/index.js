
/*
 * GET home page.
 */

var config = require('../config');

exports.config = function(req, res) {
  res.status(200).json(config);
}

exports.index = function(req, res){
  res.render('index');
};