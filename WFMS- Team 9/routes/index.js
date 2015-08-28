
/*
 * GET home page.
 */
var ejs       = require("ejs");
var express   = require('express');
var cstmError = require('./errorController');
var reqHandler= require('../rpc/RequestHandler');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.home = function(req, res){
	  res.render('home');
	};

