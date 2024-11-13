const url = `http://localhost:8081/server/return_all`
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
        // Do something with the JSON data
        console.log(data);

    })



successfulOptions = {
    key: 'user_role',
}
const successfulQueryParams = Object.keys(successfulOptions)
    .map(key => `${key}=${encodeURIComponent(successfulOptions[key])}`)
    .join('&');

const successfulUrl = `http://localhost:8081/server/return_current?${successfulQueryParams}`;

fetch(successfulUrl)
    .then((response) => {
        // Handle the response here
        if (response.ok) {
            return response.json(); // Parse the JSON response
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then((data) => {
        // Do something with the JSON data
        console.log(data);

    })

console.log("hello")
let group_name_user = "group1"

    options_group = {
        group_name: group_name_user,
    }

    const queryParams_group = Object.keys(options_group)
    .map(key => `${key}=${encodeURIComponent(options_group[key])}`)
    .join('&');

    const url_group = `http://localhost:8081/server/display_member?${queryParams_group}`;
    fetch(url_group)
    .then((response) => {
        // Handle the response here
        if (response.ok) {
            return response.json(); // Parse the JSON response
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then((data) => {
        if (data){
            console.log(data)

        }

    })
    .catch((error) => {
        // Handle errors here
        console.error('Fetch error:', error);
    });





    