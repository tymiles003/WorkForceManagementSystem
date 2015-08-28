var ejs       = require("ejs");
var express   = require('express');
var cstmError = require('./errorController');
var reqHandler= require('../rpc/RequestHandler');

exports.guard=function(req,res){
	if(req.session.loginStatus===true){
	 res.render('guard');
	}
	else{
		
		res.redirect('/');
	}
};


exports.test=function(req,res){	
	if(req.session.loginStatus===true){
	 res.render('test');
	}
	else{
		
		res.redirect('/');
	}
};
exports.data=function(req,res)
{
	var data=[{"TaskID":6,"OwnerID":2,"Title":"Call Charlie about the project","Description":"","StartTimezone":null,"Start":"\/Date(1430248020)\/",
		"End":"\/Date(1430248020)\/",
		"EndTimezone":null,"RecurrenceRule":null,"RecurrenceID":null,"RecurrenceException":null,"IsAllDay":false}];
	res.send();
};
exports.raisealert=function(req,res){
	if(req.session.loginStatus===true){
	 res.render('raisealert');
	}
	else{
		
		res.redirect('/');
	}
};
exports.renderSubmitReport=function(req,res){
	
	 res.render('submitreport');
};
exports.guardReports=function(req,res){
	if(req.session.loginStatus===true){
	 res.render('myreports');
	}
	else{
		
		res.redirect('/');
	}
};

exports.renderViewSchedule=function(req,res){
	
	 res.render('viewschedule');
};

