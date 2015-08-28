var ejs = require("ejs");
var express = require('express');
var cstmError = require('./errorController');
var reqHandler= require('../rpc/RequestHandler');


exports.client=function(req,res){
console.log(req.session.loginStatus);
	if(req.session.loginStatus===true)
	{	
	res.render('createclient');
	}
	else{
		
		res.redirect('/');
	}
};
exports.signout=function(req,res){		
	req.session.destroy(function(){
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
		res.redirect('/');
	});

};
exports.index = function(req, res){
	if(req.session.loginStatus===true){
  res.render('index');
	}
	else{
		
		res.redirect('/');
	}
};

exports.alerts=function(req,res){
	if(req.session.loginStatus===true)
	{	
	res.render('alerts');
	}
	else{
		
		res.redirect('/');
	}
	
};

exports.renderCreateBuilding=function(req,res){
	if(req.session.loginStatus===true)
	{	
	res.render('createbuilding');
	}
	else{
		
		res.redirect('/');
	}
	
};

exports.editbuilding=function(req,res){

	res.render('editbuilding');
	
	
	
};
exports.renderListClient=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('listclients');
	}
else{
		
		res.redirect('/');
	}
};

exports.guard=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('createguard');
	}
	else{
		res.redirect('/');
	}
};

exports.renderListGuard=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('listguards');}
	else{
		res.redirect('/');
	}
};

exports.reports=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('reports');
	}
	else{
		res.redirect('/');
	}
};

exports.rendercreateschedule=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('schedule');
	}
	else{
		res.redirect('/');
	}
};
exports.rendereditschedule=function(req,res){
	if(req.session.loginStatus===true)
	{
	res.render('editschedule');
	}
	else{
		res.redirect('/');
	}
};
exports.createAlert=function(req,res){	
	if(req.session.loginStatus===true)
	{
	res.render('createalert');
	}
	else{
		res.redirect('/');
	}
};

exports.authValidate=function(req,res){
	
	
	var email=req.param("email"),password=req.param("password");
	var roleId=req.param('roleId');
	console.log("In RMQC:createClient Module"+email+roleId+password);
	if((email!==undefined &&  password!==undefined && roleId!==undefined) &&
	   (email!==""  && password!=="" && roleId!==""))
	{
		var msg_payload={				
			"email":email,			
			"password":password,
			"roleId":roleId,
			requestQueue:"login"
		};				
		console.log("In RMQC:calling Client Service for create client");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
			if(err){					
				res.send(err);	
			}
			else{	
				
				if(results.error)
				{
					console.log('inside error'+results.error);
					//res.error=results.error;
					res.send({"error":results.error});
				}
				else {	
				//	console.log('msg'+results.userid);
					req.session.loginStatus=true;					
					req.session.userid=results.userid;	
					
					//	res.render('/index');
					res.send({"roleid":results.roleId});
					
				}
			}
		});//Queue makeRequest call
		
	}// check not null
	else
	{
		res.send({error:'Please fill all the manidatory fields'});	
	}//check for mandatory fields else

	
	
};// createClient function


//------------------------------------------Create Client------------------------------------------
exports.createClient=function(req,res){
	if(req.session.loginStatus===true){
	var email=req.param("email"),password=req.param("password");
	var firstName=req.param("firstName"),lastName=req.param("lastName");
	var addressLine1=req.param("addressLine1"),addressLine2=req.param("addressLine2");
	var city=req.param("city"),state=req.param("state"),zipCode=req.param("zipCode");
	var phoneNumber=req.param("phoneNumber"),userSSN=req.param("userSSN");
	var startDate=req.param("startDate"),endDate=req.param("endDate"),serviceFee=req.param("serviceFee");
	var roleId=req.param('roleId');
	console.log("In RMQC:createClient Module");
	if((email!==undefined && firstName!==undefined && lastName!==undefined && addressLine1!==undefined && city!==undefined && zipCode!==undefined && phoneNumber!==undefined && userSSN!==undefined && startDate!==undefined && serviceFee!==undefined) &&
	   (email!==""  && firstName!=="" && lastName!=="" && addressLine1!=="" && city!=="" && zipCode!=="" && phoneNumber!=="" && userSSN!=="" && startDate!=="" && serviceFee!==""))
	{
		var msg_payload={				
			"email":email,
			
			"firstName":firstName,
			"lastName":lastName,
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"phoneNumber":phoneNumber,
			"userSSN":userSSN,
			"startDate":new Date(startDate),
			"endDate":new Date(endDate),
			"serviceFee":serviceFee,
			"password":password,
			"roleId":roleId,
			requestQueue:"createClient"
		};				
		console.log("In RMQC:calling Client Service for create client");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
			console.log("In RMQC:Got return call Client Service");
			console.log(results);
			if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
			else
			{
				res.send({'msg':'Client Created Successfully'});
			}//Error check else
		});//Queue makeRequest call
		
	}// check not null
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);	
	}//check for mandatory fields else
	}
	else{
		res.redirect('/');
	}
};// createClient function

