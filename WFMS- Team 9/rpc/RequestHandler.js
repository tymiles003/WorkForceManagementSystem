/**
 * New node file
 */
var amqp = require('amqp');
var connection = amqp.createConnection({host:'127.0.0.1'});
var rpc = new (require('./amqrpc'))(connection);

function makeRequest(_requestQueue, msg_payload, callback){	
	var connection = amqp.createConnection({host:'127.0.0.1'});
	//var rpc = new (require('./amqrpc'))(connection);
	rpc.makeRequest(_requestQueue, msg_payload, function(err, response){
		//console.log("err"+err);
		if(err){
			console.log(err);
		}
		else{
			//console.log("response", response);
			callback(null, response);
		}
		connection.end();
	});
}
exports.makeRequest = makeRequest;