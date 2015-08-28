var ejs = require("ejs");
var mq_client= require('../rpc/RequestHandler');
var cstmError = require('./errorController');


 
exports.searchReports = function(req, res){
	  res.render('searchReports');
	};

exports.searchAlerts = function(req, res){
	  res.render('searchAlerts');
	};
	
exports.searchBill = function(req,res){
	res.render('searchBill');
};	
exports.myalerts=function(req,res){
	res.render('clientalerts');
};
exports.renderClientReports=function(req,res){
	
	res.render('clientreports');
};
exports.searchBill = function(req,res){		
	var clientId = req.param("clientId");
	var billFromdate = req.param("billFromdate");
	var billTodate = req.param("billTodate");
	
	console.log("clientId:"+clientId);
	console.log("bill from date:"+billFromdate);
	console.log("bill to date :"+billTodate);
	
	if((clientId !== null && clientId !== undefined) &&
	   (billFromdate !== null && billFromdate !== undefined) &&
	   (billTodate !== null && billTodate !== undefined))
	{
		var msg_payload={
				"url": "searchbill", 
				"clientId": clientId, 
				"billFromdate":new Date(billFromdate), 
				"billTodate": new Date(billTodate)
		};
		
		mq_client.make_request('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at searchAlerts:" +JSON.stringify(result));
					res.send(result);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};


exports.clientcriteria = function(req,res){		
		
	if(req.session.userId !== null &&
	   req.session.userId !== undefined)
	{
		var msg_payload={ "url": "clientcriteria", "userId": req.session.userId };
		mq_client.make_request('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at clientcriteria:" +JSON.stringify(result));
					res.send(result);
				}
			}	
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.buildingcriteria = function(req,res){		
	var clientId = req.param("clientId");

	if(clientId !== null && clientId !== undefined)
	{
		var msg_payload={ "url": "buildingcriteria", "clientId": clientId};

		
		mq_client.makeRequest('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at buildingcriteria:" +JSON.stringify(result));
					res.send(result);
				}
			}				
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.searchReports = function(req,res)
{		
	var clientId = req.param("clientId");
	var buildingId = req.param("buildingId");
	var reportFromdate = req.param("reportFromdate");
	var reportTodate = req.param("reportTodate");

	if((clientId !== null && clientId !== undefined)&&
	   (buildingId !== null && buildingId !== undefined)&&
	   (reportFromdate !== null && reportFromdate !== undefined)&&
	   (reportTodate !== null && reportTodate !== undefined))
	{
		var msg_payload={"url": "searchreports", 
				"clientId": clientId,
				"buildingId": buildingId, 
				"reportFromdate" :new Date(reportFromdate), 
				"reportTodate" : new Date(reportTodate)
			};

		
			mq_client.make_request('_clientQueue', msg_payload, function(err, result){
				if(err)
				{				
					res.send(err);
				}
				else
				{	
					if(result.error)
					{
						cstmError.mySqlException(result.error, res);
						console.log(result.error);
					}
					else
					{
						console.log("result at searchReports:" +JSON.stringify(result));
						res.send(result);
					}
				}	
			});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};


exports.alertcriteria = function(req,res){		
	 
			
	var msg_payload={"url": "alertcriteria"};
		mq_client.make_request('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at alertcriteria:" +JSON.stringify(result));
					res.send(result);
				}
			}
		});
};


exports.getClientAlerts = function(req,res){		
	 
			
	var msg_payload={"url": "getClientAlerts","clientId":10};
		mq_client.makeRequest('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at alertcriteria:" +JSON.stringify(result));
					res.send(result.alerts);
				}
			}
		});
};





exports.getclientreports = function(req,res){		
	 
			
	var msg_payload={"url": "getclientreports","clientId":10};
		mq_client.makeRequest('_clientQueue', msg_payload, function(err, result){
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(result.error)
				{
					cstmError.mySqlException(result.error, res);
					console.log(result.error);
				}
				else
				{
					console.log("result at alertcriteria:" +JSON.stringify(result));
					res.send(result.reports);
				}
			}
		});
};


exports.searchAlerts = function(req,res)
{		
	var clientId = req.param("clientId");
	var buildingId = req.param("buildingId");
	var alertTypeId = req.param("alertTypeId");
	var severity = req.param("severity");
	var alertFromdate = req.param("alertFromdate");
	var alertTodate = req.param("alertTodate");
	
	if((clientId !== null && clientId !== undefined)&&
			   (buildingId !== null && buildingId !== undefined)&&
			   (alertTypeId !== null && alertTypeId !== undefined)&&
			   (severity !== null && severity !== undefined)&&
			   (alertFromdate !== null && alertFromdate !== undefined)&&
			   (alertTodate !== null && alertTodate !== undefined))
	{
		var msg_payload={"url": "searchalerts",
				"clientId": clientId,
				"buildingId": buildingId,
				"alertTypeId":alertTypeId, 
				"severity":severity,
				"alertFromdate":new Date(alertFromdate),
				"alertTodate":new Date(alertTodate)
				};
				
			mq_client.make_request('_clientQueue', msg_payload, function(err, result)
			{
				if(err)
				{				
					res.send(err);
				}
				else
				{	
					if(result.error)
					{
						cstmError.mySqlException(result.error, res);
						console.log(result.error);
					}
					else
					{
						console.log("result at searchAlerts:" +JSON.stringify(result));
						res.send(result);
					}
				}
			});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};