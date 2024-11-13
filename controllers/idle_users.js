// Author: Connor Macdougall
// Begins as soon as the webpage has loaded in, and logs out idle users
// Also, website theme (the background colour) can be selected and refreshed

let idleTime;
let IDLE_TIME_LIMIT = 60; // in seconds

let MIN_ZOOM_VALUE = 80;
let MAX_ZOOM_VALUE = 150;
let ZOOM_INCREMENT = 10;
let INITIAL_ZOOM = 100;
let BUTTON_HEIGHT = 60;
let BUTTON_WIDTH = 250;

colour_dict = {
    'cyan': 'rgb(195, 255, 255)',
    'pink': 'rgb(255, 200, 245)',
    'grey': 'rgb(200, 200, 200)'
}

// initialises functions on window loading
function initUserIdle() {
    this.addEventListener("onload", InitialiseWebpage, false);
    this.addEventListener("mousemove", ResetIdleTime, false);
    this.addEventListener("mousedown", ResetIdleTime, false);
    this.addEventListener("keypress", ResetIdleTime, false);
    this.addEventListener("DOMMouseScroll", ResetIdleTime, false);
    this.addEventListener("mousewheel", ResetIdleTime, false);
    this.addEventListener("touchmove", ResetIdleTime, false);
    this.addEventListener("MSPointerMove", ResetIdleTime, false);
}

// resets idle timer to 0, which will log out the current user for being inactive after IDLE_TIME_LIMT seconds
function ResetIdleTime() {
    clearTimeout(idleTime);
    idleTime = setTimeout(removeUser, IDLE_TIME_LIMIT * 1000, "You have been logged out due to idle activity (Idle time limit is " + IDLE_TIME_LIMIT + " seconds)");
}

function InitialiseWebpage() {
    ResetIdleTime();
    updateTheme();
    updateZoom();
}

// Logs out the current user, displaying the message as an explanation why
function removeUser(message) {
    successfulOptions = {
        key: 'user',
        value: null,
    }
    const successfulQueryParams = Object.keys(successfulOptions)
        .map(key => `${key}=${encodeURIComponent(successfulOptions[key])}`)
        .join('&');

    const successfulUrl = `http://localhost:8081/server/update_current_info?${successfulQueryParams}`;
    fetch(successfulUrl).then(() => alert(message));
    location.href = "/login";
}

// For selection of the background colour
function chooseTheme(colour) {
    colourOptions = {
        key: 'colour',
        value: colour,
    }
    const colourQueryParams = Object.keys(colourOptions)
        .map(key => `${key}=${encodeURIComponent(colourOptions[key])}`)
        .join('&');
    
    const colourUrl = `http://localhost:8081/server/update_current_info?${colourQueryParams}`;
    fetch(colourUrl).then(updateTheme);
}

// To update the background colour of the webpage to the selected one
function updateTheme() {
    options = {
        key: 'colour',
    }
    const queryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');

    const url = `http://localhost:8081/server/return_current?${queryParams}`;
    fetch(url)
        .then((response) => {
            // Handle the response here
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then((data) => {
            if (data == "NOT FOUND") {
                colourOptions = {
                    key: 'colour',
                    value: 'grey',
                }
                const colourQueryParams = Object.keys(colourOptions)
                    .map(key => `${key}=${encodeURIComponent(colourOptions[key])}`)
                    .join('&');
                
                const colourUrl = `http://localhost:8081/server/add_current_info?${colourQueryParams}`;
                fetch(colourUrl).then(updateTheme);
            } else {
                document.body.style.backgroundColor = colour_dict[data.value];
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}

// updates the zoom value, depending on the operator ("+"/"-")
function chooseZoom(operator) {
    options = {
        key: 'zoom',
    }
    const queryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');

    const url = `http://localhost:8081/server/return_current?${queryParams}`;
    fetch(url)
        .then((response) => {
            // Handle the response here
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then((data) => {
            if (data == "NOT FOUND") {
                console.log("Zoom Retrieval Error 404")
            } else {
                if (operator == "+" && +data.value < MAX_ZOOM_VALUE) {
                    updated_zoom = Math.min(+data.value + ZOOM_INCREMENT, MAX_ZOOM_VALUE);
                } else if (operator == "-" && +data.value > MIN_ZOOM_VALUE) {
                    updated_zoom = Math.max(+data.value - ZOOM_INCREMENT, MIN_ZOOM_VALUE);
                }
                zoomOptions = {
                    key: 'zoom',
                    value: updated_zoom,
                }
                const zoomQueryParams = Object.keys(zoomOptions)
                    .map(key => `${key}=${encodeURIComponent(zoomOptions[key])}`)
                    .join('&');
                
                const zoomUrl = `http://localhost:8081/server/update_current_info?${zoomQueryParams}`;
                fetch(zoomUrl).then(updateZoom);
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}

// updates the zoom by finding the current zoom value in the database and adding it if there is not currently a value already
function updateZoom() {
    options = {
        key: 'zoom',
    }
    const queryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');

    const url = `http://localhost:8081/server/return_current?${queryParams}`;
    fetch(url)
        .then((response) => {
            // Handle the response here
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then((data) => {
            if (data == "NOT FOUND") {
                zoomOptions = {
                    key: 'zoom',
                    value: INITIAL_ZOOM,
                }
                const zoomQueryParams = Object.keys(zoomOptions)
                    .map(key => `${key}=${encodeURIComponent(zoomOptions[key])}`)
                    .join('&');
                
                const zoomUrl = `http://localhost:8081/server/add_current_info?${zoomQueryParams}`;
                fetch(zoomUrl).then(updateZoom);
            } else {
                document.body.style.zoom = `${+data.value}%`;
                document.getElementById("btn-zoom-in").style.backgroundColor = "black";
                document.getElementById("btn-zoom-in").style.height = `${Math.round(BUTTON_HEIGHT*100/(+data.value))}px`;
                document.getElementById("btn-zoom-in").style.width = `${Math.round(BUTTON_WIDTH*100/(+data.value))}px`;
                document.getElementById("btn-zoom-out").style.backgroundColor = 'grey';
                document.getElementById("btn-zoom-out").style.height = `${Math.round(BUTTON_HEIGHT*100/(+data.value))}px`;
                document.getElementById("btn-zoom-out").style.width = `${Math.round(BUTTON_WIDTH*100/(+data.value))}px`;
                if (+data.value == MAX_ZOOM_VALUE) {
                    document.getElementById("btn-zoom-in").style.backgroundColor = "red";
                } else if (+data.value == MIN_ZOOM_VALUE) {
                    document.getElementById("btn-zoom-out").style.backgroundColor = "red";
                }
                
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}

// Displays the selected settings category
function show_settings(card_id) {
    for (card of document.getElementsByClassName('card')) {
        card.style.display = 'none';
    }
    document.getElementById(card_id).style.display = 'block';
}

initUserIdle();
InitialiseWebpage();