//------------------------------------------List Client------------------------------------------
exports.getClients=function(req,res){
	if(req.session.loginStatus===true){
	var msg_payload = {					
					requestQueue:"listClient"
			};
	console.log("In RMQC:calling Client Service for listClients");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.clients);
			}//Else - Error check
	});//Queue makeRequest call 
}
	else{
		
res.redirect('/');
	}
};//listClient fucntion

//------------------------------------------Search Client----------------------------------------------------------------
exports.searchClient=function(req,res){
	
};//searchClient fucntion

//------------------------------------------Delete Client----------------------------------------------------------------
exports.deleteClient=function(req,res){
	//var clientId=req.param("clientId");
	if(req.session.loginStatus===true){
	var model=JSON.parse(req.param('models'));
	var clientId=model[0].userId;
	console.log("In RMQC:deleteClient Module");
	
	if((clientId!==undefined) && (clientId!==""))
	{
		var msg_payload = {
				"clientId":clientId,
				requestQueue:"deleteClient"
			};
		console.log("In RMQC:calling Client Service for deleteClients");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for deleteClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send({'msg':'Client Deleted Successfully'});
			}//Else - Error check
		});//Queue makeRequest call 
			
	}//Check if clientId is not null
	else
	{
		cstmError.throwException('ClientId cannot be null!!', res);	
	}//Else-Check if clientId is not null
	}
	else{
		res.redirect('/');
	}
};//deleteClient fucntion

//------------------------------------------Edit Client------------------------------------------
exports.editClient=function(req,res){
	if(req.session.loginStatus===true){
	var model=JSON.parse(req.param('models'));
	var firstName=model[0].firstName,lastName=model[0].lastName;
	//console.log("mde:"+model[0].firstName);
	var addressLine1=model[0].addressLine1,addressLine2=model[0].addressLine2;
	var city=model[0].city,state=model[0].state,zipCode=model[0].zipCode;
	var phoneNumber=model[0].phno;
	var userId=model[0].userId;
	var serviceFee=model[0].serviceFee;
	var startDate=new Date(model[0].clientStartDate);
	var endDate=new Date(model[0].clientEndDate);
	//console.log(serviceFee);
	console.log("In RMQC:editClient Module"+(firstName!==undefined && lastName!==undefined && addressLine1!==undefined && city!==undefined && state!==undefined && zipCode!==undefined && phoneNumber!==undefined) );
	if((firstName!==undefined && lastName!==undefined && addressLine1!==undefined && city!==undefined && state!==undefined && zipCode!==undefined && phoneNumber!==undefined && serviceFee!==undefined && startDate!==undefined && endDate!=undefined) &&
	   (firstName!=="" && lastName!=="" && addressLine1!=="" && city!=="" && state!=="" && zipCode!=="" && phoneNumber!==""&& serviceFee!=="" && startDate!=="" && endDate!=""))
	{
		var msg_payload={	
			"userId":userId,
			"firstName":firstName,
			"lastName":lastName,
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"phoneNumber":phoneNumber,
			"serviceFee":serviceFee,
			"startDate":startDate,
			"endDate":endDate,
			//"userSSN":userSSN,
			requestQueue:"editClient"
		};
		
		console.log("In RMQC:calling Client Service for create client");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for edit client");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send([]);
			}//Error check else
		});//Queue makeRequest call
	}//// check not null
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);	
	}//check for mandatory fields else
	}
	else{
		res.redirect('/');
	}
};//editClient fucntion
// --------------------------------------------------------------

exports.getAllBuildingDetails=function(req,res){
	
	var msg_payload = {					
					requestQueue:"getAllBuildingDetails"
			};
	console.log("In RMQC:calling Client Service for listClients");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.data);
			}//Else - Error check
	});//Queue makeRequest call 
};//listClient fucntion


