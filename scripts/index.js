const gallery = document.querySelector('[data-gallery]');
const galleryImage = document.querySelector('[data-image]');
const largeGallery = document.querySelector('[data-large-gallery]');
const searchForm = document.querySelector('[data-form]');
const mapWeather = document.querySelector('[data-map-weather]');
const mapContainer = document.querySelector('[data-map]');
const weatherContainer = document.querySelector('[data-weather]');
const infoContainer = document.querySelector('[data-info-container]');
const contact = document.querySelector('[data-contacts]');
const Links = document.querySelector('[data-link-list]');
const triggerElement = document.querySelector('[data-trigger]');
const inputBox = document.querySelector('[data-input]');
const searchButton = document.querySelector('[data-submit]');
const select = document.querySelector('[data-select]');
const timeSection = document.querySelector('[data-time]')
// ========================
// Opening button
// ========================

triggerElement.addEventListener('click', function () {
    triggerElement.classList.add('hide-button');
    inputBox.classList.remove('textbox-hidden');
    searchButton.classList.remove('hide-button');
    select.classList.remove('select-hide');
})

// ========================================
//returns array of image promises
// ========================================

function getLocation(object) {
    return fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&api_key=${flickKey}&photo_id=${object.id}&format=json&nojsoncallback=1`)
        .then(r => r.json())
        .then(k => k.photo.location);
}

// =====================================================
// gets images and assigns locations 
// =====================================================

function getPhotoStats(obj) {
    let imagesArray = obj.photo;
    let statArray = [];
    let locationPromises = [];
    for (image of imagesArray) {
        let imageObj = {
            'id': image.id,
            'src': `https://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg`
        };
        let locationPromise = getLocation(image);
        locationPromises.push(locationPromise);
        statArray.push(imageObj);
    }
    return Promise.all(locationPromises)
        .then(locationArray => {
            locationArray.forEach(function (location, index) {
                statArray[index]['location'] = location;
            });
            // console.log(statArray.slice(0, 20));
            return statArray.slice(0, 50);
        });
}

// ==================================================
// Extracts lat and long attributes from location
// ==================================================

function locationsArray(array) {
    for (item of array) {
        item.latitude = item.location.latitude;
        item.longitude = item.location.longitude;
        delete item.location;
    }
    return array;
}

//==========================================================
// Maps API Functions
// ============================================================

// Initial map settings
let map;
function initMap() {
    let myLatLng = { 'lat': 20, 'lng': 7 };

    map = new google.maps.Map(mapContainer, {
        center: myLatLng,
        zoom: 1
    });

}

// function to create markers for individual images
let markerArray = [];
function addMarker(lat, long) {
    let marker = new google.maps.Marker({
        position: { 'lat': lat, 'lng': long },
    });
    if (markerArray.length === 0) {
        markerArray.push(marker);
    }
    else if (markerArray.length > 0) {
        markerArray[0].setMap(null);
        markerArray.shift();
        markerArray.push(marker);
        console.log()
    }
    markerArray[0].setMap(map);
}

//==========================================================
// Weather API Functions
// ============================================================

// get name from the returned object of the Promise
function drawName(obj) {
    let cityName;
    cityName = document.createElement('h3');
    cityName.textContent = `${obj.name}, ${obj.sys.country}`;
    return cityName
}

// get temperature from same object
function drawTemp(obj) {
    let temperature = document.createElement('p');
    let temp = obj.main.temp;
    temp = ((temp - 273.15) * 9 / 5 + 32).toFixed(1);
    temperature.textContent = `Temperature: ${temp} °F`;
    return temperature;
}

// get cloudiness percentage
function getClouds(obj) {
    let clouds = obj.clouds.all
    const cloud = document.createElement('p');
    cloud.textContent = `Cloudiness: ${clouds} %.`
    return cloud;
}

// description of weather returned is lower case, this capitalizes the returned phrase
function capitalize(string) {
    arr = string.split(' ');
    for (item of arr) {
        let index = arr.indexOf(item);
        let first = item.charAt(0).toUpperCase();
        item = first + item.slice(1);
        arr[index] = item;
    }
    return arr.join(' ');
}

// puts all the weather data together in a single div, appends div to its container
function weather(obj) {
    if (weatherContainer.hasChildNodes()) {
        weatherContainer.removeChild(weatherContainer.firstChild);
    }
    let currentDiv = document.createElement('div');
    let weatherObj = obj.weather[0];
    let iconID = weatherObj.icon;
    let img = document.createElement('img');
    let h3 = document.createElement('h3');
    h3.textContent = `Today's Weather: `
    let weatherHeader = document.createElement('h3');
    img.setAttribute('src', `http://openweathermap.org/img/w/${iconID}.png`);
    weatherHeader.textContent = `${capitalize(weatherObj.description)}`;
    currentDiv.appendChild(h3);
    currentDiv.appendChild(drawName(obj));
    currentDiv.appendChild(img);
    currentDiv.appendChild(weatherHeader);
    currentDiv.appendChild(drawTemp(obj));
    currentDiv.appendChild(getClouds(obj));
    weatherContainer.classList.remove('weather-hidden');
    mapContainer.classList.add('map-container-half');
    weatherContainer.appendChild(currentDiv);
    return obj;
}

