let current_user = "";

function login() {
    // Retrieving the password and username that the user entered.
    let username_user = document.getElementById("username").value;
    let password_user = document.getElementById("password").value;

    options = {
        table_name: 'users',
        username: username_user,
    }
    const queryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');

    const url = `http://localhost:8081/server/return_user?${queryParams}`;
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
                console.log("Problem1");
                document.getElementById("password").classList.add("is-invalid")
                document.getElementById("username").classList.add("is-invalid")
            } else if (data.password == password_user) {
                document.getElementById("password").classList.remove("is-invalid")
                document.getElementById("username").classList.remove("is-invalid")
                document.getElementById("password").classList.add("is-valid")
                document.getElementById("username").classList.add("is-valid")
                successfulOptions = {
                    key: 'user',
                    value: username_user,
                }
                const successfulQueryParams = Object.keys(successfulOptions)
                    .map(key => `${key}=${encodeURIComponent(successfulOptions[key])}`)
                    .join('&');
            
                const successfulUrl = `http://localhost:8081/server/update_current_info?${successfulQueryParams}`;
                fetch(successfulUrl)
                successfulOptions1 = {
                    key: 'user_role',
                    value: data.role,
                }
                const successfulQueryParams1 = Object.keys(successfulOptions1)
                    .map(key => `${key}=${encodeURIComponent(successfulOptions1[key])}`)
                    .join('&');
            
                const successfulUrl1 = `http://localhost:8081/server/update_current_info?${successfulQueryParams1}`;
                fetch(successfulUrl1)
                alert("Login Successful");
                window.location.href = "/board";
            } else if (data.password != password_user) {
                console.log(data.password)
                console.log("Problem2");
                document.getElementById("password").classList.add("is-invalid")
                document.getElementById("username").classList.add("is-invalid")
            }

        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });

}