exports.getBuildingDetails=function(req,res){
	if(req.session.loginStatus===true){
	var buildingId=req.param('buildingId');
	if(buildingId!=null && buildingId!="" && buildingId!=undefined )
		{
	var msg_payload = {			
			buildingId:buildingId,
						requestQueue:"getBuildingDetails"
					};
	
				console.log("In RMQC:calling Client Service for listClients");
			reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
						console.log("In RMQC:Got return call Client Service for listClients");
						if(results.error)
							{
								console.log(results.error);
								res.send({"error":results.error});
							}//Error check
						else
							{
							console.log(results.bldng);
								res.send({"bldng":results.bldng,"checkpoints":results.checkpoints});
							}//Else - Error check
				});
		}
	}else{res.redirect('/');}
};


//----------------------------------------------------------------------------------------------------------------------------------------

exports.getClientById=function(req,res){
	if(req.session.loginStatus===true){
	var clientId=req.param('clientId');
	if(clientId!=null && clientId!="" && clientId!=undefined )
		{
	var msg_payload = {			
						clientId:clientId,
						requestQueue:"getClientDetails"
					};
	
				console.log("In RMQC:calling Client Service for listClients");
			reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
						console.log("In RMQC:Got return call Client Service for listClients");
						if(results.error)
							{
								console.log(results.error);
								res.send({"error":results.error});
							}//Error check
						else
							{
							console.log(results.client);
								res.send({"client":results.client});
							}//Else - Error check
				});
		}
	}else{res.redirect('/');}
};




exports.getClientBuildings=function(req,res){
	if(req.session.loginStatus===true){
	var clientId=req.param('clientId');
	if(clientId!=null && clientId!="" && clientId!=undefined )
		{
	var msg_payload = {			
						clientId:clientId,
						requestQueue:"getClientBuildings"
					};
	
				console.log("In RMQC:calling Client Service for listClients");
			reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
						console.log("In RMQC:Got return call Client Service for listClients");
						if(results.error)
							{
								console.log(results.error);
								res.send({"error":results.error});
							}//Error check
						else
							{
								res.send({"buildings":results.clientbuildings});
							}//Else - Error check
				});
		}
	}
	else{res.redirect('/');}
};

exports.getBuildings = function(req, res){

	if(req.session.loginStatus===true){
		var msg_payload=
		{
		
				requestQueue:"getBuildings"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
					console.log(results.error);
				}
				else
				{
			//	console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send(results.data);
				}
			}
		});
	}
	else{res.redirect('/');}
};




exports.getGuardBuildings = function(req, res){

	if(req.session.loginStatus===true){
		var msg_payload=
		{
		
			requestQueue:"getGuardBuildings"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{				
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					cstmError.mySqlException(results.error, res);
					console.log(results.error);
				}
				else
				{
			//	console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send({"buildings":results.buildings});
				}
			}
		});
	}
	else{res.redirect('/');}
};


//------------------------------------------List Reports for all Buildings------------------------------------------
exports.listReportAllBuildings=function(req,res){
	
	if(req.session.loginStatus===true){
	var msg_payload = {					
					requestQueue:"listReportAllBuilding"
			};
	console.log("In RMQC:calling listReportAllBuilding Service");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.reports);
			}//Else - Error check
	});//Queue makeRequest call 
	}
	else{
		res.redirect('/');
	}
};//
//------------------------------------------List Reports  for a client------------------------------------------
exports.listReportClient=function(req,res){

	var clientId = req.param("clientId");
	var msg_payload = {			
					"clientId":clientId,
					requestQueue:"listReportClient"
			};
	console.log("In RMQC:calling listReportClient Service");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.reports);
			}//Else - Error check
	});//Queue makeRequest call 
};
//------------------------------------------List Reports  for a building------------------------------------------
exports.listReportBuilding=function(req,res){

	var buildingId = req.param("buildingId");
	var msg_payload = {			
					"buildingId":buildingId,
					requestQueue:"listReportBuilding"
			};
	console.log("In RMQC:calling listReportBuilding Service");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listReportBuilding");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.reports);
			}//Else - Error check
	});//Queue makeRequest call 
};

//------------------------------------------List Reports  for a date range------------------------------------------
exports.listReportDate=function(req,res){

	var cltId = req.param("clientId");
	var startDate = req.param("startDate");
	var endDate = req.param("endDate");
	var msg_payload = {			
					"cltId":cltId,
					"startDate":startDate,
					"endDate":endDate,
					requestQueue:"listReportDate"
			};
	console.log("In RMQC:calling listReportDate Service");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listReportDate");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.reports);
			}//Else - Error check
	});//Queue makeRequest call 
};
//------------------------------------------Get Detailed Reports ------------------------------------------
exports.getDetailedReport=function(req,res){

	var bldId = req.param("buildingId");
	var repDate = req.param("reportDate");
	console.log(repDate);
	var msg_payload = {			
					"buildingId":bldId,
					"reportDate":repDate,					
					requestQueue:"getDetailedReport"
			};
	console.log("In RMQC:calling listReportDate Service");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for getDetailedReport");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				console.log(results.reports);
				res.send({"report":results.reports,"guards":results.guards});
			}//Else - Error check
	});//Queue makeRequest call 
};
//


