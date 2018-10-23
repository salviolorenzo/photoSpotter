// get photos by search ==>
// extract IDs ==>
// display to screen in scrollable gallery // 20 photos per search
// get location and meta data ==>
// when image is clicked ==> place point on map and display weather ==>
// show location info?

const galleryImage = document.querySelector('[data-image]');
const searchForm = document.querySelector('[data-form]');
const mapContainer = document.querySelector('[data-map]');
const weatherContainer = document.querySelector('[data-weather]');
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
            return statArray.slice(0, 20);
        });
}

// ======================================================
// handles submit, creates keyword search
// ======================================================

function handleSubmit(event) {
    event.preventDefault();
    console.log("Searching");
    let userSearch = event.target.elements.search.value;
    getPhotos(userSearch);
}
searchForm.addEventListener("submit", handleSubmit);


// ======================================================
// moves image sources into a new array, change image on key press
// ======================================================


function drawImages(array) {
    // let srcArray = [];
    // for (item of array) {
    //     srcArray.push(item.src);
    // }
    let index = 0;
    galleryImage.src = array[index].src;

    // console.log(array);
    // console.log(galleryImage.src);

    window.addEventListener('keydown', function (event) {
        if (event.keyCode === 39) {
            console.log('right');
            index += 1;
            if (index > array.length - 1) {
                index = 0;
            }
            galleryImage.src = array[index].src;

        }
        else if (event.keyCode === 37) {
            console.log('left');
            index -= 1;
            if (index < 0) {
                index = array.length - 1;
            }
            galleryImage.src = array[index].src;

        }
    })
    galleryImage.addEventListener('click', function () {
        let latitude = parseFloat(array[index].latitude);
        let longitude = parseFloat(array[index].longitude);
        addMarker(latitude, longitude);
        getWeather(parseFloat(latitude.toFixed(0)), parseFloat(longitude.toFixed(0)));
    });
    return array;
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
// retrieves images, calls functions to manipulate data and draw to screen
// ============================================================
function getPhotos(userSearch) {
    fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickKey}&text=${userSearch}&sort=interestingness-desc&privacy_filter=1&accuracy=16+&has_geo=1&format=json&nojsoncallback=1`)
        .then(r => r.json())
        .then(j => j.photos)
        .then(getPhotoStats)
        .then(locationsArray)
        .then(drawImages);
}

//==========================================================
// Maps API Functions
// ============================================================

let map;
function initMap() {
    let myLatLng = { 'lat': 0, 'lng': 0 };

    map = new google.maps.Map(mapContainer, {
        center: myLatLng,
        zoom: 2
    });

}

function addMarker(lat, long) {
    let marker = new google.maps.Marker({
        position: { 'lat': lat, 'lng': long },
        map: map
    })
    map.center = marker.position;
}

//==========================================================
// Weather API Functions
// ============================================================
function drawName(obj) {
    let cityName = document.createElement('h3');
    cityName.textContent = obj.name;
    weatherContainer.appendChild(cityName);
    return obj;
}

function drawTemp(obj) {
    let temperature = document.createElement('p');
    let temp = obj.main.temp;
    temp = ((temp - 273.15) * 9 / 5 + 32).toFixed(1);
    temperature.textContent = `Temperature: ${temp} °F`;
    weatherContainer.appendChild(temperature);
    return obj;
}

function weather(obj) {
    let weatherObj = obj.weather[0];
    let img = document.createElement('img');
    let iconID = weatherObj.icon;
    img.setAttribute('src', `http://openweathermap.org/img/w/${iconID}.png`)
    let weatherHeader = document.createElement('h6');
    weatherHeader.textContent = `${weatherObj.description}`;
    weatherContainer.appendChild(img);
    weatherContainer.appendChild(weatherHeader);
    return obj;
}


// ===============================================
// Draw all data 
// ===============================================
function getWeather(lat, long) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=${OWKey}`)
        .then(r => r.json())
        .then(drawName)
        .then(drawTemp)
        .then(weather);
}



