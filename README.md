# Streetmap.me
###### by [Keith Irwin](https://keithirwin.us/)

Streetmap.me) is a web app written in plain HTML/CSS/JS.  It uses [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation) and [google street view](https://developers.google.com/maps/documentation/javascript/streetview) to show a panoramic image of your current location.  

## Instructions

Open [streetmap.me](https://streetmap.me/).  Grant location permission to the website.  After a few moments, you should see an image of your location.  

### Moving or not

If you're stationary, the image will be of the street nearest to your location, and the orientation will be pointed in your direction.  If you're in a building, the image should show the building from the street.  You can pan around, but the image will snap back to the building when the location updates.  

If you're moving, the image will show the closest street and will be oriented in the direction of travel.  When driving down the road, this produces an effect like a low framerate dashcam.  
