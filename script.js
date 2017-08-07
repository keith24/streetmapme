'use strict';
/* global navigator $ */

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

// Track GPS location
if (!navigator.geolocation){ /* Show error */ }
else { navigator.geolocation.watchPosition(
		
		// Got location
		function(pos) {
			
			// Moving (show image)
			if (loc.spd>1) {
				
				// Create image
				const imgElem = document.getElementById('panoImg');
				if (!imgElem) {
					pano = undefined;
					$('#pano').empty();
					$('#pano').append($('<img>',{
						alt: 'Street view image',
						src: 'https://maps.googleapis.com/maps/api/streetview?size=800x800&location='+loc.lat+','+loc.lon+'&fov=90&heading='+loc.dir+'&key={{api}}',
						id: 'panoImg'
					}));
				}
				
				// Set image
				getStreetViewData(loc, 2, function(data){
					$('#panoImg').attr('src','https://maps.googleapis.com/maps/api/streetview?size='+$('#pano').width()+'x'+$('#pano').height()+'&location='+data.location.latLng.lat()+','+data.location.latLng.lng()+'&fov=90&heading='+loc.dir+'&key='+mapKey);
				});
				
			}
			
			// Not moving and pano not set (create panoramic image)
			else if (pano==null) {
				
				// Create panorama
				$('#pano').empty();
				pano = new googlemaps.StreetViewPanorama(panoElem, {
					panControl: false,
					zoomControl: false,
					addressControl: false,
					linksControl: false,
					motionTracking: false,
					motionTrackingControl: false
				});
				
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
			
		},
		
		// Got error
		function() {
			//TODO: Show error
		}, 
		
		// Options
		{ enableHighAccuracy:true }
		
	);
}