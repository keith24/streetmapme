'use strict';
/* global navigator $ */

// Track GPS location
if (!navigator.geolocation){ $('#no-gps').show(); }
else { navigator.geolocation.watchPosition(
		
		// Got location
		function(pos) {
			
		},
		
		// Got error
		function() {
			//TODO: Show error
		}, 
		
		// Options
		{ enableHighAccuracy:true }
		
	);
}