function SignUpCheck(){
    is_valid = true;
    if(document.getElementById("signUpFirstName").value == ""){
        document.getElementById("signUpFirstName").classList.add("is-invalid");
        document.getElementById("signUpFirstName").classList.remove("is-valid");
        document.getElementById("signUpFirstName").placeholder = "First Name Required";
        is_valid = false;
    }
    else{
        document.getElementById("signUpFirstName").classList.remove("is-invalid");
    }
    if(document.getElementById("signUpLastName").value == ""){
        document.getElementById("signUpLastName").classList.add("is-invalid");
        document.getElementById("signUpLastName").classList.remove("is-valid");
        document.getElementById("signUpLastName").placeholder = "Last Name Required";
        is_valid = false;
    }
    else{
        document.getElementById("signUpLastName").classList.remove("is-invalid");
    }
    if(document.getElementById("signUpEmail").value == ""){
        document.getElementById("signUpEmail").classList.add("is-invalid");
        document.getElementById("signUpEmail").classList.remove("is-valid");
        document.getElementById("signUpEmail").placeholder = "Email Required";
        is_valid = false;
    }
    else{
        document.getElementById("signUpEmail").classList.remove("is-invalid");
    }
    if(document.getElementById("signUpPassword").value == ""){
        document.getElementById("signUpPassword").classList.add("is-invalid");
        document.getElementById("signUpPassword").classList.remove("is-valid");
        document.getElementById("signUpPassword").placeholder = "Password Required";
        is_valid = false;
    }
    else{
        document.getElementById("signUpPassword").classList.remove("is-invalid");
    }
    if(document.getElementById("signUpUsername").value == ""){
        document.getElementById("signUpUsername").classList.add("is-invalid");
        document.getElementById("signUpUsername").classList.remove("is-valid");
        document.getElementById("signUpUsername").placeholder = "Username Required";
        is_valid = false;
    }
    else{
        username_user = document.getElementById("signUpUsername").value;
        options = {
            table_name: 'users',
            username: username_user,
        }
        const queryParams = Object.keys(options)
            .map(key => `${key}=${encodeURIComponent(options[key])}`)
            .join('&');
    
        const url = `http://localhost:8081/server/return_user?${queryParams}`;
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
                    document.getElementById("signUpUsername").classList.remove("is-invalid");
                    if(is_valid){
                        options_add = {
                            table_name: 'users',
                            username: document.getElementById("signUpUsername").value,
                            first_name: document.getElementById("signUpFirstName").value,
                            last_name: document.getElementById("signUpLastName").value,
                            email: document.getElementById("signUpEmail").value,
                            password: document.getElementById("signUpPassword").value,
                            role: "user",
                        }
                        console.log("PASS")
                        console.log(options_add)
                        const queryParams_add = Object.keys(options_add)
                                .map(key => `${key}=${encodeURIComponent(options_add[key])}`)
                                .join('&');
                        
                        const url_add = `http://localhost:8081/server/add?${queryParams_add}`;
                        fetch(url_add)
                                .then((response) => {
                                    // Handle the response here
                                    if (response.ok) {
                                        return response.json(); // Parse the JSON response
                                    } else {
                                        throw new Error('Network response was not ok');
                                    }
                                })
                                .then((data) => {
                                    console.log("Added");
                                })
                        successfulOptions = {
                            key: 'user',
                            value: document.getElementById("signUpUsername").value,
                        }
                        const successfulQueryParams = Object.keys(successfulOptions)
                            .map(key => `${key}=${encodeURIComponent(successfulOptions[key])}`)
                            .join('&');
                    
                        const successfulUrl = `http://localhost:8081/server/update_current_info?${successfulQueryParams}`;
                        fetch(successfulUrl)
                        successfulOptions1 = {
                            key: 'user_role',
                            value: "user",
                        }
                        const successfulQueryParams1 = Object.keys(successfulOptions1)
                            .map(key => `${key}=${encodeURIComponent(successfulOptions1[key])}`)
                            .join('&');
                    
                        const successfulUrl1 = `http://localhost:8081/server/update_current_info?${successfulQueryParams1}`;
                        fetch(successfulUrl1)
                        document.getElementById("signUpFirstName").value = "";
                        document.getElementById("signUpLastName").value = "";
                        document.getElementById("signUpUsername").value = "";
                        document.getElementById("signUpEmail").value = "";
                        document.getElementById("signUpPassword").value = "";
                        document.getElementById("modalCloseButton").click();
                        window.location.href = "/board";
                    }
                }
                else{
                    document.getElementById("signUpUsername").classList.add("is-invalid");
                    document.getElementById("signUpUsername").classList.remove("is-valid");
                    document.getElementById("signUpUsername").value = "";
                    document.getElementById("signUpUsername").placeholder = "Username Taken";
                    is_valid = false;
                }
            })
        }

    
    

    
}



//     // Checking if the username is present in the data storage
//     if(username in user_info){
//         //Checking if the password is right
//         if(user_info[username]["password"] == password){
//             alert("Login Successful");
//             window.location.href = "/board";
//         }
//         else{
//             document.getElementById("password").classList.add("is-invalid")
//             document.getElementById("username").classList.add("is-invalid")
//
//         }
//     }
//     else{
//         document.getElementById("username").classList.add("is-invalid")
//         document.getElementById("password").classList.add("is-invalid")
//     }
// }

// Author: Connor Macdougall
// Used for gaining access to change password on settings page
function confirm_current_password() {
    let current_password = document.getElementById("current-password-input").value

    options = {
        key: 'user',
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
                console.log("Problem!");
            } else {
                current_user = data.value;
                options = {
                    table_name: 'users',
                    username: data.value,
                }
                const passwordQueryParams = Object.keys(options)
                    .map(key => `${key}=${encodeURIComponent(options[key])}`)
                    .join('&');
            
                const url = `http://localhost:8081/server/return_user?${passwordQueryParams}`;
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
                            console.log("You have no password");
                        } else if (data.password == current_password) {
                            document.getElementById("new-password").classList.remove("hidden")
                        } else if (data.password != current_password) {
                            alert("Incorrect Password");
                            document.getElementById("new-password").classList.add("hidden")
                        }
            
                    })
                    .catch((error) => {
                        // Handle errors here
                        console.error('Fetch error:', error);
                    });
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}