exports.getBuildings = function(req, res){
	
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;
	//var reportDate = req.param('reportDate');

	/*TBD: test code remove this line later*/
	console.log("session+"+req.session.userid);
	var guardID =req.session.userid;
	var reportDate = req.param("reportdate");	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === "") &&
	   !(reportDate === undefined ||
		 reportDate === null ||
		 reportDate === ""))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"reportDate":reportDate,
			"request":"getBuildings"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
					//console.log(results.error);
				}
				else
				{
					//console.log(results.data);
					res.send({'buildings':results.data});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.getCheckPoints = function(req, res){
	var buildingID = 1;
	if(!(buildingID === undefined ||
		 buildingID === null ||
		 buildingID === ""))
	{
		var msg_payload=
		{
			"buildingID":buildingID,
			"request":"getCheckPoints"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send(results.data);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.getPatrolTimings = function(req, res){
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;
	//var buildingID = req.param('buildingID');

	/*TBD: test code remove this line later*/
	var buildingID = req.param('buildingId');
	var reportDate=req.param('reportDate');
	var guardID = 1;
	if(!(buildingID === undefined ||
		 buildingID === null ||
		 buildingID === "")&&
		 !(guardID === undefined ||
		   guardID === null ||
	       guardID === "")&&
	       !(reportDate === undefined ||
	    		   reportDate === null ||
	    		   reportDate === ""))
		{
	    	       
	 var msg_payload=
		{
			"guardID":guardID,	
			"buildingID":buildingID,
			"reportDate":reportDate,
			"request":"getPatrolTimings"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{	
					var delta = results.data.endTime - results.data.startTime;
					if(delta > 0)
					{
						var timeGap = delta/4;
						var timeSlots = [];
						var Slot = results.data.startTime;
						for(var i = 0; i <= 4; i ++)
						{
							timeSlots.push((new Date((Slot)*1000)).toLocaleString());
							Slot += timeGap;
						}
						/*//console.log("got the first time slot " + timeSlots[1]);
						
								//console.log("got the second time slot " + timeSlots[1]);
					//console.log("got the third time slot " + timeSlots[2]);
						//console.log("got the fourth time slot " + timeSlots[3]);
						//console.log("got the fifth time slot " + timeSlots[4]);*/
						
						/*TBD: change the response send as needed*/
						res.send(timeSlots);
					}
					else
					{
						/*TBD: change the response send as needed*/
						res.send({'patrolTimings':null});
					}
					
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};




function concatMSData(data)
{
	var str="";
    for(var i=0;i<data.length;i++){
        var obj = data[i].msDescription;    
     str = obj+(str!=""?('$$$$'+str):str);   
    }  
return str;
}
function concatData(data)
{
	var str="";
    for(var i=0;i<data.length;i++){
        var obj = data[i].Description;    
     str = obj+(str!=""?('$$$$'+str):str);   
    }  
return str;
}





exports.logReport = function(req, res){
	/*TBD: un-comment this line for final code*/
	//var logData = req.param('logData');
	//var guardID = req.session.guardID;

	/*TBD: test code remove this line later*/
	var guardID = req.session.userid;
	var reportDate=req.param('reportDate');
	var buildingId=req.param('buildingId');
	var checkinID=req.param('checkinID');
	var disposition=req.param('disposition');
	var mtnSerivce=req.param('mtnSerivce')!=undefined?concatData(req.param('mtnSerivce')):null;	
	var callOfService=req.param('callOfService')!=undefined?concatData(req.param('callOfService')):null;	
	var incidents=req.param('incidents')!=undefined?concatData(req.param('incidents')):null;	
	var parkingViolation=req.param('parkingViolation')!=undefined?concatData(req.param('parkingViolation')):null;	
	var patrolTime=req.param('patrolTime');		
	var logData = {
					"guardID": guardID,
					"reportDate": reportDate,
					"checkinID": checkinID,
					"buildingId":buildingId,
					"patrolTime": patrolTime,
					"disposition":disposition ,
					"mtnSerivce": mtnSerivce,
					"incident": incidents,
					"parkingViolation": parkingViolation,
					"callOfService": callOfService
				};
	//console.log(patrolTime);
	if(!(logData === undefined ||
		 logData === null ||
		 logData === ""))
	{
		var msg_payload =
		{
			"logData":logData,
			"request":"logReport"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					res.send({'logreport':results.data});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.getAlertType = function(req, res){
	
	var msg_payload=
	{
		"request":"getAlertType"
	};
	reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
		if(err)
		{
			//console.log(err);
			res.send(err);
		}
		else
		{	
			if(results.error)
			{
				cstmError.mySqlException(results.error, res);
			}
			else
			{
				//console.log("success "+results.data[0]);
				/*TBD: change the response send as needed*/
				res.send(results.data);
			}
		}
	});
};

exports.submitAlert = function(req, res){
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;
	var buildingID = req.param('buildingId');
	var reportDate = req.param('reportDate');
	var alertTypeId = req.param('alertTypeId');
	var description = req.param('description');
	var severity = req.param('severity');

	/*TBD: test code remove this line later*/
	var guardID = req.session.userid;
	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === "") &&
	   !(reportDate === undefined ||
		 reportDate === null ||
		 reportDate === "")&&
		!(buildingID === undefined ||
		  buildingID === null ||
	      buildingID === "")&&
	    !(alertTypeId === undefined ||
	      alertTypeId === null ||
	      alertTypeId === ""))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"reportDate":new Date(reportDate),
			"buildingID":buildingID,
			"alertTypeId":alertTypeId,
			"description":description,
			"severity":severity,
			"request":"submitAlert"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					//TBD: change the response send as needed
					res.send({'submitAlert':"Success"});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};


exports.submitReport = function(req, res){
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;
	var buildingID = req.param('buildingId');
	var reportDate = req.param('reportDate');
	var isSubmitted = 1;

	/*TBD: test code remove this line later*/
	var guardID = req.session.userid;
	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === "") &&
	   !(reportDate === undefined ||
		 reportDate === null ||
		 reportDate === "")&&
		!(buildingID === undefined ||
		  buildingID === null ||
	      buildingID === "")&&
	     (isSubmitted === 1))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"reportDate":reportDate,
			"buildingID":buildingID,
            "isSubmitted":isSubmitted,
			"request":"submitReport"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send({'submitReport':"Success"});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};


exports.displayGuardReport = function(req, res){
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;
	var reportDate = req.param('reportDate');
	var buildingId=req.param('buildingId');
	/*TBD: test code remove this line later*/
	var guardID =req.session.userid;
	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === "") &&
	   !(reportDate === undefined ||
		 reportDate === null ||
		 reportDate === "")&&
	!(buildingId === undefined ||
			buildingId === null ||
				 buildingId === "")
		 	 
	)
	{
		var msg_payload=
		{
			"guardID":guardID,
			"reportDate":reportDate,
			"buildingId":buildingId,
			"request":"displayGuardReport"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					console.log(results.error);
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					console.log("success "+results.data);
					/*TBD: change the response send as needed*/
					res.send({'report':results.data});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};
exports.viewSchedule = function(req, res){
	
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;

	/*TBD: test code remove this line later*/
	var guardID = req.session.userid;
	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === ""))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"request":"viewSchedule"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send(results.data);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};
exports.getAllGuardReports = function(req, res){
	
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;

	/*TBD: test code remove this line later*/
	var guardID = req.session.userid;
	
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === ""))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"request":"getAllGuardReports"
		};
		reqHandler.makeRequest('_guardQueue',msg_payload, function(err,results){			
			if(err)
			{
				//console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send(results.data);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};