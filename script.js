'use strict';
/* global navigator google */

var pano, newLoc;

// Create panorama
function init(){
	pano = new google.maps.StreetViewPanorama(
		document.getElementsByTagName('main')[0], {
			panControl: false,
			zoomControl: false,
			addressControl: false,
			linksControl: false,
			motionTracking: false,
			motionTrackingControl: false
		}
	);
}

// Get street view imagery
function getStreetViewData(loc,rad,cb) {
	// Ensure that the location hasn't changed (or this is the initial setting)
	if ( newLoc == null || loc.tim===newLoc.tim ) {
		if (!sv) { var sv=new google.maps.StreetViewService(); }
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
	
	// Panorama hasn't loaded
	if ( typeof pano == 'undefined' ){
		// Wait one second and try again
		setTimeout(updateStreetView(loc),1000);
	}
	
	// Panorma has loaded
	else {
		
		// Get streetview data
		getStreetViewData(loc, 2, function(data){
			
			// Calculate bearing
			var brng;
			
			if (loc.spd>1){
				brng = loc.dir;
			}
			else { //https://stackoverflow.com/a/26609687/3006854
				brng = Math.atan2( loc.lat-data.location.latLng.lat(), loc.lon-data.location.latLng.lng() );
				brng = 450-(brng*(180/Math.PI)+360)%360;
			}

			// Set panorama
			pano.setPano(data.location.pano);				
			pano.setPov({
				pitch: 0,
				heading: brng
			});
		});
		
	}
	
}

// Track GPS location
if (!navigator.geolocation){
	alert("Geolocation not available!");
}
else { navigator.geolocation.watchPosition(
		
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
		function() {
			//TODO: Show error
		}, 
		
		// Options
		{ enableHighAccuracy:true }
		
	);
}
