// Initialize an array to store information (name and email)
const info = [];


let groupAdded = false;
// Adds a already existing user into an existing group
// Author: Liam Chui
function newAddToGroup(){
    let group_name_user = document.getElementById('group_name').value
    let username_user = document.getElementById('user_name').value
    let first_name_user = document.getElementById('first_name').value
    let last_name_user = document.getElementById('last_name').value
    let email_user = document.getElementById('email').value
    let new_user = 'user'
    options_group = {
        table_name: 'groups',
        group_name: group_name_user,
    }
    options_user = {
        table_name: 'users',
        username: username_user,
    }
    options_member = {
        table_name: 'members',
        group_name: group_name_user,
        username: username_user,
        first_name: first_name_user,
        last_name: last_name_user,
        email: email_user,
        role: new_user,
    }

    options_role_check = {
        key: 'user_role',
    }

    options_member_check = {
        table_name: 'members',
        group_name: group_name_user,
        username: username_user,
    }

    const queryParams_rolecheck = Object.keys(options_role_check)
        .map(key => `${key}=${encodeURIComponent(options_role_check[key])}`)
        .join('&');

    const queryParams_membercheck = Object.keys(options_member_check)
    .map(key => `${key}=${encodeURIComponent(options_member_check[key])}`)
    .join('&');


    const queryParams_group = Object.keys(options_group)
        .map(key => `${key}=${encodeURIComponent(options_group[key])}`)
        .join('&');


    const queryParams_user = Object.keys(options_user)
    .map(key => `${key}=${encodeURIComponent(options_user[key])}`)
    .join('&');

    const queryParams_member = Object.keys(options_member)
    .map(key => `${key}=${encodeURIComponent(options_member[key])}`)
    .join('&');
    
    const url_group = `http://localhost:8081/server/return_group?${queryParams_group}`;
    
    const url_user =  `http://localhost:8081/server/return_user?${queryParams_user}`;

    const url_role_check = `http://localhost:8081/server/return_current?${queryParams_rolecheck}`;
    fetch(url_role_check)
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
            // Checking if current user is scrummaster
            if(data.value == 'scrum_master'){

            

                fetch(url_user)
                    .then((response) => {
                        // Handle the response here
                        if (response.ok) {
                            return response.json(); // Parse the JSON response
                        } else {
                            throw new Error('Network response was not ok');
                        }
                    })
                    // Checking user if exists
                    .then((data) => {
                        if (data == undefined) {
                            document.getElementById("user_name").classList.add("is-invalid")
                        } else if (data.username == username_user) {
                            // console.log("Valid User");

                            // Checking if group exists
                            fetch(url_group)
                                .then((response) => {
                                    // Handle the response here
                                    if (response.ok) {
                                        return response.json(); // Parse the JSON response
                                    } else {
                                        throw new Error('Network response was not ok');
                                    }
                                })
                                
                            // Checking if group exists
                                .then((data) => {
                                    if (data == undefined) {
                                        document.getElementById("group_name").classList.add("is-invalid")
                                    } else if(data.group_name == group_name_user){
                                        //Group exists then add user into member


                                        // Checks if they are a member of the group already
                                        const url_member_check = `http://localhost:8081/server/return_member?${queryParams_membercheck}`;

                                        fetch(url_member_check)
                                        .then((response) => {
                                            // Handle the response here
                                            if (response.ok) {
                                                return response.json(); // Parse the JSON response
                                            } else {
                                                throw new Error('Network response was not ok');
                                            }
                                        })
                                        .then((data) => {
                                            if(data == "NOT FOUND"){
                                                
                                                const url_member_add = `http://localhost:8081/server/add_member?${queryParams_member}`;
                                                fetch(url_member_add)
                                                .then((response) => {
                                                    // Handle the response here
                                                    if (response.ok) {
                                                        return response.json(); // Parse the JSON response
                                                    } else {
                                                        throw new Error('Network response was not ok');
                                                    }
                                                })
                                                .then((data) => {
                                                    if (data == "added") { 
                                                        console.log("Member was added")
                                                    }
                                                })
                                                .catch((error) => {
                                                    // Handle errors here
                                                    console.error('Fetch error:', error);
                                                });


                                            }else{
                                                console.log(data)
                                                alert('Member already in group')
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
                    .catch((error) => {
                        // Handle errors here
                        console.error('Fetch error:', error);
                    });
                }else{
                    alert('Not added')
                }
            })
            
            // End bracket
            }

// Display an existing group
// Author: Liam Chui
function newDisplayGroup(){
    let group_name_user = document.getElementById('group_name_display').value

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
            alert("Member/s were displayed")

            console.log(data)
            
            const groupsContainer = document.getElementById("groupContainer");
            const groupDiv = document.createElement("div");
            // Creates a html structure for each entry i.e the (name and email)
            // and converts all strings into one string to display.
            groupDiv.innerHTML = `<h3>Group: ${data[0].group_name}</h3>`;
            groupDiv.innerHTML += data.map((entry) => `
            <div class="info-entry">
            <p><strong>Name:</strong> ${entry.first_name} ${entry.last_name}</p>
            <p><strong>Email:</strong> ${entry.email}</p>
            <p><strong>Role:</strong> ${entry.role}</p>

                </div>
            `).join("");

            groupsContainer.appendChild(groupDiv);

        }

    })
    .catch((error) => {
        // Handle errors here
        console.error('Fetch error:', error);
    });
    

    }





// Creates a group and makes the creator the scrummaster
// Author: Liam Chui
function newCreateGroup(){
    let new_group_name_user = document.getElementById('new_group_name_to_make').value


    // Check if group exists already
    options_group = {
        table_name: 'groups',
        group_name: new_group_name_user,
    }



    const queryParams_group = Object.keys(options_group)
        .map(key => `${key}=${encodeURIComponent(options_group[key])}`)
        .join('&');

    const url_group_check = `http://localhost:8081/server/return_group?${queryParams_group}`;

    const url_group_make = `http://localhost:8081/server/add_group?${queryParams_group}`;


        fetch(url_group_check)
        .then((response) => {
            // Handle the response here
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        
    // Checking if group exists
        .then((data) => {
            if (data == "NOT FOUND") {
                
                // Make the group if not existed
                fetch(url_group_make)
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
                    
                    alert('Group was made.')

                    // Add the current user here to the group newly made as 'Scrum_master'                    


                    options_find_current_user = {
                        key: 'user',
                    }
                    
                    const successfulQueryParams = Object.keys(options_find_current_user)
                    .map(key => `${key}=${encodeURIComponent(options_find_current_user[key])}`)
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
                        if(data){
                            //find persons data using return_user
                            options_user = {
                                table_name: 'users',
                                username: data.value,
                            }

                            const QueryParams_finding_user = Object.keys(options_user)
                            .map(key => `${key}=${encodeURIComponent(options_user[key])}`)
                            .join('&');
            
                            const url_finding_user = `http://localhost:8081/server/return_user?${QueryParams_finding_user}`;

                            fetch(url_finding_user)
                            .then((response) => {
                                // Handle the response here
                                if (response.ok) {
                                    return response.json(); // Parse the JSON response
                                } else {
                                    throw new Error('Network response was not ok');
                                }
                            })
                            .then((data) => {
                                if(data){
                                
                                let new_role = 'scrum_master'
                                successfulOptions = {
                                    key: 'user_role',
                                    value: 'scrum_master',
                                }

                                const successfulQueryParams = Object.keys(successfulOptions)
                                .map(key => `${key}=${encodeURIComponent(successfulOptions[key])}`)
                                .join('&');
            
                                const successfulUrl = `http://localhost:8081/server/update_current_info?${successfulQueryParams}`;
                                
                                fetch(successfulUrl)

                                options_update_user_table = {
                                    table_name: 'users',
                                    username: data.username,
                                    what_to_update: 'role',
                                    new_val: 'scrum_master',
                                }

                                const QueryParams_update_user = Object.keys(options_update_user_table)
                                .map(key => `${key}=${encodeURIComponent(options_update_user_table[key])}`)
                                .join('&');
            
                                const url_update_user = `http://localhost:8081/server/update?${QueryParams_update_user}`;
                                
                                fetch(url_update_user)


                                console.log(data)
                                 options_add_scrum_master ={
                                        table_name: 'members',
                                        group_name: new_group_name_user,
                                        username: data.username,
                                        first_name: data.first_name,
                                        last_name: data.last_name,
                                        email: data.email,
                                        role: 'scrum_master',
                                }
                                const queryParams_adding_scrum_master = Object.keys(options_add_scrum_master)
                                    .map(key => `${key}=${encodeURIComponent(options_add_scrum_master[key])}`)
                                    .join('&');
                        
                                    const url_add_scrum_master = `http://localhost:8081/server/add_member?${queryParams_adding_scrum_master}`;
            
                                    fetch(url_add_scrum_master)
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
                                        alert('Scrum_master was added.')
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

            else{
                alert('Group name was already taken')
            }
        })

        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}


// Removes member in a group, but must be the scrum_master
// Author: Liam Chui
function newMemberRemoval(){
    let group_name_user = document.getElementById('group_name_to_remove').value
    let first_name_user = document.getElementById('first_name_to_remove').value
    let last_name_user = document.getElementById('last_name_to_remove').value

    

    options_member_check = {
        table_name: 'members',
        group_name: group_name_user,
        first_name: first_name_user,
        last_name: last_name_user,
    }

    options_member_delete ={
        table_name: 'members',
        first_name: first_name_user
    }

    options_role_check = {
        key: 'user_role',
    }

    const queryParams_rolecheck = Object.keys(options_role_check)
        .map(key => `${key}=${encodeURIComponent(options_role_check[key])}`)
        .join('&');

    const queryParams_member_delete = Object.keys(options_member_delete)
        .map(key => `${key}=${encodeURIComponent(options_member_delete[key])}`)
        .join('&');

    const url_member_delete = `http://localhost:8081/server/delete_member?${queryParams_member_delete}`;
    
    const url_role_check = `http://localhost:8081/server/return_current?${queryParams_rolecheck}`;

    // Delete part


    fetch(url_role_check)
        .then((response) => {
            // Handle the response here
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then((data) => {

            // change to check role
            if(data.value == 'scrum_master'){



                

                // deleting member here
                fetch(url_member_delete)
                    .then((response) => {
                        // Handle the response here
                        if (response.ok) {
                            return response.json(); // Parse the JSON response
                        } else {
                            throw new Error('Network response was not ok');
                        }
                    })
                    .then((data) => {
                        // Use the data from the response
                        console.log(data);
                        alert("Member was deleted")
                    })
                    .catch((error) => {
                        // Handle errors here
                        console.error('Fetch error:', error);
                    });
                }else{
                    alert('Cannot delete as user')
                }
        })
    }







// Old below

function addInfo() {
    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
        // Display a popup message or alert
        alert("Name and email must be provided.");
        return; // Exit the function to prevent further processing
    }

    if (/\d/.test(name)) {
        // Display a popup message or alert
        alert("Numbers are not allowed in the name.");
        return; // Exit the function to prevent further processing
    }

    if (name !== "" && email !== "") {
        const infoEntry = { name, email };
        info.push(infoEntry);
        nameInput.value = ""; // Clear the name input field
        emailInput.value = ""; // Clear the email input field
        updateInfoList();
    }
}

// Function to update the information list
// Author: Liam Chui
function updateInfoList() {
    const infoList = document.getElementById("infoList");
    // Updates the html ID 'infoList' 
    infoList.innerHTML = info.map((entry, index) => `
        <div class="info-entry">
            <p><strong>Name:</strong> ${entry.name}</p>
            <p><strong>Email:</strong> ${entry.email}</p>
            <p><strong>Role:</strong> ${entry.role}</p>

        </div>
    `).join("");
}

// Function to add all people to a group
// Author: Liam Chui
function addToGroup() {
    const groupNameInput = document.getElementById("groupNameInput");
    const groupName = groupNameInput.value.trim();

    if (!groupName) {
        // Display a popup message or alert
        alert("Group name is required.");
        return; // Exit the function to prevent further processing
    }
    if (groupAdded){
        alert("Group has already been made.")
        return;
    }
    if (groupName !== "") {
        // Create a new group with the provided name
        const group = { name: groupName, people: [...info] };

        // Add the group to the list of groups (if you want to track multiple groups)
        // groups.push(group);

        // Display the group (or save it for later)
        displayGroup(group);

        // Clear the group name input field
        groupNameInput.value = "";

        groupAdded = true;

    }
}

// Keep track of whether a group has been added




// Function to display a group
// Author: Liam Chui
function displayGroup(group) {
    const groupsContainer = document.getElementById("groupContainer");
    const groupDiv = document.createElement("div");
    // Creates a html structure for each entry i.e the (name and email)
    // and converts all strings into one string to display.
    groupDiv.innerHTML = `<h3>Group: ${group.name}</h3>`;
    groupDiv.innerHTML += group.people.map((entry) => `
        <div class="info-entry">
            <p><strong>Name:</strong> ${entry.name}</p>
            <p><strong>Email:</strong> ${entry.email}</p>
        </div>
    `).join("");

    // Create a "Display Group" button for the group
    const displayButton = document.createElement("button");
    displayButton.innerText = "Display Group";
    displayButton.addEventListener("click", () => displayGroupDetails(group));

    groupDiv.appendChild(displayButton);

    groupsContainer.appendChild(groupDiv);
}
// Function to display group details when the "Display Group" button is clicked
// Author: Liam Chui
function displayGroupDetails(group) {
    // You can customize how you want to display the group details
    alert(`Group: ${group.name}\n\n${group.people.map((entry) => `Name: ${entry.name}\nEmail: ${entry.email}`).join("\n\n")}`);
}