// ===============================================
// Draw all weather data data 
// ===============================================
function getWeather(lat, long) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=${OWKey}`)
        .then(r => r.json())
        .then(weather);
}

// ======================================================
// handles submit, creates keyword search
// ======================================================

function handleSubmit(event) {
    event.preventDefault();
    console.log("Searching");
    let userSearch = event.target.elements.search.value;
    getPhotos(userSearch);
    largeGallery.scrollIntoView({
        behavior: "smooth"
    });
}
searchForm.addEventListener("submit", handleSubmit);

// =======================================================
// IMAGES INFORMATION
// =======================================================


// =======================================================
// extract time and camera type
// ======================================================
function getExif(object) {
    let exifObject;
    if (object !== undefined) {
        const array = object.exif;
        let time;
        let camera;
        for (item of array) {
            if (item.tag === 'Model') {
                camera = item.raw._content;
            }
            else if (item.tag === 'DateTimeOriginal') {
                time = item.raw._content;
                time = time.split(' ').join(' // ')
            }
            else {
                continue;
            }
        }
        exifObject = {
            'time': time,
            'camera': camera
        };
    }
    else {
        exifObject = "Metadata not available.";
    }
    return exifObject;
}

// =======================================================
// draw time and camera type to screen
// ======================================================
function drawInfo(object) {

    if (infoContainer.hasChildNodes()) {
        infoContainer.removeChild(infoContainer.firstChild);
    }
    if (object !== "Metadata not available.") {
        const infoList = document.createElement('ul');
        let item1 = document.createElement('li');
        let item2 = document.createElement('li');
        item1.textContent = `Date/Time of Photo: ${object.time}`;
        item2.textContent = `Camera: ${object.camera}`;
        infoList.appendChild(item1);
        infoList.appendChild(item2);
        infoContainer.appendChild(infoList);
        const infoList = document.createElement('ul');
        let item1 = document.createElement('li');
        item1.textContent = object;
        infoList.appendChild(item1);
        infoContainer.appendChild(infoList);
    }
}

// =======================================================
// get photo information
// =======================================================
function getInfo(object) {
    fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.getExif&api_key=${flickKey}&format=json&nojsoncallback=1&photo_id=${object.id}`)
        .then(r => r.json())
        .then(j => j.photo)
        .then(getExif)
        .then(drawInfo);
}

// =======================================================
// get local time
// =======================================================

function getTime(object) {
    if (timeSection.hasChildNodes()) {
        timeSection.removeChild(timeSection.firstChild);
    }
    let dateTime = object.formatted;
    let dateTimeArr = dateTime.split(' ');
    let time = dateTimeArr[1];
    if (time === undefined) {
        time = 'Local time not available.';
    }
    let timeBox = document.createElement('p');
    timeBox.textContent = `Local time: ${time}`;
    timeSection.appendChild(timeBox);
}

function getLocalTime(lat, long) {
    fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${tzDBKey}&format=json&by=position&lat=${lat}&lng=${long}`)
        .then(r => r.json())
        .then(getTime);
}

// ========================================================
// draw large gallery
// ========================================================

function drawLargeGallery(array) {
    if (largeGallery.hasChildNodes()) {
        largeGallery.removeChild(largeGallery.firstChild);
    }
    array = array.slice(0, select.value);
    const imgArray = [];
    let container = document.createElement('div');
    container.classList.add('tile-container');
    largeGallery.appendChild(container);
    for (image of array) {
        let img = document.createElement('img');
        img.setAttribute('src', image.src);
        img.classList.add('gallery-tiles');
        imgArray.push(img);
        container.appendChild(img);
    }
    // adds clickable functionality to display image data
    for (image of imgArray) {
        image.addEventListener('click', function (event) {
            let index = imgArray.indexOf(event.target);
            let latitude = parseFloat(array[index].latitude);
            let longitude = parseFloat(array[index].longitude);
            addMarker(latitude, longitude);
            getWeather(Math.round(latitude), Math.round(longitude));
            getLocalTime(Math.round(latitude), Math.round(longitude));
            getInfo(array[index]);

            mapContainer.scrollIntoView({
                behavior: "smooth"
            });
        })
    }
    mapWeather.classList.remove('map-hidden');

    return array;
}

//==========================================================
// retrieves images, calls functions to manipulate data and draw to screen
// ============================================================
function getPhotos(userSearch) {
    fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickKey}&text=${userSearch}&sort=interestingness-desc&privacy_filter=1&accuracy=16+&has_geo=1&format=json&nojsoncallback=1`)
        .then(r => r.json())
        .then(j => j.photos)
        .then(getPhotoStats)
        .then(locationsArray)
        // .then(drawImages)
        .then(drawLargeGallery);
    // .then(drawImages);
}