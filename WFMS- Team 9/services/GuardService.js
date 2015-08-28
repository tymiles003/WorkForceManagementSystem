var myDatabase = require('./dbConnectionsController');

function getBuildings(msg, callback)
{
	var res = {};	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getBuildings", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("SELECT bldng.buildingName,bldng.buildingId " +
			                    "FROM workforce.schedule as sc " +			                    
			                    "inner join workforce.building as bldng on sc.buildingId=bldng.buildingId " +
			                    "where DATE_FORMAT(sc.startTime,'%m/%d/%Y')=? and sc.guardId=?",[msg.reportDate, msg.guardID], function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				//console.log("guard Data returned " + rows);
				if(rows.length > 0)	
				{
					res.code='200';				
					res.data = rows;
				}
				else
				{
					res.code='400';				
					res.data = "No building details found";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

function getCheckPoints(msg, callback)
{
	var res = {};
	//console.log("buildingID " + msg.buildingID);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getCheckPoints", data: msg, callback: callback});
	}
	else 
	{
		/*var query =connection.query("select  cp.checkinId,cp.Description as checkinName from workforce.checkinpoints as cp " +
				                    "inner join workforce.building as bldng on cp.buildingId=bldng.buildingId " +
			                    "where cp.buildingId=?",msg.buildingID, function(err, rows)*/
		var query =dbConn.query("select  cp.checkinId,cp.Description as checkinName,cp.buildingId from workforce.checkinpoints as cp " , function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				//console.log("got checkin points " + rows[0]);
				if(rows.length > 0)
				{
					res.code='200';
					res.data = rows;
				}
				else
				{
					res.code='400';				
					res.data = "No checkpoints details found";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

function getPatrolTimings(msg, callback)
{
	var res = {};
	console.log("buildingID " + msg.buildingID);
	console.log("guardID " + msg.guardID);
	console.log("guardID " + msg.reportDate);
	var res = {};
	//console.log("buildingID " + msg.buildingID);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getPatrolTimings", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("select startTime,endTime from schedule where guardId = ? and buildingId = ? and DATE_FORMAT(startTime,'%m/%d/%Y')=?"
				,[msg.guardID,msg.buildingID,msg.reportDate], function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
			else
			{
				var endTime = rows[0].endTime;
				var query =dbConn.query("select unix_timestamp(?) as start_time"
						,rows[0].startTime, function(err, rows)
				{
					var res = {};
					if(err)
					{
						console.log(err);
						res.error = err;
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					}
					else
					{
						var startTimeStamp = rows[0].start_time; 
						var query =dbConn.query("select unix_timestamp(?) as end_time"
								,endTime, function(err, rows)
						{
							var res = {};
							if(err)
							{
								console.log(err);
								res.error = err;
							}
							else
							{
								var endTimeStamp = rows[0].end_time;
								res.code = '200';
								res.data = {"startTime": startTimeStamp,
										    "endTime": endTimeStamp};
							}
							myDatabase.restoreDatabaseconnection(dbConn);
							callback(null, res);
							process.nextTick(function(){myDatabase.waitQueuePool(null);});
						});
					}
				});
			}
		});
	}
}


function logReport(msg, callback)
{
	var res = {};
	//console.log("log data " + msg.logData);
	//console.log("log data " + msg.logData.reportDate);
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"logReport", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("SELECT idschedule FROM workforce.schedule where DATE_FORMAT(startTime,'%m/%d/%Y')=? and guardId = ? and buildingId=?" 
				,[msg.logData.reportDate, msg.logData.guardID,msg.logData.buildingId], function(err, rows)
		{
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
			else
			{
				//console.log("idSchedule is " + rows[0].idschedule);
				var patrolTime= new Date(new Date( msg.logData.patrolTime).toLocaleString());
				console.log("start Date is " +patrolTime);
				if(rows.length > 0)
				{
					var data = {
						guardId : msg.logData.guardID,
						checkinId : msg.logData.checkinID,
						patrolTime :patrolTime,	
						disposition : msg.logData.disposition,
						mtnService : msg.logData.mtnSerivce,
						callOfService : msg.logData.callOfService,
						parkingViolation : msg.logData.parkingViolation,
						incident : msg.logData.incident,
						idSchedule : rows[0].idschedule,
						logTime:new Date()
					};
					var query =dbConn.query("INSERT into dailypatrols set ?"
							,data, function(err, rows)
					{
						if(err)
						{
							console.log("DB query failed" + err.errno);
							res.error=err;
						}
						else
						{
							res.code = '200';
							res.data = "Report Logged successfully!!";
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
				}
				else
				{
					res.error = "No Schedule Found";
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}
			}
		});
	}
}

function getAlertType(msg, callback)
{
	var res = {};
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getAlertType", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("SELECT alertTypeId,alertName,recipients from alerttype ", function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				if(rows.length > 0)
				{
					res.code='200';
					res.data = rows;
				}
				else
				{
					res.code = '400';
					res.data = "No valid Alert type";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

function submitAlert(msg, callback)
{
	var res = {};
	console.log(msg.reportDate);
	var data = {
			guardId : msg.guardID,
			buildingId : msg.buildingID,
			alertTypeId : msg.alertTypeId,
			description : msg.description,
			alertTime :  new Date(new Date( msg.reportDate).toLocaleString()),
			severity : msg.severity
		};
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"submitAlert", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("INSERT into alerts set ?"
				,data, function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				res.code='200';
				var query = dbConn.query("select * from alerttype where alertTypeId=?", [msg.alertTypeId], function(err, nrows) {
					console.log(nrows);
					console.log(nrows[0].recipients);
					for(i=0;i<nrows.length;i++)
					{
						var str = nrows[i].recipients;
						var rec = str.split(";");
						for(j=0;j<rec.length;j++)
						{
					var sms = require('twilio')('AC966326f4f539f7344caeb70364038eae', '07f7bc2e7ae7c7a6b7b178e43bb17c77');
					
					sms.sendMessage({

					    to:rec[j], 
					    from: '+16692001196', 
					    body: nrows[i].alertName

					}, function(err, responseData) { 

					    if (!err) { 

					        console.log(responseData.from); 
					        console.log(responseData.body); 

					    }
					});
						}
					}// for loop
					});// Select Query on alerttype
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

function submitReport(msg, callback)
{
	var res = {};
	var data = {
                isReportSubmitted:msg.isSubmitted
		       };
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"submitReport", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("SELECT sc.idschedule from schedule as sc inner join dailypatrols as dp on sc.idschedule=dp.idSchedule " +
				"where sc.guardId=? and sc.buildingId=? and DATE_FORMAT(startTime,'%m/%d/%Y')=?" 
			                      , [msg.guardID, msg.buildingID, msg.reportDate], function(err, rows)
		{
			if(err)
			{
				console.log("DB query failed" + err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
			else
			{
				if(rows.length > 0)
				{
					var idSchedule = rows[0].idschedule;
					console.log("got the idschedule as " + idSchedule);
					var query = dbConn.query("SELECT * from schedule  where idschedule=? and isReportSubmitted=0" 
		                      , idSchedule, function(err, rows)
					{ 
						if(err)
						{
							console.log("DB query failed" + err.errno);
							res.error=err;
						}
						else
						{
							/*console.log("update successfull");
							res.code='200';*/
							if(rows.length>0){
								console.log('schedule found');
							var query =dbConn.query("UPDATE schedule set ? where idschedule=?"
									,[{
						                isReportSubmitted:msg.isSubmitted
								       }, idSchedule], function(err, rows)
				                      	{
				                    	  
				                    	  if(err)
				  						{
				  							console.log("DB query failed" + err.errno);
				  							res.error=err;
				  						}
				                    	  	else{
				                    		  
				                    		 res.success="Report Submitted Successfully!!";
				                    		  
				                    	  }
				                    		
				        					myDatabase.restoreDatabaseconnection(dbConn);
				        					callback(null, res);
				        					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				                    	  
				                    	  
				                      	});
							}
							else{
								res.error="Report Already Submitted";
								myDatabase.restoreDatabaseconnection(dbConn);
	        					callback(null, res);
	        					process.nextTick(function(){myDatabase.waitQueuePool(null);});
							}
							
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
				}
				else{
					res.error="No Report Logged for this Data";
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
					
				}
			}
			
		});
	}
}

function displayGuardReport(msg, callback)
{
	var res = {};

	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"displayGuardReport", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("select bldng.buildingName,ud.firstName,ud.userSSN,dp.patrolTime,dp.disposition,dp.mtnService," +
			                     "dp.callOfService,dp.parkingViolation,dp.incident from  workforce.dailypatrols as dp " +
			                     "inner join workforce.userdetails as ud on dp.guardId=ud.userId " +
			                     "inner join workforce.checkinpoints as cp on dp.checkinId=cp.checkinId " +
			                     "inner join workforce. building as bldng on cp.buildingId=bldng.buildingId " +
			                     "inner join workforce.schedule as sc on dp.idSchedule=sc.idSchedule " +
			                     "where DATE_FORMAT(sc.startTime,'%m/%d/%Y')=?  and  sc.buildingId = ?  and sc.isReportSubmitted=1 and sc.guardId = ?"
			                     ,[msg.reportDate,msg.buildingId,msg.guardID], function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				if(rows.length > 0)
				{
					res.code='200';
					res.data = rows;
				}
				else
				{
					res.code = '400';
					res.data = "no Guard report available";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

function viewSchedule(msg, callback)
{
	var res = {};

	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"viewSchedule", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("select schedule.idschedule,building.addressLine1,building.addressLine2, building.buildingName, " +
				"schedule.startTime,schedule.endTime ,building.city,building.zipCode " +
			                    "from schedule " +
			                    "inner join building " +
			                    "on schedule.buildingId = building.buildingId " +
			                    "where schedule.guardId = ? and building.isDeleted=0"
			                     ,msg.guardID,function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err);
				res.error=err;
			}
			else
			{
				if(rows.length > 0)
				{
					res.code='200';
					
					res.data = rows;
				}
				else
				{
					res.code = '400';
					res.data = "no valid schedule available";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}


function getAllGuardReports(msg, callback)
{
	var res = {};
	console.log('msg:'+msg.guardID);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getAllGuardReports", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("SELECT  sc.buildingId,bldng.buildingName,Date(sc.startTime) as reportDate," +
				"case when sc.isReportSubmitted=1 then 'Submitted' else 'Not Submitted' end as status  FROM schedule as sc "+
				 "inner join building bldng on sc.buildingId=bldng.buildingId "
				+"where  sc.guardId=? group by sc.buildingId , Date(sc.startTime)",msg.guardID,function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err);
				res.error=err;
			}
			else
			{
				if(rows.length > 0)
				{
					console.log(rows);
					res.code='200';					
					res.data = rows;
				}
				else
				{
					res.code = '400';
					console.log('no schedue');
					res.data = "No Reports available at this point of time";
				}
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}


function handle_request(msg, callback)
{
	if(msg !== null &&
	   msg !== undefined)
	{
		switch (msg.request)
		{
			case "getBuildings":
				getBuildings(msg, callback);
			break;
			case "getCheckPoints":
				getCheckPoints(msg, callback);
			break;
			case "getPatrolTimings":
				getPatrolTimings(msg, callback);
			break;
			case "logReport":
				logReport(msg, callback);
			break;
			case "getAlertType":
				getAlertType(msg,callback);
			break;	
			case "submitAlert":
				submitAlert(msg,callback);
			break;
			case "submitReport":
				submitReport(msg,callback);
			break;	
			case "displayGuardReport":
				displayGuardReport(msg,callback);
			break;
			case "getAllGuardReports":
				getAllGuardReports(msg,callback);
			break;
			case "viewSchedule":
				viewSchedule(msg,callback);
			break;
		}
	}
	else
	{
		console.log("invalid request from client");
		var res = {code: '400', data:"invalid request"};
		callback(null, res);
	}
}

exports.handle_request = handle_request;