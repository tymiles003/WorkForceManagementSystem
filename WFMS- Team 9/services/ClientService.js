var myDatabase = require('./dbConnectionsController');

function handle_request(msg, callback) 
{
	if(msg.url === "alertcriteria") 
	{
		var res = {};
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"alertcriteria", data: msg, callback: callback});
		}
		else 
		{
			var query =dbConn.query("select alertTypeId,alertName from alertType", function(err, rows)
			{
				if(err)
				{
					console.log("err");
					res.error=err;
				}
				else 
				{
					console.log(JSON.stringify(rows));
					if(rows.length > 0) 
					{
						console.log("Valid alert criteria");
						res.code = '200';
						res.data = rows;
					}
					else 
					{
						console.log("InValid alert criteria");
						res.code = '400';
						res.data = {"status":"fail"};
					}
				}
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});
		}
	}

	else if(msg.url === "searchalerts") 
	{
		var alertFromdate = msg.alertFromdate;
		var alertTodate = msg.alertTodate;

		if(msg.clientId === undefined)
			{var clientId = null;}
		else{ var clientId = msg.clientId;}
		
		if(msg.buildingId === undefined)
		{var buildingId = null;}
	else{ var buildingId = msg.buildingId;}
		
		if(msg.alertTypeId === undefined)
		{var alertTypeId = null;}
	else{ var alertTypeId = msg.alertTypeId;}
		
		if(msg.severity === undefined)
		{var severity = null;}
	else{ var severity = msg.severity;}
		
		var res = {};
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"searchalerts", data: msg, callback: callback});
		}
		else 
		{
			var dbQuery = "select ud.firstName, ud.lastName, b.buildingName, a.description, at.alertName, a.severity, a.alertTime from userdetails ud, client c, building b, alerts a, alerttype at, guard g " +
						  "where a.guardId= g.guardId and ud.userId=c.clientId and b.buildingId=a.buildingId and a.alertTypeId=at.alertTypeId";
 
			var userData = [clientId,buildingId,alertTypeId,severity];
	
			for(var i=0;i<userData.length;i++)
			{
				 if(userData[i]!==null)
				 {
					  switch(i)
					  {
						  case 0: dbQuery+=" and c.clientId="+userData[0];	break;
						  case 1: dbQuery+=" and b.buildingId ="+userData[1];	break;
						  case 2: dbQuery+=" and at.alertTypeId ="+userData[2];	break;
						  case 3: dbQuery+=" and a.severity like '%"+userData[3]+"%'";	break;
					  }
				 }
			}
	
			if(alertFromdate !== undefined && alertFromdate!==null && alertTodate !== undefined && alertTodate!==null)
			{
				dbQuery+=" and a.alertTime between '"+alertFromdate+"' and '"+alertTodate+"'";
			}
	
			var query =dbConn.query(dbQuery, function(err, rows)
			{
				if(err)
				{
					console.log("err");
					res.error=err;
				}
				else 
				{
					console.log(JSON.stringify(rows));
					if(rows.length > 0) 
					{
						console.log("Valid alert criteria");
						res.code = '200';
						res.data = rows;
					}
					else 
					{
						console.log("InValid alert criteria");
						res.code = '400';
						res.data = {"status":"fail"};
					}
				}
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});
		}
	}
	
	else if(msg.url === "getClientAlerts")
		{
			var res = {};
			var dbConn = myDatabase.getDatabaseConnection();
			if(dbConn === "empty")
			{
				console.log("no DB connections available");
				myDatabase.waitQueuePool({name:"getClientAlerts", data: msg, callback: callback});
			}
			else 
			{var query =dbConn.query("SELECT alertTime,alertName ,severity,bldng.buildingName FROM alerts "+
							"inner join alerttype on alerttype.alertTypeId=alerts.alertTypeId "+
						"inner join building as bldng on alerts.buildingId= bldng.buildingId where bldng.clientId=? ",msg.clientId, function(err, rows){
				if(err)
				{
					console.log("check point error :"+err);
					res.error=err;
				}
				else{
						 res.code='200';
						 res.alerts=rows;
				}
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});
			
			}
		
		}
	else if(msg.url === "getclientreports")
	{
		var res = {};
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getclientreports", data: msg, callback: callback});
		}
		else 
		{	var query = dbConn.query("SELECT  sc.buildingId,bldng.buildingName,Date(sc.startTime) as reportDate , sc.guardId,bldng.clientId,ud1.firstName as clientName  FROM schedule as sc "+
				 "inner join building bldng on sc.buildingId=bldng.buildingId "
				 +"inner join client on bldng.clientId=client.clientId "
				 +"inner join userdetails as ud1 on client.clientId=ud1.userId "
				 +"where  sc.isReportSubmitted=1  and bldng.clientId=? group by sc.buildingId , Date(sc.startTime)",msg.clientId, function(err, rows){
			if(err)
			{
				console.log("check point error :"+err);
				res.error=err;
			}
			else{
					 res.code='200';
					 res.reports=rows;
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
		
		}
	
	}
	
}

exports.handle_request = handle_request;