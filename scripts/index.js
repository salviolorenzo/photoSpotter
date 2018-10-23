// get photos by search ==>
// extract IDs ==>
// display to screen in scrollable gallery // 20 photos per search
// get location and meta data ==>
// when image is clicked ==> place point on map and display weather ==>
// show location info?

const galleryImage = document.querySelector('[data-image]');
const searchForm = document.querySelector('[data-form]');
const mapContainer = document.querySelector('[data-map]');
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

    console.log(array);
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
    return array;
}


function locationsArray(array) {
    for (item of array) {
        item.latitude = item.location.latitude;
        item.longitude = item.location.longitude;
        delete item.location;
    }
    return array;
}

// ========================================================
// gets location for each item to be passed to marker
// ========================================================
// function getOne(item) {
//     object = item;
//     return object;
// }

// let item = {
//     'latitude': 33,
//     'longitude': -84
// }

function OneLocation(item) {
    let locationObj = {
        'lat': item.latitude,
        'lng': item.longitude
    }
    return locationObj;
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
    let myLatLng = { 'lat': 33.5, 'lng': -84.5 };

    map = new google.maps.Map(mapContainer, {
        center: myLatLng,
        zoom: 7
    });

}

function addMarker(coords) {
    let marker = new google.maps.Marker({
        position: coords,
        map: map
    })
    map.center = marker.position;
}





