# Module: Motion Display

A module for the MagicMirror that displays an image of the last motion detected by an IP camera. This module reiles on basic ONVIF capabilities from a camera and also uses the motion detection and alerting capabilities of the camera.
This module just detects the motion evet and grabs the image for display. 
Currently the image is displayed for a hard coded 5 minutes before being removed.
This module is in BETA and a bunch of improvements are required but its functional. 

# Installation
Navigate into your MagicMirror's ~/MagicMirror/modules folder and execute git clone https://github.com/pjestico/MMM-MotionDisplay.git
A new folder will be created, please navigate into it.
Run npm install in ~/MagicMirror/modules/MMM-MotionDisplay to install the module and dependencies.

# Using the module
To use this module, add it to the modules array in the config/config.js file:
```
var config = {
    modules: [
        {
            module: 'MMM-MotionDisplay',
            position: 'lower_third',
            config: {
                host: 'IP ADDRESS OR NAME',
                port: '80',
                user: 'USERNAME',
                password: 'PASSWORD',
            },
        }
    ]
}
```
* host = The IP address or resolvable hostname of your camera
* port = The TCP port your camera has its ONVIF listener on. Often this is 80 or 8080
* user = Username to access the camera.
* password = Password for the above user.

# Suggestions
Please feel free to raise an issue on GitHub for any features you would like to see or usage issues you experience and I will endeavour to address them however time has been short for me of late so code contributions will be much appreciated and acknowledged.
