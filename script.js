'use strict';
/* global $ navigator google */

var newLoc;

// Get street view imagery
function getStreetViewData(loc,rad,cb) {
	
	// Ensure that the location hasn't changed (or this is the initial setting)
	if ( newLoc == null || loc.tim===newLoc.tim ) {
		
		// Create service if it doesn't exist yet
		if (!sv) { var sv=new google.maps.StreetViewService(); }
		
		// Retrieve data
		sv.getPanorama({
			location: {
				lat: loc.lat,
				lng: loc.lon
			},
			radius: rad
		}, function(data,status){ switch (status){
			
			// Success
			case google.maps.StreetViewStatus.OK:
				cb(data);
				break;
				
			// No results in that radius
			case google.maps.StreetViewStatus.ZERO_RESULTS:
				// Try again with a bigger radius
				getStreetViewData(loc,rad*2,cb);
				break;
				
			// Error
			default:
				console.error(new Error(
					'❌️ Street view not available: '+status
				).message);
				
		} });
	}
}

// Update street view image
function updateStreetView(loc){
	
	// Calculate bearing between user and position of streetview image
	// https://stackoverflow.com/a/26609687/3006854
	function getBearing(userLoc, imageLoc) {
		return 90-(
			Math.atan2( userLoc.lat-imageLoc.latLng.lat(), userLoc.lon-imageLoc.latLng.lng() )
			* (180/Math.PI)	) % 360;
	}
	
	// Get dimensions for sv request (images proportional to element up to 640x640)
	function getDimensions(element) {
		
		// Window is smaller than max
		if ( element.width()<640 && element.height()<640 ){
			return element.width()+'x'+element.height();
		}
		
		// Width must be made proportional to 640
		else if (element.width()>element.height()) {
			return '640x'+element.height()*640/element.width();
		}
		
		// Height must be made proportional to 640
		else {
			return element.width()*640/element.height()+'x640';
		}
		
	}
	
	// Get streetview data
	getStreetViewData(loc, 2, function(data){
		console.log('https://maps.googleapis.com/maps/api/streetview?'+
			'size='+ getDimensions($(window)) +
			'&location='+ data.location.latLng.lat() +','+ data.location.latLng.lng() +
			'&fov=90' + // Inclination
			// Show direction if moving, point to user if stationary
			'&heading='+ ( (loc.spd>2)? loc.dir: getBearing(loc,data.location) ).toString() +
			'&key=AIzaSyAaDEDFAbk7Iefh9y61wuooDH2kWHRT_k8');
		
		// Set image to streetview
		$('main img').attr('src','https://maps.googleapis.com/maps/api/streetview?'+
			'size='+ $('main img').width() +'x'+ $('main img').height() +
			'&location='+ data.location.latLng.lat() +','+ data.location.latLng.lng() +
			'&fov=90' + // Inclination
			// Show direction if moving, point to user if stationary
			'&heading='+ ( (loc.spd>2)? loc.dir: getBearing(loc,data.location) ).toString() +
			'&key=AIzaSyAaDEDFAbk7Iefh9y61wuooDH2kWHRT_k8'
		);
		
	});
	
}

// Check for geolocation
if (!navigator.geolocation){
	alert("Geolocation not available!");
}

// Has geolocation
else {
	
	// Track geolocation
	navigator.geolocation.watchPosition(
		
		// Got location
		function(pos) {
			newLoc = {
				lat: pos.coords.latitude,
				lon: pos.coords.longitude,
				spd: pos.coords.speed,
				dir: pos.coords.heading,
				tim: new Date()
			};
			updateStreetView(newLoc,10);
		},
		
		// Got error
		function(err) {
			console.error(err.message);
			
			// Permission denied
			if (err.code==1) {
				alert("You can't use this app without granting permission to access your location");
			}
			
			// Location not available
			else if (err.code==2) {
				alert("Location data not available.");
			}
			
			// Timeout
			else if (err.code==3) {
				alert("Timed out trying to determine location.");
			}
			
			// Other error
			else {
				alert("An unknown error occured while trying to determine location.");
			}
			
		}, 
		
		// Options
		{ enableHighAccuracy:true }
		
	);
}
