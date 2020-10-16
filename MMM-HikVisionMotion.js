Module.register("MMM-HikVisionMotion", {
    // Default module config
    defaults: {
        updateInterval: 1000 *60, // check health every seconds
        maxTimeout: 1000, // maximum timeout
        animationSpeed: 1000 * 0.25, // fade effect
        initialLoadDelay: 0, // first check delay
        imageLoadDelay: 3, // seconds delay
	imageFreshness: 300,
	imageHeight: '400px',
	imageWidth: '500px',
	healthTimeout: 120,
	host: '',
	port: 80,
	user: '',
	password: '',
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        const self = this;
	DisplayTime = Date.now();
	PrettyDisplayTime = Date(parseInt(DisplayTime));

        setTimeout(() => {
            self.getMotion();
            setInterval(() => {
                self.checkState();
                //self.updateDom();
            }, self.config.updateInterval); // Actual loop timing
        }, self.config.initialLoadDelay); // First delay
    },

    getDom: function() {
        const content = document.createElement("div");
        content.style = "display: flex;flex-direction: row;justify-content: space-between; align-items: center";

            var motionState = document.createElement("p");
            motionState.style = "text-align:left;font-size:0.65em;line-height:normal";
		
		DisplayComponents = this.readings
		if(typeof(DisplayComponents) != 'undefined') {
			DisplayMotion = DisplayComponents.split(':')[0];
			DisplayTime = DisplayComponents.split(':')[1];
			var PrettyDisplayTime = new Date(parseInt(DisplayTime));
			PrettyDisplayTime = String(PrettyDisplayTime).replace(/(?<=:\d\d)\s.*/, '');
			// Only update image URL if there is another event and a new image to display
			if(typeof(DisplayComponents.split(':')[2]) != 'undefined'){
				DisplayImage = DisplayComponents.split(':')[2];
				ImageDisplayTime = DisplayTime;
				//var PrettyImageDisplayTime = new Date(parseInt(ImageDisplayTime));
				//PrettyImageDisplayTime = String(PrettyImageDisplayTime).replace(/(?<=:\d\d)\s.*/, '');
			}
			motionState.innerHTML = DisplayMotion +': '+ PrettyDisplayTime;
			// Only try to display an image if one has been provided
			if(typeof(DisplayImage) != 'undefined'){
				if(((Date.now() - ImageDisplayTime)/1000) < this.config.imageFreshness) { //Only display images newer than imageFreshness value
					Log.info(ImageDisplayTime);
					Log.info(PrettyImageDisplayTime);
					//if(typeof(PrettyImageDisplayTimei) != 'undefined'){
					//	motionState.innerHTML = 'Motion detected at '+ PrettyImageDisplayTime;
					//}
					var PrettyImageDisplayTime = new Date(parseInt(ImageDisplayTime));
					PrettyImageDisplayTime = String(PrettyImageDisplayTime).replace(/(?<=:\d\d)\s.*/, '');
					motionState.innerHTML = 'Motion detected at '+ PrettyImageDisplayTime;
                			motionState.innerHTML += "<br><picture><img src='./modules/MMM-HikVisionMotion/"+DisplayImage+"' style='width:"+this.config.imageWidth+";height:"+this.config.imageHeight+";'></picture>"
				}
			}
			else {
			motionState.innerHTML = DisplayMotion +': '+ PrettyDisplayTime;
			}
		}
		else {
		motionState.innerHTML = "Trying to connect to camera feed";
		}

            content.appendChild(motionState);
        return content;
    },
    
    // Send socket notification, to start reading ONVIF stream
    getMotion: function() {
        this.sendSocketNotification('MMM_HIKVISIONMOTION_GET_MOTION', this.config);
    },



    // Send socket notification, to start pinging the server
    checkState: function() {
	if(((Date.now() - DisplayTime)/1000) > this.config.healthTimeout) { //If no updates from node_helper for more than healthTimeout limit then restart helper
		Log.info('Hik Health Timeout - '+ ((Date.now() - DisplayTime)/1000));
		this.sendSocketNotification('MMM_HIKVISIONMOTION_GET_MOTION', this.config);
	}
    },


    // Handle socket answer
    socketNotificationReceived: function(notification, payload) {
        if (notification === "MMM_HIKVISIONMOTION_RESULT_VALUES") {
            this.readings = payload;
	    //Log.info("node respond: " + payload);
            //this.updateDom(this.config.animationSpeed);
            this.updateDom();
        }
	if (notification === "MMM_HIKVISIONMOTION_ERROR") {
		this.readings = payload;
		Log.error("node helper error");
		Log.log(this.name + " received notification: " + notification + " - Payload: " + payload);
		//this.updateDom(this.config.animationSpeed);
		this.updateDom();
        }

    },
});
