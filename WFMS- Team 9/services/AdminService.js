var myDatabase = require('./dbConnectionsController');
var bcrypt = require('./bCrypt');
var sqlCache = require('./SqlCacheService');
function encryptPassword(pwd)
{
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(pwd, salt);	
	return hash;
}


function handle_request(msg, callback)
{	
	var res = {};
	
	if(msg.requestQueue==="login"){
		
		console.log(msg.email);

		var email=msg.email,password=msg.password,role=msg.roleId;
		/************** Create Connection******************************************/
		var dbConn = myDatabase.getDatabaseConnection();
		/*************************************************************************/
		if(dbConn === "empty")
		{
			console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"login", data: msg, callback: callback});
		}
		else 
		{
			
		var query = dbConn.query("select * from user where email=? ",msg.email, function(err, rows){	
			
			
			if(err){
				console.log(err);
				res.error=err;	
			}
			else if(rows.length>0){	 
				console.log('inside');
				if(bcrypt.compareSync(msg.password, rows[0].password.toString())&&  rows[0].roleId==msg.roleId)
				{
						console.log('hello');
					userId=rows[0].userId;
								console.log();		
							//res.fullName=fullName;
							res.userid=userId;
							res.roleId=rows[0].roleId;
							res.code="200";
							//res.lastlogin=new Date();						
							myDatabase.restoreDatabaseconnection(dbConn);
							callback(null, res);
							process.nextTick(function(){myDatabase.waitQueuePool(null);});	
						
				}
				else{
					res.error="Invalid Credentials";
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});	
				}
			}
			else{
				res.error="Invalid User";
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}


			});
		}
	}
	
	
	/***************************************createClient ****************************************************** */	
	if(msg.requestQueue==="createClient")
	{
		console.log("In RMQServer:Client Service for create client");
		
		var encpassword=encryptPassword(msg.password);
		var userDetails={
				"userId":null,
				"email":msg.email,
				"password":encpassword,
				"roleId":msg.roleId,
				"isDeleted":0
			};
		
		var clientDetails={	
				"userId": "0",
				"firstName":msg.firstName,
				"lastName":msg.lastName,
				"addressLine1":msg.addressLine1,
				"addressLine2":msg.addressLine2,
				"city":msg.city,
				"state":msg.state,
				"zipCode":msg.zipCode,
				"phoneNumber":msg.phoneNumber,
				"userSSN":msg.userSSN
			};
		var client={
			"clientId": "0",
			"startDate":new Date(new Date( msg.startDate).toLocaleString()),			
			"endDate":new Date(new Date( msg.endDate).toLocaleString()),
			"serviceFee":msg.serviceFee
		};
		var email = userDetails.email;
		
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"createClient", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select * from user where email=? and isDeleted<>1", [email], function(err, rows) {
				if(err)
				{
					//console.log(err);
					res.error=err;
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}
				else if(rows.length > 0)
				{
					res.error="User Already Existst!!";
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}
				else
				{	
					var query =dbConn.query("INSERT INTO USER SET ? ",userDetails, function(err, rows){
					if(err)
					{	
						//console.log(err);
						res.error=err;
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					}
					else
					{
						//console.log("Rows:"+rows.insertId);
						//console.log(JSON.stringify(rows));
						//console.log(clientDetails);
						clientDetails.userId = rows.insertId;
						//console.log(clientDetails.userId);
						//console.log(clientDetails);
						
						var query =dbConn.query("INSERT INTO USERDETAILS SET ? ",clientDetails, function(err, rows){
							if(err)
							{
								//console.log(err);
								res.error=err;
								myDatabase.restoreDatabaseconnection(dbConn);
								callback(null, res);
								process.nextTick(function(){myDatabase.waitQueuePool(null);});
							}
							else
							{
								client.clientId = clientDetails.userId;
								//console.log(client);
								var query =dbConn.query("INSERT INTO CLIENT SET ? ",client, function(err, rows){
									if(err)
									{
										//console.log(err);
										res.error=err;
									}//Check DB Error for Insert on Client
									else
									{
										res.code='200';
									}//Else-Check DB Error for Insert on Client	
									myDatabase.restoreDatabaseconnection(dbConn);
									callback(null, res);
									process.nextTick(function(){myDatabase.waitQueuePool(null);});
								});//Insert Query on Client
							}//Else-Check DB Error for Insert on User
						});//Insert Query on Userdetails
					}//Else- //Check DB Error for Insert on User
					});//Insert Query on User
				}//Else-Check DB Error for select on User table
				//console.log("Result from end"+res);
				
			});//select query on user
		}
	}// Check if msg Queue text is createClient
	

