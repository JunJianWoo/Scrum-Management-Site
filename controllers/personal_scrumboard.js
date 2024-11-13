// Author: Connor Macdougall

let current_board_data = null

// refreshes personal scrumboard on command
async function refreshBoard() {
    clearBoard();
    await getAssignee();
    fillBoard();
}

function clearBoard() {
    document.getElementById("scrumboard-container").innerHTML = "";
}

// returns the current user in the form of the assignee attribute for the backlog database
async function getAssignee() {
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
                console.log("No user is currently logged in on the database");
            } else {
                options = {
                    table_name: 'users',
                    username: data.value,
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
                            console.log("Error: Current user is not the database")
                        } else {
                            getBoardData(`${data.first_name} ${data.last_name}`);
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

// Example output of a story in HTML with no subtasks
/* <div class="card" style="width: 35rem; margin: 2rem;">
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Priority: </li>
        <li class="list-group-item">Estimate: </li>
        <li class="list-group-item">Day of Completion: </li>
      </ul>
    </div> */

// updates the current board data
async function getBoardData(assignee) {
    options = {
        assignee: assignee,
    }
    const queryParams = Object.keys(options)
        .map(key => `${key}=${encodeURIComponent(options[key])}`)
        .join('&');
    const url = `http://localhost:8081/server/queryboarditem?${queryParams}`;
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
                console.log("No user is currently logged in on the database");
            } else {
                current_board_data = data
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Fetch error:', error);
        });
}

// fills the board with the current board data
function fillBoard() {
    if (current_board_data == null) {
        return null
    }

    let SUBTASK_MARGIN = 2;
    let SUBTASK_WIDTH = 16;

    let stories_list = current_board_data

    const scrumboard = document.getElementById("scrumboard-container");
    let no_subtasks = true;
    for (story of stories_list) {
        if (story.isSubTask === 'false') {
            no_subtasks = false

            // Creating parent container
            let story_container = document.createElement("div");
            let story_container_width;
            let idList = story.subtasks.slice(1,-1).split(",");
            idList = idList.map(ele=>Number(ele));
            story_container_width = Math.min((idList.length) * (SUBTASK_WIDTH + SUBTASK_MARGIN/2) + SUBTASK_WIDTH + SUBTASK_MARGIN, 90);
            story_container.className = "card";
            story_container.style.width = `${story_container_width}rem`;
            story_container.style.margin = `${SUBTASK_MARGIN}rem`;
            story_container.style.height

            // Creating title and its container
            let story_title_container = document.createElement("div");
            story_title_container.className = "card-body";
            let story_title = document.createElement("h5");
            story_title.className = "card-title";
            story_title.innerHTML = story.title;
            story_title_container.appendChild(story_title);
            story_container.appendChild(story_title_container);

            // Creating details and its container
            let details = document.createElement("ul");
            details.className = "list-group list-group-flush";
            let priority = document.createElement("li");
            priority.className = "list-group-item";
            priority.innerHTML = `Priority: ${story.priority}`;
            details.appendChild(priority);
            let estimate = document.createElement("li");
            estimate.className = "list-group-item";
            estimate.innerHTML = `Estimate: ${story.estimate}`;
            details.appendChild(estimate);
            let completion_day = document.createElement("li");
            completion_day.className = "list-group-item";
            if (story.dayOfCompletion < 0) {
                completion_day.innerHTML = 'Day of Completion: Not Yet Completed';
            } else {
                completion_day.innerHTML = `Day of Completion: ${story.dayOfCompletion}`;
            }
            details.appendChild(completion_day);
            story_container.appendChild(details);

            // Creating subtasks if applicable
            if (idList.length > 0) {
                // Creating parent container
                let subtasks_container = document.createElement("div");
                subtasks_container.className = "card-body";
                subtasks_container.style.display = "flex";
                subtasks_container.style.justifyContent = "space-between";
                subtasks_container.style.flexWrap = "wrap";
                let subtask_container;
                for (id of idList) {
                    for (inner_story of stories_list) {
                        if (Number(inner_story.id) == id) {
                            // Creating subtask container
                            let subtask_container = document.createElement("div");
                            subtask_container.className = "card"
                            subtask_container.style.width = `${SUBTASK_WIDTH}rem`;

                            // creating subtask title and its container
                            let subtask_title_container = document.createElement("div");
                            subtask_title_container.className = "card-body"
                            let subtask_title = document.createElement("h5");
                            subtask_title.className = "card-title";
                            subtask_title.innerHTML = inner_story.title;
                            subtask_title_container.appendChild(subtask_title);
                            subtask_container.appendChild(subtask_title_container);

                            // creating subtask details and its container
                            let subtask_details = document.createElement("ul");
                            subtask_details.className = "list-group list-group-flush";
                            let subtask_priority = document.createElement("li");
                            subtask_priority.className = "list-group-item";
                            subtask_priority.innerHTML = `Priority: ${inner_story.priority}`;
                            subtask_details.appendChild(subtask_priority);
                            let subtask_estimate = document.createElement("li");
                            subtask_estimate.className = "list-group-item";
                            subtask_estimate.innerHTML = `Estimate: ${inner_story.estimate}`;
                            subtask_details.appendChild(subtask_estimate);
                            let subtask_completion_day = document.createElement("li");
                            subtask_completion_day.className = "list-group-item";
                            if (inner_story.dayOfCompletion < 0) {
                                subtask_completion_day.innerHTML = 'Day of Completion: Not Yet Completed';
                            } else {
                                subtask_completion_day.innerHTML = `Day of Completion: ${inner_story.dayOfCompletion}`;
                            }
                            subtask_details.appendChild(subtask_completion_day);
                            subtask_container.appendChild(subtask_details);
                            subtasks_container.appendChild(subtask_container);
                        }
                    }
                }
                story_container.appendChild(subtasks_container);
            }

            // appending parent container to the actual DOM
            scrumboard.appendChild(story_container);
        }
    }
    if (no_subtasks) {
        let story_container = document.createElement("div");
        let story_container_width;
        story_container_width = Math.min((SUBTASK_WIDTH) + SUBTASK_MARGIN, 90);
        story_container.className = "card";
        story_container.style.width = `${story_container_width}rem`;
        story_container.style.margin = `${SUBTASK_MARGIN}rem`;
        story_container.style.height
        let story_title_container = document.createElement("div");
        story_title_container.className = "card-body";
        let story_title = document.createElement("h5");
        story_title.className = "card-title";
        story_title.innerHTML = "No assigned tasks";
        story_title_container.appendChild(story_title);
        story_container.appendChild(story_title_container);
        scrumboard.appendChild(story_container);
    }
}

// Example output of the subtask container in HTML
/* <div class="card-body" style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div class="card" style="width: 16rem;">
          <div class="card-body">
            <h5 class="card-title">Card title</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Priority: </li>
            <li class="list-group-item">Estimate: </li>
            <li class="list-group-item">Day of Completion: </li>
          </ul>
        </div>
        <div class="card" style="width: 16rem;">
          <div class="card-body">
            <h5 class="card-title">Card title</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Priority: </li>
            <li class="list-group-item">Estimate: </li>
            <li class="list-group-item">Day of Completion: </li>
          </ul>
        </div>
      </div> */

refreshBoard();