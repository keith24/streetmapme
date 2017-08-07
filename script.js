'use strict';
/* global navigator googlemaps $ */

var pano, newLoc;
const main = document.getElementsByTagName('main')[0];

// Create panorama
function init(){
	pano = new googlemaps.StreetViewPanorama(main, {
		panControl: false,
		zoomControl: false,
		addressControl: false,
		linksControl: false,
		motionTracking: false,
		motionTrackingControl: false
	});
}

// Get street view imagery
function getStreetViewData(loc,rad,cb) {
	// Ensure that the location hasn't changed (or this is the initial setting)
	if ( newLoc == null || loc.tim===newLoc.tim ) {
		if (!sv) { var sv=new googlemaps.StreetViewService(); }
		sv.getPanorama({
			location: {
				lat: loc.lat,
				lng: loc.lon
			},
			radius: rad
		}, function(data,status){ switch (status){
			// Success
			case googlemaps.StreetViewStatus.OK:
				cb(data);
				break;
			// No results in that radius
			case googlemaps.StreetViewStatus.ZERO_RESULTS:
				// Try again with a bigger radius
				getStreetViewData(loc,rad*2,cb);
				break;
			// Error
			default:
				console.error(new Error('❌️ Street view not available: '+status).message);
		} });
	}
}

// Update street view image
function updateStreetView(loc){
	
	// Wait for panorama
	if ( typeof pano != 'undefined' ){
		
		// Set panorama
		getStreetViewData(loc, 2, function(data){
			pano.setPano(data.location.pano);							
			pano.setPov({
				pitch: 0,
				// Point towards users's location from street
				heading: Math.atan((loc.lon-data.location.latLng.lng())/(loc.lat-data.location.latLng.lat()))*(180/Math.PI)
			});
		});
		
	}
	
}

// Track GPS location
if (!navigator.geolocation){ /* Show error */ }
else { navigator.geolocation.watchPosition(
		
		// Got location
		function(pos) {
			newLoc = {
				lat: pos.coords.latitude,
				lon: pos.coords.longitude,
				tim: new Date()
			};
			updateStreetView(newLoc,10);
		},
		
		// Got error
		function() {
			//TODO: Show error
		}, 
		
		// Options
		{ enableHighAccuracy:true }
		
	);
}