//------------------------------------------Create Guard------------------------------------------
exports.createGuard=function(req,res){
	var email=req.param("email"),password=req.param("password");
	var roleId=req.param("roleId");
	var firstName=req.param("firstName"),lastName=req.param("lastName");
	var addressLine1=req.param("addressLine1"),addressLine2=req.param("addressLine2");
	var city=req.param("city"),state=req.param("state"),zipCode=req.param("zipCode");
	var phoneNumber=req.param("phoneNumber"),userSSN=req.param("userSSN");
	var startDate=req.param("startDate"),endDate=req.param("endDate");
	var backgroundStatus=req.param("status");
console.log("s:"+(email!==undefined && password!==undefined && roleId!==undefined && firstName!==undefined && lastName!==undefined && addressLine1!==undefined && city!==undefined && zipCode!==undefined && phoneNumber!==undefined && userSSN!==undefined && startDate!==undefined && backgroundStatus!==undefined))
	if((email!==undefined && password!==undefined && roleId!==undefined && firstName!==undefined && lastName!==undefined && addressLine1!==undefined && city!==undefined && zipCode!==undefined && phoneNumber!==undefined && userSSN!==undefined && startDate!==undefined && backgroundStatus!==undefined) &&
	   (email!=="" && password!=="" && roleId!=="" && firstName!=="" && lastName!=="" && addressLine1!=="" && city!=="" && zipCode!=="" && phoneNumber!=="" && userSSN!=="" && startDate!=="" && backgroundStatus!==""))
	{
		var msg_payload={				
			"email":email,
			"password":password,
			"roleId":roleId,
			"firstName":firstName,
			"lastName":lastName,
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"phoneNumber":phoneNumber,
			"userSSN":userSSN,
			"startDate":new Date(startDate),
			"endDate":new Date(endDate),
			"backgroundStatus":backgroundStatus,
			
			requestQueue:"createGuard"
		};				
		console.log("In RMQC:calling guard Service for create guard");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
			console.log("In RMQC:Got return call guard Service");
			console.log(results);
			if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
			else
			{
				res.send({'msg':'guard Created Successfully'});
			}//Error check else
		});//Queue makeRequest call
		
	}// check not null
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);	
	}//check for mandatory fields else
	
};// createguard function

//------------------------------------------List Guard------------------------------------------
exports.listGuard=function(req,res){
	
	var msg_payload = {					
					requestQueue:"listGuard"
			};
	console.log("In RMQC:calling guard Service for listguards");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call guard Service for listguards");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.guards);
			}//Else - Error check
	});//Queue makeRequest call 
};//listguard fucntion

//------------------------------------------Search guard----------------------------------------------------------------
//------------------------------------------Display Guard----------------------------------------------------------------
exports.getGuardById=function(req,res)
{
	var guardId = req.param("guardId");
	
	console.log("In RMQC:display guard information Module");
	
	if((guardId!==undefined) && (guardId!==""))
	{
		var msg_payload = 
		{
				"guardId":guardId,
				requestQueue:"displayGuard"
			};
		
		console.log("In RMQC:calling guard Service for display guard information");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results)
				{
			console.log("In RMQC:Got return call guard Service for display guard");
			if(results.error)
				{
					console.log(results.error);
					res.send(results.error);
				}//Error check
			else
				{
					res.send({"guard":results.guard});
				}//Else - Error check
		
		});//Queue makeRequest call 
	}
};//displayGuard function


//------------------------------------------List Guard------------------------------------------
exports.getGuards=function(req,res){
	
	var msg_payload = {					
					requestQueue:"getGuards"
			};
	console.log("In RMQC:calling Client Service for listClients");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for list Guards");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.guards);
			}//Else - Error check
	});//Queue makeRequest call 
};//listClient fucntion

// ****************************************************Create Schedule*****************************************************************


