var NodeHelper = require('node_helper');
const request = require('request');
const fs = require('fs');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var isActive = 0;
const now = new Date();
var eventDetails_lasttimestamp = Date.now();
var InactiveEpochTime = now.getTime();
//var ImageEpochTime = Math.round(now.getTime() / 1000);
var ImageEpochTime = Date.now();
var resultSet = '';
const imagepath = './modules/MMM-HikVisionMotion/';
let imagedeleteregex = /[.]jfif$/;

module.exports = NodeHelper.create({

        start: function() {
                console.log("Starting node_helper for module: " + this.name);
		this.config = null;
        },

	checkMotion: function(){
		var self = this;

		var host = this.config.host;
		var port = this.config.port;
		var user = this.config.user;
		var password = this.config.password;
		var imageFreshness = this.config.imageFreshness;
		var imageDelete = ((imageFreshness + 60) * 1000);

		try {
			request
        			.get('http://' +host+ ':' +port+ '/ISAPI/Event/notification/alertStream')
        			.auth(user,password,false)
        			.on('data', (data) => {
				if(typeof(data) === 'object') {
				//if(typeof(data) != 'undefined') {
				console.log(typeof(data));
				//if((typeof(data) != 'undefined') && (typeof(data) === 'string')) {
                			parser.parseString(data, function(err, result) {
					try {
                        			if(result && typeof(result) != 'undefined'){
							if((typeof(result['EventNotificationAlert']) != 'undefined') && (typeof(result['EventNotificationAlert']['eventType']) != 'undefined') && (typeof(result['EventNotificationAlert']['eventState']) != 'undefined') && (typeof(result['EventNotificationAlert']['activePostCount']) != 'undefined')) {
                                			var code = result['EventNotificationAlert']['eventType'][0]
                                			var action = result['EventNotificationAlert']['eventState'][0]
                                			var count = parseInt(result['EventNotificationAlert']['activePostCount'][0])

                                			if (code === 'VMD' || code === 'linedetection'){
                                        			eventDetails_lasttimestamp = Date.now();
                                        			if (action === 'active' && isActive === 0){
                                                			console.log('Action Start');
                                                			isActive = 1;
                                                			ImageEpochTime = Date.now();
									ImageID = 'camera-' +ImageEpochTime+ '.jfif';
									fs.readdirSync(imagepath) //delete old images
    										.filter(f => (imagedeleteregex.test(f)) && ((new Date().getTime() - new Date(fs.statSync(imagepath + f).mtime).getTime()) > imageDelete))
										.map(f => fs.unlinkSync(imagepath + f));
                                                			request.get('http://' +host+ ':' +port+ '/ISAPI/Streaming/channels/101/picture').auth(user,password,false).pipe(fs.createWriteStream('./modules/MMM-HikVisionMotion/' +ImageID));
									resultSet = 'Motion Detected: ' +ImageEpochTime+ ':' + ImageID;
                                                                        setTimeout(function(){
									var stats = fs.statSync(imagepath + ImageID);
									var mtime = stats.mtime;
									var emtime = new Date(mtime).getTime()
									while (emtime != eutime){
                                                                                setTimeout(function(){
                                                                                //pause function to allow time for data change to happen to the file
                                                                                }, 500);
										var stats = fs.statSync(imagepath + ImageID);
										var utime = stats.mtime;
										var eutime = new Date(utime).getTime()
									console.log("mtime: "+emtime+" utime: "+eutime);
									}
									self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
									}, 1000);
									//setTimeout(function(){
									//	self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
									//}, 5000);
                                        			};
                                			};
                                			//console.log(((Date.now() - eventDetails_lasttimestamp)/1000) > 2);
                                			if (((Date.now() - eventDetails_lasttimestamp)/1000) > 2) {
                                        			isActive = 0;
								InactiveEpochTime = Date.now();
								resultSet = 'No Motion Detected: ' +InactiveEpochTime;
								//console.log(resultSet);
								self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
                                			};
							}
                        			}
					}
					catch(err) {
					console.error("XML Parser Error");
					console.error(err);
					var resultSet = 'XML Parser Error';
					self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
					self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
					}
                			});
				}
        			})
        			.on('close', () => {
					resultSet = 'ERROR';
                                        self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
        			})
                                .on('disconnect', () => {// Try to reconnect after 30s
                                         resultSet = 'ERROR';
                                         self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
                                })

        			.on('error', (err) => {
                			console.log(err);
                                        resultSet = 'ERROR';
					self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
        			});
               		//self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
		}
		catch (e) {
		console.error("Error obtaining data from API");
		console.error(e);
                var resultSet = 'Error obtaining data from API';
                self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
                self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
		}
        },

    sendImage: function(resultSet) {
	var self = this;
	self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
    },

    socketNotificationReceived: function(notification, payload) {
        //const config = payload.config;
        if (notification === "MMM_HIKVISIONMOTION_GET_MOTION") {
			try {
				this.config = payload;
				//console.log(this.config);
                        	this.checkMotion();
			}
			catch (e) {
				console.log("Error obtaining data from API");
				console.log(e);
				var resultSet = 'Error collecting usage data';	
				self.sendSocketNotification("MMM_HIKVISIONMOTION_RESULT_VALUES", resultSet,);
                                self.sendSocketNotification("MMM_HIKVISIONMOTION_ERROR", resultSet,);
			}
                }
    },
});
