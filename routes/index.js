
/*
 * GET home page.
 */

var config = require('../config');

exports.config = function(req, res) {
  res.status(200).json(config);
}

exports.index = function(req, res) {
  res.render('index');
};

exports.partial = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};