exports.createSchedule = function(req, res){
	
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;

	/*TBD: test code remove this line later*/
	//var guardID = 1;
	var guardID=req.session.userid;
	var buildingId = req.param('buildingId');
	var startDate = req.param('startDate');
	var endDate = req.param('endDate');
	var isReportSubmitted = 0;
	console.log("ed:"+endDate);
	console.log("st:"+startDate);
	if(!(guardID === undefined ||
		 guardID === null ||
		 guardID === "")&&
	   !(buildingId === undefined ||
	     buildingId === null ||
	     buildingId === "")&&
	     !(startDate === undefined ||
	     startDate === null ||
	 	 startDate === "")&&
	     !(endDate === undefined ||
	     endDate === null ||
	     endDate === "")&&
	     !(isReportSubmitted === undefined ||
	       isReportSubmitted === null ||
	       isReportSubmitted === ""))
	{
		var msg_payload=
		{
			"guardID":guardID,
			"buildingId":buildingId,
			"startDate":startDate,
			"endDate":endDate,
			"isReportSubmitted":isReportSubmitted,
			"requestQueue":"createSchedule"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					console.log("");
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.code);
					/*TBD: change the response send as needed*/
					res.send({'status':'Scheduled Successfully!!'});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};
// **********************************************************************************************************************

exports.editSchedule = function(req, res){
	
	var buildingId = req.param('buildingId');
	var startDate = req.param('startTime');
	var endDate = req.param('endTime');
	var idschedule = req.param('idschedule');
	
	
	if(!(buildingId === undefined ||
	     buildingId === null ||
	     buildingId === "")&&
	     !(startDate === undefined ||
	     startDate === null ||
	 	 startDate === "")&&
	     !(endDate === undefined ||
	     endDate === null ||
	     endDate === "")&&
	     !(idschedule === undefined ||
	       idschedule === null ||
	       idschedule === ""))
	{
		var msg_payload=
		{
			"buildingId":buildingId,
			"startDate":startDate,
			"endDate":endDate,
			"idSchedule":idschedule,
			"requestQueue":"editSchedule"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
				res.send(err);
			}
			else
			{	
				if(results.error)
				{
					//console.log("error:"+results.error);
					cstmError.mySqlException(results.error, res);
				}
				else
				{
					//console.log("success "+results.data[0]);
					/*TBD: change the response send as needed*/
					res.send({"status":"Schedule Updated Successfully"});
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

// ------------------------------------------View Schedule ----------------------------------------------------

exports.getAllSchedules = function(req, res){
	
	/*TBD: un-comment this line for final code*/
	//var guardID = req.session.guardID;

	/*TBD: test code remove this line later*/
	
		var msg_payload=
		{
			
			"requestQueue":"getSchedules"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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



exports.deleteSchedule = function(req, res){
	
	//var idschedule = req.param('idschedule');
	var model=JSON.parse(req.param('models'));
	var idschedule=model[0].idschedule;
	//console.log('id'+idschedule);
	if(!(idschedule === undefined ||
	     idschedule === null ||
	     idschedule === ""))
	{
		var msg_payload=
		{
			"idschedule":idschedule,
			"requestQueue":"deleteSchedule"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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



//------------------------------------------Delete Guard----------------------------------------------------------------
exports.deleteGuard=function(req,res){
	var model=JSON.parse(req.param('models'));
	var guardId=model[0].userId;
	console.log("In RMQC:deleteGuard Module");
	
	if((guardId!==undefined) && (guardId!==""))
	{
		var msg_payload = {
				"guardId":guardId,
				requestQueue:"deleteGuard"
			};
		console.log("In RMQC:calling Guard Service for deleteGuards");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Guard Service for deleteGuards");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send({'msg':'Guard Deleted Successfully'});
			}//Else - Error check
		});//Queue makeRequest call 
			
	}//Check if GuardId is not null
	else
	{
		cstmError.throwException('GuardId cannot be null!!', res);	
	}//Else-Check if guardId is not null
	
};//deleteGuard fucntion

//------------------------------------------Edit Guard------------------------------------------
exports.editGuard=function(req,res){
	var model=JSON.parse(req.param('models'));
	
	var firstName=model[0].firstName;
	var lastName=model[0].lastName;
	var addressLine1=model[0].addressLine1;
	var addressLine2=model[0].addressLine2;
	var city=model[0].city;
	var state=model[0].state;
	var zipCode=model[0].zipCode;
	var phoneNumber=model[0].phno;
	//var userSSN=model[0].userSSN;
	var userId=model[0].userId;
	var status=model[0].status==true?1:0;
	var startDate=model[0].startDate;
	var endDate=model[0].endDate;
	console.log("In RMQC:editGuard Module");
	if((userId!==undefined) &&
	   (userId!== ""))
	{
		var msg_payload={	
			"userId":userId,
			"firstName":firstName,
			"lastName":lastName,
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"phoneNumber":phoneNumber,
			"status":status,
			"startDate":startDate,
			"endDate":endDate,
			//"userSSN":userSSN,
			requestQueue:"editGuard"
		};
		
		console.log("In RMQC:calling Guard Service for create Guard");
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Guard Service for edit Guard");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send([]);
			}//Error check else
		});//Queue makeRequest call
	}//// check not null
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);	
	}//check for mandatory fields else
};//editGuard fucntion


exports.getAllReports=function(req,res){
	
	var msg_payload = {					
			requestQueue:"getAllReports"
	};

	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
	console.log("In RMQC:Got return call Client Service for list Guards");
	if(results.error)
		{
			console.log(results.error);
			res.send(results.error);
		}//Error check
	else
		{
			res.send(results.reports);
		}//Else - Error check
	});//Queue makeRequest call 
};



