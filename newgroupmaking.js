const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./group_manager.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
    
    console.log("connection successful")
});



// db.run(
//     'CREATE TABLE groups(group_name, group_id)'
//     );


// db.run(sql,['TestGroup', 1], );


function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS groups (
            group_id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            group_name TEXT NOT NULL,
            person_name TEXT NOT NULL,
            person_email TEXT
        )
    `);
}

// Function to initialize groups
function initializeGroups() {
    const groupNames = ["Team A"];

    const insertGroupQuery = "INSERT INTO groups (group_name) VALUES (?)";

    groupNames.forEach((groupName) => {
        db.run(insertGroupQuery, [groupName], (err) => {
            if (err) {
                console.error("Error initializing group:", err);
            } else {
                console.log(`Group "${groupName}" initialized.`);
            }
        });
    });
}


function addPersonToGroup(groupName, personName, personEmail){
    const insertPersonQuery = "INSERT INTO members (group_name, person_name, person_email) VALUES (?, ?, ?)";

    db.run(insertPersonQuery, [groupName, personName ,personEmail],
        (err) => {
            if (err) {
                console.error("Error adding person to group:", err);
            } else {
                console.log("Person added to the group.");
                // Refresh the group display here
                // displayGroup(groupName);
            }
        });
    }

function removePersonFromGroup(groupName, personName) {
    const deletePersonQuery = "DELETE FROM members WHERE group_name = ? AND person_name = ?";

    db.run(deletePersonQuery, [groupName, personName], (err) => {
        if (err) {
            console.error("Error removing person from group:", err);
        } else {
            console.log("Person removed from the group.");
            // Refresh the group display here
            displayGroup(groupName);
        }
    });
}

function displayGroup(groupName) {
    const selectMembersQuery = "SELECT person_name, person_email FROM members WHERE group_name = ?";

    db.all(selectMembersQuery, [groupName], (err, memberRows) => {
        if (err) {
            console.error("Error retrieving members:", err);
            return;
        }

        console.log(`Members of Group "${groupName}":`);
        memberRows.forEach((row) => {
            console.log(`Name: ${row.person_name}, Email: ${row.person_email || "N/A"}`);
        });
    });
}



// // Initialize database tables
createTables();

// // Initialize groups
// initializeGroups();


// addPersonToGroup("Team A", 'Liam','TestEmail');
// removePersonFromGroup("Team A", 'Liam')
// displayGroup('Team A')
// displayAllGroups()


// Function to retrieve and display all groups from the database
function displayAllGroups() {
    const selectGroupsQuery = "SELECT group_name FROM groups";

    db.all(selectGroupsQuery, (err, groupRows) => {
        if (err) {
            console.error("Error retrieving groups:", err);
            return;
        }

        if (groupRows.length === 0) {
            console.log("No groups found.");
        } else {
            console.log("Groups:");
            groupRows.forEach((row) => {
                console.log(`- ${row.group_name}`);
            });
        }
    });
}


db.close((err) => {
    if (err) return console.error(err,message);
});






