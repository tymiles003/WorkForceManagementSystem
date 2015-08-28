var ejs= require('ejs');
var database = require('mysql');
var conPool  = require('./enableConnectionPooling');
var queue    = require('queue');
var guard    = require('./GuardService');
var client   = require('./ClientService');
var admin    = require('./AdminService');

var connectionPool = new queue();
var waitConnections = new queue();

function databaseConnect()
{
	var sqlDB = database.createConnection({
										host     : 'localhost',
										user     : 'root',
										password : 'root',
										database: 'workforce'
									  });
	sqlDB.connect();
	return sqlDB;
}

function addConnection(sqlDB)
{
	if(connectionPool !== null)
	{
		connectionPool.push(sqlDB);
	}
}

function getConnection()
{
	if(connectionPool.length >= 1)
	{
		var sqlDB = connectionPool.pop();
		return sqlDB;
	}
}

function initConnectionPool(poolLength)
{
	if(connectionPool !== null)
	{
		connectionPool.start();
		for(var cnt = 0; cnt < poolLength; cnt++)
		{
			addConnection(databaseConnect());
		}
	}
	if(waitConnections !== null)
	{
		waitConnections.start();
	}
}


function getPoolSize()
{
	if(connectionPool !== null)
	{
		return connectionPool.length;
	}
}

function terminateConnPool()
{
	if(connectionPool !== null)
	{
		connectionPool.stop();
	}
	if(waitConnections !== null)
	{
		waitConnections.stop();
	}
}

function waitQueuePool(userRequest)
{
	// if connection pooling is not enabled return.
	if(conPool.isConnPool === false)
	{
		return;
	}
	if(connectionPool !== null){
		if(connectionPool.length <= 0){
			//add user request to wait queue here
			if(userRequest !== null)
			{
				waitConnections.push(userRequest);
			}
		}
		else{
			//process request from wait queue here
			if(waitConnections.length <= 0)
			{
				return;
			}
			waitConnections.reverse();
			var userReq = waitConnections.pop();
			waitConnections.reverse();
			
			switch(userReq.name)
			{
				case "getBuildings":
				case "getCheckPoints":
				case "getPatrolTimings":
				case "logReport":
				case "getAlertType":
				case "submitAlert":
				case "submitReport":
				case "displayGuardReport":
				case  "getAllGuardReports":
				
				case "viewSchedule":
					guard.handle_request(userReq.data, userReq.callback);
					break;
				case "alertcriteria":
				case "searchalerts":
				case "getclientreports":
				case "getClientAlerts":
					client.handle_request(userReq.data, userReq.callback);
					break;
				case "login":
				case "createClient":
				case "listClient":
				case "getClientDetails":
				case "getClientBuildings":
				case "getAllBuildingDetails":
				case "getBuildings":
				case "deleteClient":
				case "editClient":
				case "changePassword":
				case "deleteBuilding":
				case "createBuilding":
				case "editBuilding":
				case "getClientBuildings":
				case "listReportAllBuilding":
				case "getAllReports":
				case "listReportClient":
				case "listReportBuilding":
				case "listReportDate":
				case "getDetailedReport":
				case "createGuard":
				case "listGuard":
				case "deleteGuard":
				case "displayGuard":
				case "deleteSchedule":
				case "getGuards":
				case "getGuardBuildings":
				case "getalerts":
				case  "getSchedules":	
				case "getAllClients":
				case "createAlerttype":
				case "viewAlerttypes":
				case "editAlerttype":
				case "deleteAlerttype":
				case "getBuildingDetails":
				case "editSchedule":
				case "editGuard":
						admin.handle_request(userReq.data, userReq.callback);
					break;
			}
		}
	}
}

/*DB helper functions*/
/*
 * This function return a database connection.
 * either a fresh connection if connection is 
 * not enabled or existing connection from
 * the pool.
 * it checks if the connection pooling is
 * enabled or not using the "isConnPool" variable
 * 
 * */
function getDatabaseConnection()
{
	var dbConn;
	if(conPool.isConnPool === true)
	{
		if(getPoolSize() <= 0)
		{
			dbConn = "empty";
		}
		else
		{
			
			dbConn = getConnection();
		}
	}
	else
	{
		dbConn = databaseConnect();
	}
    return dbConn;
}

/*
 * This function returns DB connection instance
 * to the connection pool after the query is 
 * executed or ends the DB connection if 
 * connection pooling is not enabled.
 * it checks if the connection pooling is
 * enabled or not using the "isConnPool" variable
 * 
 * */
function restoreDatabaseconnection(dbConn)
{
	if(conPool.isConnPool === true)
	{
		addConnection(dbConn);
	}
	else
	{
		dbConn.end();
	}
}


//exports.getConnection=getConnection;
exports.initConnectionPool        = initConnectionPool;
exports.getDatabaseConnection     = getDatabaseConnection;
exports.restoreDatabaseconnection = restoreDatabaseconnection;
exports.waitQueuePool             = waitQueuePool;