exports.createAlerttype = function(req, res){
	
	//var alertName = req.param('alertName');
	//var recipients = req.param('recipients');
var model=JSON.parse(req.param('models'));
	
	var alertName=model[0].alertName;
	var recipients=model[0].recipients;
	
	if(!(alertName === undefined ||
		 alertName === null ||
		 alertName === "")&&
		 !(recipients === undefined ||
		   recipients === null ||
	       recipients === ""))
	{
		var msg_payload=
		{
			"alertName":alertName,
			"recipients":recipients,
			"requestQueue":"createAlerttype"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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
					//res.send(results.data);
					res.send([]);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.editAlerttype = function(req, res){
	
	//var alertTypeId = req.param('alertTypeId');
	//var alertName = req.param('alertName');
	//var recipients = req.param('recipients');
var model=JSON.parse(req.param('models'));
	
	var alertName=model[0].alertName;
	var recipients=model[0].recipients;
	var alertTypeId=model[0].alertTypeId;
	console.log(alertName+","+recipients+","+alertTypeId);
	if(!(alertTypeId === undefined ||
		 alertTypeId === null ||
		 alertTypeId === "")&&
		 !(alertName === undefined ||
		 alertName === null ||
		 alertName === "")&&
		 !(recipients === undefined ||
		   recipients === null ||
	       recipients === ""))
	{
		var msg_payload=
		{
			"alertTypeId":alertTypeId,	
			"alertName":alertName,
			"recipients":recipients,
			"requestQueue":"editAlerttype"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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
					//res.send(results.data);
					res.send([]);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.deleteAlerttype = function(req, res){
	
//	var alertTypeId = req.param('alertTypeId');
var model=JSON.parse(req.param('models'));	
	var alertName=model[0].alertName;
	var recipients=model[0].recipients;
	var alertTypeId=model[0].alertTypeId;
	if(!(alertTypeId === undefined ||
		 alertTypeId === null ||
		 alertTypeId === ""))
	{
		var msg_payload=
		{
			"alertTypeId":alertTypeId,	
			"requestQueue":"deleteAlerttype"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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
					//res.send(results.data);
					res.send([]);
				}
			}
		});
	}
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);
	}
};

exports.viewbill=function(req,res)
{
	res.render('viewbill',{amount:"100",startdate:"04/01/2015",enddate:"04/30/2015"});
};
exports.getalerts = function(req, res){

		var msg_payload=
		{
				
			"requestQueue":"getalerts"
		};
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){			
			if(err)
			{
				console.log(err);
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
					//res.send(results.data);
					res.send(results.alerts);
				}
			}
		});
	
};

//------------------------------------------Create Building----------------------------------------------------------------
exports.createBuilding=function(req,res){
	var clientId=req.param("clientId");
	var buildingName = req.param("buildingName");
	var addressLine1=req.param("addressLine1"),addressLine2=req.param("addressLine2");
	var city=req.param("city"),state=req.param("state"),zipCode=req.param("zipCode");
	var serviceStartDate=req.param("serviceStartDate"),serviceEndDate=req.param("serviceEndDate");
	var cost=req.param("cost");
	var cp = req.param("checkpoints");
	var guardscount=req.param('guardscount');
	/*var cp = [{"description":"libraryfloor1","latitude":"1","longitude":"2"},
	{"description":"libraryfloor2","latitude":"3","longitude":"4"},
	{"description":"libraryfloor3","latitude":"5","longitude":"6"}];
	console.log("In RMQC:createBuilding Module");*/
	console.log('side');
	if((clientId!==undefined && serviceStartDate!==undefined && cost!==undefined && buildingName!==undefined && addressLine1!==undefined && city!==undefined && state!==undefined && zipCode!==undefined) && 
	(clientId!=="" && serviceStartDate!=="" && cost!=="" && buildingName!=="" && addressLine1!=="" && city!=="" && state!=="" && zipCode!==""))	
	{
		// for(var i=0;i<cp.length;i++)
		// {
			// if((cp[i].description!==undefined || cp[i].description!=="") ||
			// (cp[i].latitude!==undefined || cp[i].latitude!=="") ||
			// (cp[i].longitude!==undefined || cp[i].longitude!==""))
			// {
				// cstmError.throwException('Please fill all the manidatory fields', res);	
			// }
		// }
		console.log('inside');
		var msg_payload={				
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"clientId":clientId,
			"serviceStartDate":serviceStartDate,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"cost":cost,
			"buildingName":buildingName,
			"serviceEndDate":serviceEndDate,
			"cp":cp,
			"guardscount":guardscount,
			requestQueue:"createBuilding"
		};		
			
		console.log("In RMQC:calling Building Service for create Building");	
		reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
			else
			{
				res.send({'msg':'Building Created Successfully'});
			}//Error check else			
		});	//Queue makeRequest call	
	}// check not null
	else
	{
		res.send('Please fill all the manidatory fields');	
	}//check for mandatory fields else
	
};//Create building function