// Author: Connor Macdougall
// Used for changing password on settings page
function change_password() {
    let new_password = document.getElementById("new-password-input").value

    options = {
        table_name: 'users',
        username: current_user,
    }
    const passwordQueryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');

    const url = `http://localhost:8081/server/return_user?${passwordQueryParams}`;
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
            if(new_password.length < 4 || new_password == data.password) {
                alert("Password must be four characters or longer and can not be the same password")
                document.getElementById("new-password-input").value = null
            } 
            // A valid new password is entered
            else {
                userOptions = {
                    table_name: 'users',
                    username: current_user,
                    what_to_update: 'password',
                    new_val: new_password,
                }
                const userQueryParams = Object.keys(userOptions)
                    .map(key => `${key}=${encodeURIComponent(userOptions[key])}`)
                    .join('&');
                
                const url = `http://localhost:8081/server/update?${userQueryParams}`;
                fetch(url)
                document.getElementById("new-password-input").value = null
                document.getElementById("current-password-input").value = null
                document.getElementById("new-password").classList.add("hidden")
                alert("Password successfully changed")
            } 
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}


function promote_username(){
    let username_to_promote = document.getElementById("promote-username").value;

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
            console.log(data)
            if(data.value == "user"){
                console.log("here")
                document.getElementById("promote-username").classList.add("is-invalid")
                document.getElementById("promote-username").classList.remove("is-valid")
                document.getElementById("promote-username").value = ""
                document.getElementById("promote-username").placeholder = "Only Scrum Masters can promote users"
                return 
            }
            else{
                options = {
                    table_name: 'users',
                    username: username_to_promote,
                }
                const queryParams = Object.keys(options)
                    .map(key => `${key}=${encodeURIComponent(options[key])}`)
                    .join('&');
            
                const url = `http://localhost:8081/server/return_user?${queryParams}`;
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
                            console.log("Problem1");
                            document.getElementById("promote-username").classList.add("is-invalid")
                            document.getElementById("promote-username").classList.remove("is-valid")
                            document.getElementById("promote-username").value = ""
                            document.getElementById("promote-username").placeholder = "Username not found"
                        } else {

                            let group_name_user = data.group_name

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
                                    updated = false
                                    for (const person of data){
                                        if (person.username == username_to_promote){
                                            document.getElementById("promote-username").classList.remove("is-invalid")
                                            document.getElementById("promote-username").classList.add("is-valid")
                                            document.getElementById("promote-username").placeholder = "Username"
                                            options = {
                                                table_name: 'users',
                                                username: username_to_promote,
                                                what_to_update: 'role',
                                                new_val: 'scrum_master',
                                            }
                                            const queryParams = Object.keys(options)
                                                .map(key => `${key}=${encodeURIComponent(options[key])}`)
                                                .join('&');
                                        
                                            const url = `http://localhost:8081/server/update?${queryParams}`;
                                            fetch(url)
                                            
                                            document.getElementById("promote-username").value = null
                                            document.getElementById("promote-username").classList.remove("is-valid")
                                            updated = true
                                            alert("User promoted to Scrum Master")
                                        }
                                    }
                                    if (updated == false){
                                        document.getElementById("promote-username").classList.add("is-invalid")
                                        document.getElementById("promote-username").classList.remove("is-valid")
                                        document.getElementById("promote-username").value = ""
                                        document.getElementById("promote-username").placeholder = "Scrum Master can only promote users in their group"
                                    }

                                }

                            })
                            .catch((error) => {
                                // Handle errors here
                                console.error('Fetch error:', error);
                            });

                        }
            
                    })
                    .catch((error) => {
                        // Handle errors here
                        console.error('Fetch error:', error);
                    });

                
            }
        })



    
}