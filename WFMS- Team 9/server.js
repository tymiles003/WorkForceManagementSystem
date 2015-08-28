var amqp = require('amqp'), util = require('util');
var guard = require('./services/GuardService');
var admin=require('./services/AdminService');
var client=require('./services/ClientService');
//var building=require

var dbConnectionPool = require('./services/dbConnectionsController');
//initializing the pool size to 100 connections.
dbConnectionPool.initConnectionPool(100);

var sqlCache = require('./services/SqlCacheService');
//initiliazing SQL cache
sqlCache.SQLCacheInit();

var connection = amqp.createConnection({host:'127.0.0.1'});

connection.on('ready', function(){
	
	console.log("listening to Guard Queue");
	connection.queue('_guardQueue', function(queue){
		queue.subscribe(function(message, headers, deliveryInfo, msgObject){
			util.log("Message: "+JSON.stringify(message));
			guard.handle_request(message, function(err,res){	
						connection.publish(msgObject.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8', 	
						correlationId:msgObject.correlationId
					});				
			});
		});
	});
	
	console.log("listening to Admin Queue");
	connection.queue('_adminQueue', function(queue){
		queue.subscribe(function(message, headers, deliveryInfo, msgObject){	
			util.log("Message: "+JSON.stringify(message));
			admin.handle_request(message, function(err,res){									
						connection.publish(msgObject.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8', 	
						correlationId:msgObject.correlationId
					});				
			});
		});
	});
	
	console.log("listening to Client Queue");
	connection.queue('_clientQueue', function(queue){
		queue.subscribe(function(message, headers, deliveryInfo, msgObject){	
			util.log("Message: "+JSON.stringify(message));
			client.handle_request(message, function(err,res){									
						connection.publish(msgObject.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8', 	
						correlationId:msgObject.correlationId
					});				
			});
		});
	});
	
	
	/*console.log("listening to Building Queue");
	connection.queue('buildingQueue', function(queue){
		queue.subscribe(function(message, headers, deliveryInfo, msgObject){					
			building.handle_request(message, function(err,res){									
						connection.publish(msgObject.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8', 	
						correlationId:msgObject.correlationId
					});				
			});
		});
	});
	
	console.log("listening to Report Queue");
	connection.queue('reportQueue', function(queue){
		queue.subscribe(function(message, headers, deliveryInfo, msgObject){					
			report.handle_request(message, function(err,res){									
						connection.publish(msgObject.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8', 	
						correlationId:msgObject.correlationId
					});				
			});
		});
	});*/
	
	
	
	
	
}); //end of connection