exports.editBuilding=function(req,res){
	var clientId=req.param("clientId");
	var buildingId=req.param("buildingId");
	var buildingName = req.param("buildingName");
	var addressLine1=req.param("addressLine1"),addressLine2=req.param("addressLine2");
	var city=req.param("city"),state=req.param("state"),zipCode=req.param("zipCode");
	var serviceStartDate=req.param("serviceStartDate"),serviceEndDate=req.param("serviceEndDate");
	var cost=req.param("cost");
	var guardscount=req.param('guardscount');
	var cp = req.param(cp);
	/*var cp = [{"description":"libraryfloor1","latitude":"1","longitude":"2"},
	{"description":"libraryfloor2","latitude":"3","longitude":"4"},
	{"description":"libraryfloor3","latitude":"5","longitude":"6"}];*/
	console.log("In RMQC:editBuilding Module");
	if((buildingId!==undefined && clientId!==undefined && serviceStartDate!==undefined && cost!==undefined && buildingName!==undefined && addressLine1!==undefined && city!==undefined && state!==undefined && zipCode!==undefined) && 
	(buildingId!=="" && clientId!=="" && serviceStartDate!=="" && cost!=="" && buildingName!=="" && addressLine1!=="" && city!=="" && state!=="" && zipCode!==""))	
	{
		var msg_payload={	
			"buildingId":buildingId,
			"addressLine1":addressLine1,
			"addressLine2":addressLine2,
			"clientId":clientId,
			"serviceStartDate":serviceStartDate,
			"city":city,
			"state":state,
			"zipCode":zipCode,
			"cost":cost,
			"buildingName":buildingName,
			"serviceEndDate":serviceEndDate,
			"cp":cp,
			"guardscount":guardscount,
			requestQueue:"editBuilding"
		};	
		
		console.log("In RMQC:calling Building Service for Edit Building");	
		reqHandler.makeRequest('buildingQueue',msg_payload, function(err,results){
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send({'msg':'Building Changed Successfully'});
			}//Error check else			
		});	//Queue makeRequest call		
	}// check not null
	else
	{
		cstmError.throwException('Please fill all the manidatory fields', res);	
	}//check for mandatory fields else
};//Edit building function
// satish

exports.signout=function(req,res){		
	req.session.destroy(function(){
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
		res.redirect('/');
	});
	

};

exports.getAllClients=function(req,res){
	
	var msg_payload = {					
					requestQueue:"getAllClients"
			};
	console.log("In RMQC:calling Client Service for listClients");
	reqHandler.makeRequest('_adminQueue',msg_payload, function(err,results){
		console.log("In RMQC:Got return call Client Service for listClients");
		if(results.error)
			{
				console.log(results.error);
				res.send(results.error);
			}//Error check
		else
			{
				res.send(results.clients);
			}//Else - Error check
	});//Queue makeRequest call 
};//listClient fucntion