/***************************************ListClient******************************************************/	
	if(msg.requestQueue==="listClient")
	{
		//console.log("In RMQServer:Client Service for list clients");
		
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"listClient", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state,zipCode,serviceFee,Date(StartDate) as clientStartDate,Date(EndDate) as clientEndDate from userdetails as ud"+
									 "inner join client clt on userId = clientId where clt.isDeleted=0 ", function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.clients=rows;
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
	}// Check if msg Queue text is listClient
	
	
	/***************************************ListClient******************************************************/	
	if(msg.requestQueue==="getAllClients")
	{
		//console.log("In RMQServer:Client Service for list clients");
		
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"listClient", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select  concat(firstName,' ',lastName) as name,userId as clientId from userdetails as ud"+
									 "inner join client clt on userId = clientId where clt.isDeleted=0 ", function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.clients=rows;
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
	}// Ch
/* ****************************************************************************************************** */	
	
	if(msg.requestQueue==="getClientDetails")
	{
		//console.log("In RMQServer:Client Service for getClientDetails");
		var clientId=msg.clientId;
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getClientDetails", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select client.clientId,ud.userSSN,firstName,user.email,lastName,phoneNumber,Date(StartDate) as clientStartDate,Date(EndDate) as clientEndDate,serviceFee,"+
										 "ud.addressLine1,ud.addressLine2,client.clientId,ud.city,ud.state,ud.zipCode from client inner join user  on client.clientId=user.userId"+
										 " inner join userdetails as ud on client.clientId=ud.userId where user.isDeleted=0 and client.clientId=?",clientId ,function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.client=rows;
				}// Else - Check DB Error for select on Client
				
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
	}// Check if msg Queue text is listClient
/* ******************************************************************************************  */	
	if(msg.requestQueue==="getClientBuildings")
	{
		//console.log("In RMQServer:Client Service for getClientBuildings");
		var clientId=msg.clientId;
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getClientBuildings", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select buildingName,addressLine1,addressLine2,city,state,zipCode,Date(serviceStartDate) as serviceStartDate ,Date(serviceEndDate) as serviceEndDate ,guardsRequired FROM building where "+
									 "isDeleted=0 and clientId=?",clientId ,function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.clientbuildings=rows;
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query o
		}
	}
	
