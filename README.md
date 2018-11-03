# PhotoSpotter            

![alt text](images/photospotterlogo-small.png)

- An interactive Web App that gives users the power to recreate their favorite pictures by giving them the location, time and camera information of the image, as well as local weather. The user can input the subject they would like to photograph and instantly be transported to a gallery of their specified interest. With one  click of an image, the user will immediately receive all the necessary information to create a similar photo.

### Authors
- Lorenzo Salvio 
- Amelia Schulz

### Technologies Used:
 - HTML5, CSS3, CSS Flexbox, JavaScript
 
### APIs Used: 
 - Flickr API 
    - Keyword search and populating gallery
    - Image location and metadata (when available).
 - Google Maps API
    - Plotting locations based on coordinates received from Flickr.
 - OpenWeather API
    - Getting local weather information.
 - TimeZoneDB API 
    - Getting local time for each location.

[Demo Page](http://ec2-18-191-246-225.us-east-2.compute.amazonaws.com/)

## Landing Page
![alt text](images/iphoneScreenshot.png)
![alt text](images/desktopLanding.png)
## Gallery
![alt text](images/mobilegallery.png)
![alt text](images/desktopGallery.png)
## Map
![alt text](images/mobileMap.png)
![alt text](images/DesktopMap.png)
## Weather
![alt text](images/mobileweather.png)
![alt text](images/DesktopWeather.png)


### Obstacles

- Extracting and assigning data to each individual image
- Refactoring the UI to be more user friendly 
- Learning to use the Maps API with data from other APIs.



### Future Additions
- Add metadata such as camera shutterspeed and aperture for more advanced photographers.
- Google maps with directions to direct users to their photo location.
- Ability to host users' personal accounts.
- Give users ability to upload and tag their own images.
- Add links/interactivity with local community for each image.