exports.getStates=function(req,res)
{
	var states=[
	    {
	        "name": "Alabama",
	        "abbreviation": "AL"
	    },
	    {
	        "name": "Alaska",
	        "abbreviation": "AK"
	    },
	    {
	        "name": "American Samoa",
	        "abbreviation": "AS"
	    },
	    {
	        "name": "Arizona",
	        "abbreviation": "AZ"
	    },
	    {
	        "name": "Arkansas",
	        "abbreviation": "AR"
	    },
	    {
	        "name": "California",
	        "abbreviation": "CA"
	    },
	    {
	        "name": "Colorado",
	        "abbreviation": "CO"
	    },
	    {
	        "name": "Connecticut",
	        "abbreviation": "CT"
	    },
	    {
	        "name": "Delaware",
	        "abbreviation": "DE"
	    },
	    {
	        "name": "District Of Columbia",
	        "abbreviation": "DC"
	    },
	    {
	        "name": "Federated States Of Micronesia",
	        "abbreviation": "FM"
	    },
	    {
	        "name": "Florida",
	        "abbreviation": "FL"
	    },
	    {
	        "name": "Georgia",
	        "abbreviation": "GA"
	    },
	    {
	        "name": "Guam",
	        "abbreviation": "GU"
	    },
	    {
	        "name": "Hawaii",
	        "abbreviation": "HI"
	    },
	    {
	        "name": "Idaho",
	        "abbreviation": "ID"
	    },
	    {
	        "name": "Illinois",
	        "abbreviation": "IL"
	    },
	    {
	        "name": "Indiana",
	        "abbreviation": "IN"
	    },
	    {
	        "name": "Iowa",
	        "abbreviation": "IA"
	    },
	    {
	        "name": "Kansas",
	        "abbreviation": "KS"
	    },
	    {
	        "name": "Kentucky",
	        "abbreviation": "KY"
	    },
	    {
	        "name": "Louisiana",
	        "abbreviation": "LA"
	    },
	    {
	        "name": "Maine",
	        "abbreviation": "ME"
	    },
	    {
	        "name": "Marshall Islands",
	        "abbreviation": "MH"
	    },
	    {
	        "name": "Maryland",
	        "abbreviation": "MD"
	    },
	    {
	        "name": "Massachusetts",
	        "abbreviation": "MA"
	    },
	    {
	        "name": "Michigan",
	        "abbreviation": "MI"
	    },
	    {
	        "name": "Minnesota",
	        "abbreviation": "MN"
	    },
	    {
	        "name": "Mississippi",
	        "abbreviation": "MS"
	    },
	    {
	        "name": "Missouri",
	        "abbreviation": "MO"
	    },
	    {
	        "name": "Montana",
	        "abbreviation": "MT"
	    },
	    {
	        "name": "Nebraska",
	        "abbreviation": "NE"
	    },
	    {
	        "name": "Nevada",
	        "abbreviation": "NV"
	    },
	    {
	        "name": "New Hampshire",
	        "abbreviation": "NH"
	    },
	    {
	        "name": "New Jersey",
	        "abbreviation": "NJ"
	    },
	    {
	        "name": "New Mexico",
	        "abbreviation": "NM"
	    },
	    {
	        "name": "New York",
	        "abbreviation": "NY"
	    },
	    {
	        "name": "North Carolina",
	        "abbreviation": "NC"
	    },
	    {
	        "name": "North Dakota",
	        "abbreviation": "ND"
	    },
	    {
	        "name": "Northern Mariana Islands",
	        "abbreviation": "MP"
	    },
	    {
	        "name": "Ohio",
	        "abbreviation": "OH"
	    },
	    {
	        "name": "Oklahoma",
	        "abbreviation": "OK"
	    },
	    {
	        "name": "Oregon",
	        "abbreviation": "OR"
	    },
	    {
	        "name": "Palau",
	        "abbreviation": "PW"
	    },
	    {
	        "name": "Pennsylvania",
	        "abbreviation": "PA"
	    },
	    {
	        "name": "Puerto Rico",
	        "abbreviation": "PR"
	    },
	    {
	        "name": "Rhode Island",
	        "abbreviation": "RI"
	    },
	    {
	        "name": "South Carolina",
	        "abbreviation": "SC"
	    },
	    {
	        "name": "South Dakota",
	        "abbreviation": "SD"
	    },
	    {
	        "name": "Tennessee",
	        "abbreviation": "TN"
	    },
	    {
	        "name": "Texas",
	        "abbreviation": "TX"
	    },
	    {
	        "name": "Utah",
	        "abbreviation": "UT"
	    },
	    {
	        "name": "Vermont",
	        "abbreviation": "VT"
	    },
	    {
	        "name": "Virgin Islands",
	        "abbreviation": "VI"
	    },
	    {
	        "name": "Virginia",
	        "abbreviation": "VA"
	    },
	    {
	        "name": "Washington",
	        "abbreviation": "WA"
	    },
	    {
	        "name": "West Virginia",
	        "abbreviation": "WV"
	    },
	    {
	        "name": "Wisconsin",
	        "abbreviation": "WI"
	    },
	    {
	        "name": "Wyoming",
	        "abbreviation": "WY"
	    }
	];
	res.send(states);
};