/* ******************************************************************************************  */		
	if(msg.requestQueue==="getBuildings")
	{
		//console.log("In RMQServer:Client Service for list buildings");		
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getBuildings", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select * from building where isDeleted=0", function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.data=rows;
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
	}// Check if msg Queue text is listClient
	
	if(msg.requestQueue==="getAllBuildingDetails")
	{	
		var res = {};
		//console.log("rec"+msg.recipients);
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getAllBuildingDetails", data: msg, callback: callback});
		}
		else 
		{
			var query =dbConn.query("SELECT * from building" , function(err, rows)
			{ 
				if(err)
				{
					//console.log("DB query failed" + err.errno);
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
						res.data = "no building details";
					}
				}
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});
		}
		
	}
	if(msg.requestQueue==="getBuildingDetails")
	{
		//console.log("In RMQServer:Client Service for list buildings");		
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"getBuildingDetails", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select buildingId,addressLine1,addressLine2,serviceStartDate,city,state,zipcode,cost,buildingName,serviceEndDate,guardsRequired from building where isDeleted=0", function(err, rows){
				if(err)
				{
					//console.log("In Error for list clients"+err)
					res.error=err;
				}//Check DB Error for select on Client
				else
				{
					var bldng=rows;
						console.log(bldng);
					var query = dbConn.query("select * from checkinpoints where buildingId=?",msg.buildingId, function(err, rows){
						if(err)
						{
							//console.log("In Error for list clients"+err)
							res.error=err;
						}//Check DB Error for select on Client
						else
						{
							res.code=200;	
							res.checkpoints=rows;
							res.bldng=bldng;
							
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
					
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
	}
//deleteClient	
/***************************************deleteClient******************************************************/
	if(msg.requestQueue==="deleteClient")
	{	
		var clientId = msg.clientId;
		//console.log("In RMQServer:Client Service for delete clients");
		
		//console.log(clientId);
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"deleteClient", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("update client set ? where clientId=?",[{isDeleted:1},clientId], function(err, rows) {
				if(err)
				{
					//console.log("In Error for Delete clients"+err);
					res.error=err;
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}
				else
				{
					var query = dbConn.query("update user set ? where userId=?",[{isDeleted:1},clientId],function(err, rows){
						if(err)
						{
							//console.log("In Error for Delete clients"+err);
							res.error=err;
						}
						else
						{
							res.code='200';
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
				}
			});
		}
	}// Check if msg Queue text is deleteClient


//editClient
/***************************************editClient******************************************************/
	if(msg.requestQueue==="editClient")
	{		
		var clientDetails={	
				"userId": msg.userId,
				"firstName":msg.firstName,
				"lastName":msg.lastName,
				"addressLine1":msg.addressLine1,
				"addressLine2":msg.addressLine2,
				"city":msg.city,
				"state":msg.state,
				"zipCode":msg.zipCode,
				"phoneNumber":msg.phoneNumber
			};
		var client={
			
			"startDate":new Date(new Date( msg.startDate).toLocaleString()),
			"endDate":new Date(new Date( msg.endDate).toLocaleString()),
			"serviceFee":msg.serviceFee
		};
		//console.log("In RMQServer:Client Service for Edit client");
		////console.log(clientDetails);	
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"editClient", data: msg, callback: callback});
		}
		else 
		{
			var query =dbConn.query("UPDATE USERDETAILS SET ? where userId=?",[{userId:clientDetails.userId,firstName:clientDetails.firstName, lastName:clientDetails.lastName, addressLine1:clientDetails.addressLine1, addressLine2:clientDetails.addressLine2, city:clientDetails.city, state:clientDetails.state, zipCode:clientDetails.zipCode, phoneNumber:clientDetails.phoneNumber}, clientDetails.userId], function(err, rows){
				if(err)
				{
					//console.log(err);
					res.error=err;
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}//Check DB Error for Insert on Client
				else
					{
						var query = dbConn.query("update client set ? where clientId=?",[{serviceFee:client.serviceFee, startDate:client.startDate,endDate:client.endDate},clientDetails.userId],function(err, rows){
							if(err)
							{
								
								res.error=err;
								myDatabase.restoreDatabaseconnection(dbConn);
								callback(null, res);
								process.nextTick(function(){myDatabase.waitQueuePool(null);});
							}
							else
							{
								////console.log("In  clients");
								res.code='200';
								myDatabase.restoreDatabaseconnection(dbConn);
								callback(null, res);
								process.nextTick(function(){myDatabase.waitQueuePool(null);});
							}
						});
					}//Else-Check DB Error for Insert on Client		
			});////Insert Query on UserDetails
		}
	}//// Check if msg Queue text is editClient

/***************************************changePassword******************************************************/
if(msg.requestQueue==="changePassword")
	{
		var email=msg.email,password=msg.password,newpassword=msg.newpassword;
		//console.log("In RMQServer:Client Service for Change Password");
		var dbConn = myDatabase.getDatabaseConnection();
		if(dbConn === "empty")
		{
			//console.log("no DB connections available");
			myDatabase.waitQueuePool({name:"changePassword", data: msg, callback: callback});
		}
		else 
		{
			var query = dbConn.query("select * from user where email=? ",email, function(err, rows){
				if(err)
				{
					//console.log(err);
					res.error=err;
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}//Check DB Error for Insert on Client	
				else
				{
					if(bcrypt.compareSync(password, rows[0].password.toString()))
					{
						var newencpassword=encryptPassword(newpassword);
						
						//console.log("oldpwd:"+rows[0].password+"Newpwd:"+newpassword+"from query:"+rows[0].password.toString());
						var query=dbConn.query("Update user set ? where userId=? ",[{password : newencpassword},rows[0].userId], function(err, rows){
							if(err)
							{
								//console.log(err);
								res.error=err;
							}//Check DB Error for Update on User
							else
							{
								res.code='200';
							}//Else-Check DB Error for Insert on Client	
							myDatabase.restoreDatabaseconnection(dbConn);
							callback(null, res);
							process.nextTick(function(){myDatabase.waitQueuePool(null);});
						});////Update Query on User
					}//Check both passwords
					else
					{
						//console.log("oldpwd:"+rows[0].password+"Newpwd:"+newpassword+"from query:"+rows[0].password.toString());
						res.error="Invalid Credentials";
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					}
				}//Else-Check DB Error for Select on User
			});	//Select Query on User
		}
	}// Check if msg Queue text is changePassword		
	


if(msg.requestQueue==="deleteBuilding")
{
	var buildingId = msg.buildingId;
	
	//console.log("In RMQServer:Building Service for Delete Bulding");
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"deleteBuilding", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("update building set ? where buildingId=?",[{isDeleted:1},buildingId], function(err, rows) {
			if(err)
			{
				//console.log("In Error for Delete Building"+err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}//check DB Error for Delete on Building
			else
			{
				var query = dbConn.query("update checkinpoints set ? where buildingId=?",[{isDeleted:1},buildingId], function(err, rows) {
				if(err)
				{
					//console.log("In Error for Delete Checkpoints"+err);
					res.error=err;
				}//check DB Error for Delete on Checkpoints 
				else
				{
					res.code='200';
				}
				});
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
		});
	}
}//msg for deleteBuilding
//------------------------------------------Create Building----------------------------------------------------------------	
if(msg.requestQueue==="createBuilding")
{
	var building={
		"buildingId":null,
		"addressLine1":msg.addressLine1,
		"addressLine2":msg.addressLine2,
		"clientId":msg.clientId,
		"serviceStartDate":new Date(new Date( msg.serviceStartDate).toLocaleString()),
		"city":msg.city,
		"state":msg.state,
		"zipCode":msg.zipCode,
		"cost":msg.cost,
		"buildingName":msg.buildingName,
		"isDeleted":0,
		"guardsRequired":msg.guardscount,
		"serviceEndDate":new Date(new Date( msg.serviceEndDate).toLocaleString())
	};
	 var cp=msg.cp;
	 //console.log(msg.cp);
	 var checkInPoints=[];
	//console.log("In RMQServer:Building Service for Create Bulding");
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"createBuilding", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("INSERT INTO Building SET ? ",building, function(err, rows){
			if(err)
			{
				console.log(err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}//Check DB Error for Insert on Building
			else
			{
				for(var i=0;i<cp.length;i++)
				{
					// checkInPoints[i].checkinId = null;
					// checkInPoints[i].Description = cp.description;
					// checkInPoints[i].latitude = cp.latitude;
					// checkInPoints[i].longitude = cp.longitude;
					// checkInPoints[i].buildingId = rows.insertId;
					// checkInPoints[i].isDeleted = null;
					checkInPoints[i] = {"checkinId" : null,
										"Description":cp[i].CheckPointName,
										"latitude":cp[i].latitude,
										"longitude":cp[i].longitude,
										"buildingId": rows.insertId,
										"isDeleted":null};
					//console.log(JSON.stringify(checkInPoints[i]));
					
				}// for loop
				//console.log("Rows:"+rows.insertId);
					var query =dbConn.query("INSERT INTO checkinpoints SET ? ",checkInPoints, function(err, rows){
						if(err)
						{
							console.log("check point error :"+err);
							res.error=err;
						}
						else{
								 res.code='200';
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
			}//Else - check DB Error for Insert on Building
		});//Insert Query on Building
	}
}//msg for createBuilding

//------------------------------------------Edit Building----------------------------------------------------------------	
if(msg.requestQueue==="editBuilding")
{
	var building={
		"buildingId":msg.buildingId,
		"addressLine1":msg.addressLine1,
		"addressLine2":msg.addressLine2,
		"clientId":msg.clientId,
		"serviceStartDate":msg.serviceStartDate,
		"city":msg.city,
		"state":msg.state,
		"zipCode":msg.zipCode,
		"cost":msg.cost,
		"buildingName":msg.buildingName,
		"isDeleted":0,
		"guardscount":guardscount,
		"serviceEndDate":msg.serviceEndDate
	};
	var cp=msg.cp;
	//console.log(msg.cp);
	var checkInPoints=[];
	//console.log("In RMQServer:Building Service for Edit Bulding");
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"editBuilding", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("UPDATE building SET ? where buildingId=?",[{buildingId:building.buildingId, addressLine1:building.addressLine1, addressLine2:building.addressLine2, clientId:building.clientId, serviceStartDate:building.serviceStartDate, city:building.city, state:building.state, zipCode:building.zipCode, cost:building.cost, buildingName:building.buildingName, serviceEndDate:building.serviceEndDate}, building.buildingId], function(err, rows){
			if(err)
			{
				//console.log(err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}//Check DB Error for Update on Building
			else
			{
				for(var i=0;i<cp.length;i++)
				{
					checkInPoints[i] = {"checkinId" :cp[i].checkinId,
										"Description":cp[i].description,
										"latitude":cp[i].latitude,
										"longitude":cp[i].longitude,
										"buildingId": cp[i].buildingId,
										"isDeleted":null};
					//console.log(JSON.stringify(checkInPoints[i]));		
				}//for loop
				var query =dbConn.query("update checkinpoints set ? where checkinId=?",[{checkinId:checkInPoints.checkinId,Description:checkInPoints.description, latitude:checkInPoints.latitude, longitude:checkInPoints.longitude, buildingId:checkInPoints.buildingId, },checkInPoints.checkinId], function(err, rows){
					if(err)
					{
						//console.log(err);
						res.error=err;
					}//Check DB Error for Update on Checkpoints
					else
					{
						res.code='200';
					}
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				});
				
			}//Else - Check DB Error for Update on Building
		});
	}
}//msg for editBuilding
/* ************************************************************************* */

if(msg.requestQueue==="listReportAllBuilding")
{
	//console.log("In RMQServer:Report Service for listReportAllBuilding");
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"listReportAllBuilding", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("select Date(sc.startTime) as ReportDate,sc.buildingId,bldng.buildingName    from schedule as sc inner join building as bldng on sc.buildingId=bldng.buildingId where sc.isReportSubmitted='1' group by sc.buildingId", function(err, rows){
	
			if(err)
			{
				//console.log("In Error for list clients"+err)
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.reports=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}


/* ****************************************************************************** */

if(msg.requestQueue==="getAllReports")
{
	//console.log("In RMQServer:Report Service for get all reports");
	var cltId = msg.clientId;
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getAllReports", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("SELECT  sc.buildingId,bldng.buildingName,Date(sc.startTime) as reportDate , sc.guardId,bldng.clientId,ud1.firstName as clientName  FROM schedule as sc "+
									 "inner join building bldng on sc.buildingId=bldng.buildingId "
									 +"inner join client on bldng.clientId=client.clientId "
									 +"inner join userdetails as ud1 on client.clientId=ud1.userId "
									 +"where  sc.isReportSubmitted=1 group by sc.buildingId , Date(sc.startTime)", function(err, rows){
	
			if(err)
			{
				//console.log(err);
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.reports=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}


if(msg.requestQueue==="listReportClient")
{
	//console.log("In RMQServer:Report Service for list report clients");
	var cltId = msg.clientId;
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"listReportClient", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query(" SELECT sc.buildingId,bldng.buildingName ,client.clientId , Date(sc.startTime) as reportDate FROM schedule as sc inner join building bldng on sc.buildingId=bldng.buildingId inner join client on bldng.clientId=client.clientId where  client.clientId= ? and sc.isReportSubmitted=1  group by sc.buildingId , Date(sc.startTime) ",[cltId], function(err, rows){
	
			if(err)
			{
				//console.log("In Error for list clients"+err)
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.reports=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}
if(msg.requestQueue==="listReportBuilding")
{
	//console.log("In RMQServer:Report Service for list buildings");
	var bldId = msg.buildingId;
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"listReportBuilding", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("SELECT sc.buildingId,bldng.buildingName,Date(sc.startTime) as reportDate FROM schedule as sc inner join building bldng on sc.buildingId=bldng.buildingId where sc.buildingId = ?  and sc.isReportSubmitted=1 group by sc.buildingId , Date(sc.startTime) ",[bldId], function(err, rows){
	
			if(err)
			{
				//console.log(err)
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.reports=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}
if(msg.requestQueue==="listReportDate")
{
	//console.log("In RMQServer:Report Service for list report date");
	var cltId = msg.cltId;
	var startDate = msg.startDate;
	var endDate = msg.endDate;
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"listReportDate", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("SELECT sc.buildingId,bldng.buildingName ,client.clientId , Date(sc.startTime) as reportDate FROM schedule as sc inner join building bldng on sc.buildingId=bldng.buildingId inner join client on bldng.clientId=client.clientId where  client.clientId= ? and  Date(startTime) in (?,?)  group by sc.buildingId , Date(sc.startTime) ",[cltId,startDate,endDate], function(err, rows){
	
			if(err)
			{
				//console.log(err)
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.reports=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}
if(msg.requestQueue==="getDetailedReport")
{
	var buildingId = msg.buildingId;
	var reportDate =  msg.reportDate;
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getDetailedReport", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("select Date(sc.startTime) as reportDate,bldng.buildingName,ud.firstName,ud.userSSN,cp.description as cpName,dp.patrolTime,dp.disposition," +
									"dp.mtnService,dp.callOfService,dp.parkingViolation,dp.incident" +
									" from dailypatrols as dp inner join schedule as sc on dp.idSchedule=sc.idschedule inner join" +
									" checkinpoints as cp on dp.checkinId=cp.checkinId inner join building as bldng on cp.buildingId=bldng.buildingId inner join" +
									" userdetails as ud on dp.guardId=ud.userId where sc.isReportSubmitted=1 and dp.idSchedule in (select idschedule from schedule" +
									" where DATE_FORMAT(sc.startTime,'%m/%d/%Y')=?  and  buildingId = ? )",[reportDate,buildingId], function(err, rows){
			if(err)
			{
				//console.log(err)
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}//Check DB Error for select on Client
			else
			{
				 detailedReport=rows;
				 dbConn.query("select concat(ud.firstName,' ',ud.lastName) as guardName,ud.userSSN as guardId  from schedule as sc"+
					            " inner join userdetails  as ud on sc.guardId=ud.userId" +
					            " where  sc.isReportSubmitted=1 and DATE_FORMAT(sc.startTime,'%m/%d/%Y')=?    and sc.buildingId=?",[reportDate,buildingId],function(err,rows){
					if(err)
					{
						//console.log(err)
						res.error=err;					
					}
					else
					{
						res.code=200;
						
						//console.log(rows);
						res.guards=rows;
						res.reports=detailedReport;
					}
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				});
			} 
		});
	}
}

/***************************************createGuard ****************************************************** */	
/***************************************createGuard ****************************************************** */	
if(msg.requestQueue==="createGuard")
{
	var encpassword=encryptPassword(msg.password);
	var userDetails={
			
			"email":msg.email,
			"password":encpassword,
			"roleId":msg.roleId,
			"isDeleted":0
		};
	var guardDetails={
			"firstName":msg.firstName,
			"lastName":msg.lastName,
			"addressLine1":msg.addressLine1,
			"addressLine2":msg.addressLine2,
			"city":msg.city,
			"state":msg.state,
			"zipCode":msg.zipCode,
			"phoneNumber":msg.phoneNumber,
			"userSSN":msg.userSSN
		};
	var guard={
		
		"startDate":new Date(new Date( msg.startDate).toLocaleString()),
		"endDate":new Date(new Date( msg.endDate).toLocaleString()),
		"backgroundStatus":parseInt(msg.backgroundStatus)
	};
	var email = userDetails.email;
	
	//console.log("In RMQServer:Guard Service for create guard");
	////console.log(userDetails);
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"createGuard", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("select * from user where email=? and isDeleted<>1", email, function(err, rows) {
			if(err)
			{
				//console.log(err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
				
			}
			else if(rows.length > 0)
			{
				//console.log(rows);
				res.error="User Already Existst!!";
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
			else
			{
				//console.log("Create new Guard!");
				var query =dbConn.query("INSERT INTO USER SET ? ",userDetails, function(err, rows){
				//console.log("Error After Insert Query on User"+err);
					if(err)
					{
						//console.log(err);
						res.error=err;
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					}
					else
					{
						//console.log("Rows:"+rows.insertId);
						//console.log(JSON.stringify(rows));
						//console.log(guardDetails);
						guardDetails.userId = rows.insertId;
						//console.log(guardDetails.userId);
						//console.log(guardDetails);
						
						var query =dbConn.query("INSERT INTO USERDETAILS SET ? ",guardDetails, function(err, rows){
							
							if(err)
							{
								//console.log(err);
								res.error=err;
								callback(null, res);
							}
							else
							{
								guard.guardId = guardDetails.userId;
								//console.log(guard);
								var query =dbConn.query("INSERT INTO guard SET ? ",guard, function(err, rows){
									if(err)
									{
										//console.log(err);
										res.error=err;
									}
									else
									{
										res.code='200';
										//apoorva
										var dbQuery = "select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state,zipCode,grd.startDate,grd.endDate,case when grd.backgroundStatus=1 then 'true' else 'false' end as status from userdetails as ud"+
										  "inner join guard grd on userId = guardId where grd.isDeleted=0 ";
										var query = dbConn.query(dbQuery, function(err, rows){
											if(err)
											{
												console.log("no guards to insert into cache");
											}//Check DB Error for select on Client
											else
											{
												console.log("adding guards list to cache");
												sqlCache.SQLCacheRemoveData(dbQuery);
												sqlCache.SQLCacheAddData(dbQuery, rows);
											}// Else - Check DB Error for select on Client
										});
									}
									//console.log(res);
									myDatabase.restoreDatabaseconnection(dbConn);
									callback(null, res);
									process.nextTick(function(){myDatabase.waitQueuePool(null);});
								});
							}
						});
					}
				});
			}
			//console.log("Result from end"+res);
		});	
	}	
}
/***************************************ListGuard******************************************************/	
if(msg.requestQueue==="listGuard")
{
	//console.log("In RMQServer:Client Service for list guards");
	console.log();
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"listGuard", data: msg, callback: callback});
	}
	else 
	{
		var dbQuery = "select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state,zipCode,grd.startDate,grd.endDate,case when grd.backgroundStatus=1 then 'true' else 'false' end as status from userdetails as ud"+
					  "inner join guard grd on userId = guardId where grd.isDeleted=0 ";
		var queryCache = sqlCache.SQLCacheGetData(dbQuery);
		if(queryCache === null)
		{
			
			var query = dbConn.query(dbQuery, function(err, rows){
				if(err)
				{
					res.error="Guards not found in the system";
				}//Check DB Error for select on Client
				else
				{
					res.code=200;	
					res.guards=rows;
				}// Else - Check DB Error for select on Client
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			});//select query on Client
		}
		else
		{
			res.code = 200;
			res.guards = queryCache;
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		}
	}
}// Check if msg Queue text is listClient

/* *******************************************************get All Guards *************************************** */

if(msg.requestQueue==="getGuards")
{
	//console.log("In RMQServer:Client Service for listing All guards");
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("No DB connections available");
		myDatabase.waitQueuePool({name:"getGuards", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("select concat(firstName,' ',lastName) as name,userId as guardId from userdetails as ud " +
				"inner join guard on ud.userId=guard.guardId where guard.isDeleted=0", function(err, rows){
			if(err)
			{
				
				res.error=err;
			}//Check DB Error for select on Client
			else
			{
				res.code=200;	
				res.guards=rows;
			}// Else - Check DB Error for select on Client
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});//select query on Client
	}
}// Check if msg Queue text is listClient
//*****************************************************deleteGuard*********************************************/	
if(msg.requestQueue==="deleteGuard")
{	
	var guardId = msg.guardId;
	//console.log("In RMQServer:guard Service for delete guards");	
	//console.log(guardId);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"deleteGuard", data: msg, callback: callback});
	}
	else 
	{
		var query = dbConn.query("update guard set ? where guardId=?",[{isDeleted:1},guardId], function(err, rows) {
			if(err)
			{
				//console.log("In Error for Delete guards"+err);
				res.error=err;
				myDatabase.restoreDatabaseconnection(dbConn);
				callback(null, res);
				process.nextTick(function(){myDatabase.waitQueuePool(null);});
			}
			else
			{
				var query = dbConn.query("update user set ? where userId=?",[{isDeleted:1},guardId],function(err, rows){
					if(err)
					{
						//console.log("In Error for Delete guards"+err);
						res.error=err;
					}
					else
					{
						//console.log("In Else Success for Delete guards");
						res.code='200';
						var dbQuery = "select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state,zipCode,grd.startDate,grd.endDate,case when grd.backgroundStatus=1 then 'true' else 'false' end as status from userdetails as ud"+
						  "inner join guard grd on userId = guardId where grd.isDeleted=0 ";
						var query = dbConn.query(dbQuery, function(err, rows){
							if(err)
							{
								console.log("no guards to insert into cache");
							}//Check DB Error for select on Client
							else
							{
								console.log("updating guards list to cache");
								sqlCache.SQLCacheRemoveData(dbQuery);
								sqlCache.SQLCacheAddData(dbQuery, rows);
							}// Else - Check DB Error for select on Client
						});
					}
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				});
			}
		});
	}
}

//******************************************Display Guard information***************************//
	
if(msg.requestQueue==="displayGuard")
{
	var guardId = msg.guardId;
	//console.log("In RMQServer:guard Service for display guards");
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"displayGuard", data: msg, callback: callback});
	}
	else 
	{
		//var query = dbConn.query("select u.firstName , u.lastName , s.buildingId from userdetails as ud inner join user as u on ud.userId = u.userId inner join guard as g on g.guardId = u.userId inner join schedule as s on s.guardId = g.guardId where g.guardId = ?", guardId, function(err, rows){
		var query = dbConn.query("select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state," +
				"zipCode,grd.startDate,grd.endDate,case when grd.backgroundStatus=1 then 'verified' else 'Not Verified' end as status from userdetails as ud"+
				"inner join guard grd on userId = guardId where grd.isDeleted=0 and guardId=?",msg.guardId, function(err, rows){
			if(err)
			{
				//console.log(err);
				res.error=err;
			}
			else
			{
				res.code=200;	
				res.guard=rows;
				console.log(rows);
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}





//**************************************************************************************************//
if(msg.requestQueue==="editGuard")
{		
	var guardDetails={	
			"userId": msg.userId,
			"firstName":msg.firstName,
			"lastName":msg.lastName,
			"addressLine1":msg.addressLine1,
			"addressLine2":msg.addressLine2,
			"city":msg.city,
			"state":msg.state,
			"zipCode":msg.zipCode,
			"phoneNumber":msg.phoneNumber
		};
	var guard={
		"startDate":new Date(new Date( msg.startDate).toLocaleString()),
		"endDate":new Date(new Date( msg.endDate).toLocaleString()),
		"backgroundStatus":parseInt(msg.status)
	};

	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		
		myDatabase.waitQueuePool({name:"editGuard", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("UPDATE USERDETAILS SET ? where userId=?",[{userId:guardDetails.userId,firstName:guardDetails.firstName, lastName:guardDetails.lastName, addressLine1:guardDetails.addressLine1, addressLine2:guardDetails.addressLine2, city:guardDetails.city, state:guardDetails.state, zipCode:guardDetails.zipCode, phoneNumber:guardDetails.phoneNumber}, guardDetails.userId], function(err, rows){
	
			if(err)
				{
					
					res.error=err;
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				}
			else
				{
					var query = dbConn.query("update guard set ? where guardId=?",[{backgroundStatus:guard.backgroundStatus, startDate:guard.startDate,endDate:guard.endDate},guardDetails.userId],function(err, rows){
						if(err)
						{
							
							res.error=err;
						}
						else
						{
							res.code='200';
							var dbQuery = "select  firstName,lastName,userSSN as userSSN,userId ,phoneNumber as phno,addressLine1,addressLine2,city,state,zipCode,grd.startDate,grd.endDate,case when grd.backgroundStatus=1 then 'true' else 'false' end as status from userdetails as ud"+
							  "inner join guard grd on userId = guardId where grd.isDeleted=0 ";
							var query = dbConn.query(dbQuery, function(err, rows){
								if(err)
								{
									console.log("no guards to insert into cache");
								}
								else
								{
									console.log("updating guards list to cache");
									sqlCache.SQLCacheRemoveData(dbQuery);
									sqlCache.SQLCacheAddData(dbQuery, rows);
								}
							});
						}
						myDatabase.restoreDatabaseconnection(dbConn);
						callback(null, res);
						process.nextTick(function(){myDatabase.waitQueuePool(null);});
					});
				
				}	
					
		});
	}
}
if(msg.requestQueue==="deleteSchedule")
{	
	console.log(msg.idschedule);
	
	var res = {};
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"deleteSchedule", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("DELETE from schedule where idschedule=?"
				,msg.idschedule, function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				res.code='200';
				res.data = "Sechedule deleted successfully";
				
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}


if(msg.requestQueue==="createSchedule")
{	
	var res = {};
	var data = {
			guardId : msg.guardID,
			buildingId : msg.buildingId,
			startTime : new Date(new Date( msg.startDate).toLocaleString()),
			endTime :new Date(new Date( msg.endDate).toLocaleString()),
			isReportSubmitted:msg.isReportSubmitted
		};
	//console.log("time:"+msg.startDate);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"createSchedule", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("select * from  schedule as sc where guardId= ? and DATE_FORMAT(sc.startTime,'%m/%d/%Y %H:%i:%s')=?  and DATE_FORMAT(sc.endTime,'%m/%d/%Y %H:%i:%s')=? and  buildingId=?"
				,[data.guardId,msg.startDate,msg.endDate,data.buildingId], function(err, rows)
				{
					if(err)
					{
						//console.log("DB query failed" + err.errno);
						res.error=err;
					}
					else
					{
						//console.log("length:"+rows.length);
						if(!rows.length>0)
						{
								var query =dbConn.query("INSERT into schedule set ?"
										,data, function(err, rows)
								{ 
									if(err)
									{
										//console.log("DB query failed" + err.errno);
										res.error=err;
									}
									else
									{
										res.code='200';
									}
									myDatabase.restoreDatabaseconnection(dbConn);
									callback(null, res);
									process.nextTick(function(){myDatabase.waitQueuePool(null);});
								});
						}
						else{
							res.error='Duplicate Schedule Found for this Data';							
						}
						
					}
					myDatabase.restoreDatabaseconnection(dbConn);
					callback(null, res);
					process.nextTick(function(){myDatabase.waitQueuePool(null);});
				
				});
	
	}
}

if(msg.requestQueue==="getSchedules")
{

	var res = {};

	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"viewSchedule", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("select schedule.idschedule, building.buildingId,building.buildingName,concat(ud.firstName,' ',ud.lastName)as name,guardId,schedule.startTime as startTime,schedule.endTime as endTime " +
			                    "from schedule " +
			                    "inner join building " +
			                    "on schedule.buildingId = building.buildingId inner join userdetails as ud on schedule.guardId=ud.userId order by startTime desc ",function(err, rows)
		{ 
			
			// where  WEEK(startTime) = WEEK(CURDATE())
			if(err)
			{
				//console.log("DB query failed" + err.errno);
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

if(msg.requestQueue==="editSchedule")
{	
	var res = {};
	
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		//console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"editSchedule", data: msg, callback: callback});
	}
	else 
	{
		//console.log(msg.buildingId," ,"+msg.startDate+","+msg.idschedule);
		var query =dbConn.query("UPDATE  schedule set ? where idschedule=?"
				,[{
					buildingId:msg.buildingId,
					startTime : new Date(new Date( msg.startDate).toLocaleString()),
					endTime :new Date(new Date( msg.endDate).toLocaleString()),
			       }, msg.idSchedule], function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err);
				res.error=err;
			}
			else
			{
				res.code='200';
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}


if(msg.requestQueue==="createAlerttype")
{	
	var res = {};
	var data = {
			alertName : msg.alertName,
			recipients : msg.recipients,
			};
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"createAlerttype", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("INSERT into alertType set ?"
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
				res.data = "Alert type inserted successfully";
				
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}

if(msg.requestQueue==="deleteAlerttype")
{	
	var res = {};
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"deleteAlerttype", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("DELETE from alertType where alertTypeId=?"
				,msg.alertTypeId, function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				res.code='200';
				res.data = "Alert Type Successfully deleted";
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}
if(msg.requestQueue==="editAlerttype")
{	
	var res = {};
	//console.log("rec"+msg.recipients);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"editAlerttype", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("UPDATE alertType set ? where alertTypeId=?"
				,[{recipients : msg.recipients},
			        msg.alertTypeId], function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				res.code='200';
				res.data = "Recipients updated successfully";
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}



if(msg.requestQueue==="getGuardBuildings")
{	
	var res = {};
	//console.log("rec"+msg.recipients);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getGuardBuildings", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("  select buildingName ,sc.buildingId, addressLine1,addressLine2,city,ZipCode from schedule as sc" +
				" inner join building as bldng on sc.buildingId=bldng.buildingId where WEEK(sc.startTime) = WEEK(CURDATE()) and guardId=?"
				,msg.guardId, function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err.errno);
				res.error=err;
			}
			else
			{
				res.code='200';
				res.buildings = rows;
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}



if(msg.requestQueue==="getalerts")
{	
	var res = {};
	//console.log("rec"+msg.recipients);
	var dbConn = myDatabase.getDatabaseConnection();
	if(dbConn === "empty")
	{
		console.log("no DB connections available");
		myDatabase.waitQueuePool({name:"getalerts", data: msg, callback: callback});
	}
	else 
	{
		var query =dbConn.query("SELECT ud.firstName as clientname,alertTime,alertName ,severity,bldng.buildingName FROM alerts "+
				"inner join alerttype on alerttype.alertTypeId=alerts.alertTypeId "+
			 "inner join building as bldng on alerts.buildingId = bldng.buildingId inner join  client on bldng.clientId=client.clientId inner join userdetails as ud" +
			 " on client.clientId=ud.userId"  , function(err, rows)
		{ 
			if(err)
			{
				console.log("DB query failed" + err);
				res.error=err;
			}
			else
			{
				res.code='200';
				res.alerts = rows;
			}
			myDatabase.restoreDatabaseconnection(dbConn);
			callback(null, res);
			process.nextTick(function(){myDatabase.waitQueuePool(null);});
		});
	}
}




}


exports.handle_request = handle_request;