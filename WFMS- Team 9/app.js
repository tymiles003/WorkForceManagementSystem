
/**
 * Module dependencies.
 */

var express = require('express')
 , routes = require('./routes')
, http = require('http')
, path = require('path')
, guard = require('./routes/guardController')
,admin=require('./routes/adminController')
,index=require('./routes/index')
,client=require('./routes/clientController');
var app = express();
app.use(express.cookieParser());
app.use(express.session({ secret: 'SJSU10100545CMPE273', cookie: { maxAge:600000 }}));
//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
//development only
if ('development' === app.get('env')) {
app.use(express.errorHandler());}
app.get('/', routes.home);
app.get('/signout',admin.signout);
app.get('/home',routes.home);
app.get('/createbuilding',admin.renderCreateBuilding);
app.post('/createbuilding',admin.createBuilding);
app.get('/index', admin.index);
app.post('/validate',admin.authValidate);
app.post('/getBuildings', guard.getBuildings); // It will give all buildings based on guard id and date
app.get('/getBuildings',admin.getBuildings); // get All buildings without any input
app.post('/getBuildingDetails',admin.getBuildingDetails);
app.get('/getCheckPoints', guard.getCheckPoints);
app.post('/getPatrolTimings',guard.getPatrolTimings);
app.post('/logReport',guard.logReport);
app.get('/alert',guard.raisealert); // To Raise an alert by guard
app.get('/getAlertTypes',guard.getAlertType);
app.post('/submitAlert',guard.submitAlert);
app.get('/submitreport',guard.renderSubmitReport);
app.post('/submitReport',guard.submitReport);
app.post('/displayGuardReport',guard.displayGuardReport);
app.get('/viewGuardSchedule',guard.viewSchedule);
app.get('/myreports',guard.guardReports);
app.get('/getAllGuardReports',guard.getAllGuardReports);
app.get('/viewschedule',guard.renderViewSchedule);
app.get('/guard',guard.guard); // to log report by  guard 
app.get('/createclient',admin.client);
app.post('/createclient',admin.createClient);
app.get('/getStates',admin.getStates);
app.get('/alerts',admin.alerts);
app.get('/getalerts',admin.getalerts);
app.get('/getclients',admin.getClients);
app.get('/getAllClients',admin.getAllClients);
app.get('/myalerts',client.myalerts);  /// to render view alerts page for a client
app.get('/getclientalerts',client.getClientAlerts); // to get all alerts for a client it needs session id 
app.get('/clientreports',client.renderClientReports); // to render client reports
app.get('/getclientreports',client.getclientreports); //to get reports list for a client
app.get('/editbuilding',admin.editbuilding);
//app.get('/getreportdetails',client.getReportDetails);
app.post('/getclient',admin.getClientById);
app.post('/clientbuildngs',admin.getClientBuildings); // it will list all the buildings for a client
app.post('/guardbuildings',admin.getGuardBuildings);
app.get('/listclients',admin.renderListClient);
app.post('/editclient',admin.editClient);
app.post('/deleteclient',admin.deleteClient);
app.get('/createguard',admin.guard);
app.get('/viewbill',admin.viewbill);
app.post('/createguard',admin.createGuard);
app.get('/listguards',admin.renderListGuard);
app.get('/getguardlist',admin.listGuard);//list of guards to edit and view info
app.get('/getguards',admin.getGuards); // for dropdownlist
app.post('/editguard',admin.editGuard);
app.post('/deleteguard',admin.deleteGuard);
app.post('/getguard',admin.getGuardById);
app.get('/reports',admin.reports); // display  reports -- admin
app.get('/getreports',admin.getAllReports); 
app.post('/getDetailedReport',admin.getDetailedReport); // to get detais of a report
app.get('/schedule',admin.rendercreateschedule); // to display create schedule page
app.post('/createschedule',admin.createSchedule); //to create a schedule
app.post('/editschedule',admin.editSchedule);  /// to edit schedule
app.post('/deleteschedule',admin.deleteSchedule);
app.get('/editSchedule',admin.rendereditschedule);
app.get('/getallschedules',admin.getAllSchedules);
app.get('/createalert',admin.createAlert);
app.post('/createalert',admin.createAlerttype);
app.post('/editAlerttype',admin.editAlerttype);
app.post('/deleteAlerttype',admin.deleteAlerttype);
app.get('/home',index.home);
app.get('/test',guard.test);

http.createServer(app).listen(app.get('port'), function(){
	console.log('WorkForce client Listening on Port ' + app.get('port'));
});