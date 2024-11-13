const express = require('express');
const path = require('path');
const PORT_NUMBER = 8081;
const { queryBoardItem } = require('./controllers/board_items_database')
const app = express();
app.use(express.static("node_modules/bootstrap/dist/css"));

// Setup the view Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('images'));
app.use('/controllers', express.static('controllers'));

app.use(express.json());


const sqlite3 = require('sqlite3').verbose();
let sql;

const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

let tables_to_create = ['users']
for (const item of tables_to_create){
    sql = `CREATE TABLE IF NOT EXISTS ${item}(username , first_name, last_name,password, email, role, group_name)`;
    db.run(sql);
}

let tables_to_create_group = ['groups']
for (const item of tables_to_create_group){
    sql = `CREATE TABLE IF NOT EXISTS ${item}(group_name)`;
    db.run(sql);
}

tables_to_create = ['current_info']
for (const item of tables_to_create){
    sql = `CREATE TABLE IF NOT EXISTS ${item}(key, value)`;
    db.run(sql);
}


let tables_to_create_members = ['members']
for (const item of tables_to_create_members){
    sql = `CREATE TABLE IF NOT EXISTS ${item}(group_name, username, first_name, last_name, email, role, 
        FOREIGN KEY (group_name) REFERENCES groups(group_name),
        FOREIGN KEY (username) REFERENCES users(username),        
        FOREIGN KEY (first_name) REFERENCES users(first_name),
        FOREIGN KEY (last_name) REFERENCES users(last_name),
        FOREIGN KEY (email) REFERENCES users(email),
        FOREIGN KEY (role) REFERENCES users(role))`;
    db.run(sql);
}





function insert_database( table, username, first_name, last_name, email, password, role){
    sql = `INSERT INTO ${table}(username, first_name, last_name, password, email, role, group_name) VALUES(?,?,?,?,?,?,?)`;
    db.run(sql, [username, first_name, last_name, password, email, role,"None"], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
}

function update_database(table,username,what_to_update, new_value){
    sql = `UPDATE ${table} SET ${what_to_update} = ? WHERE username = ?`;
    db.run(sql, [new_value, username], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
}
function delete_database(table,username){
    sql = `DELETE FROM ${table} WHERE username = ?`;
    db.run(sql, [username], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
}
function return_user(table,username) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ${table} WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) {
                console.log(err.message);
                resolve("NOT FOUND"); // Reject the promise if there's an error
            } else {
                resolve(row); // Resolve the promise with the result if successful
            }
        });
    });
}

function getAllDataFromDatabase() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users`;
        let all_data = [];

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                rows.forEach((row) => {
                    all_data.push(row);
                });
                resolve(all_data);
            }
        });
    });
}

//Group and Member functions
// Change all member related functions with roles now

function insert_group(table, group_name){
    sql = `INSERT INTO ${table}(group_name) VALUES(?)`;
    db.run(sql, [group_name], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
    
}

function return_group(table, group_name){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ${table} WHERE group_name = ?`;
        db.get(sql, [group_name], (err, row) => {
            if (err) {
                console.log(err.message);
                resolve("NOT FOUND"); // Reject the promise if there's an error
            } else {
                resolve(row); // Resolve the promise with the result if successful
            }
        });
    });
}


function getAllDataFromDatabase() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users`;
        let all_data = [];

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                rows.forEach((row) => {
                    all_data.push(row);
                });
                resolve(all_data);
            }
        });
    });
}


function insert_member(table, group_name, username,first_name, last_name, email, role){
    sql = `INSERT INTO ${table}(group_name, username, first_name, last_name, email, role) VALUES(?,?,?,?,?,?)`;
    db.run(sql, [group_name, username, first_name, last_name, email, role], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
    update_database("users",username,"group_name",group_name);
}

function delete_member(table,first_name){
    sql = `DELETE FROM ${table} WHERE first_name = ?`;
    db.run(sql, [first_name], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
}

async function displayMembersofAllGroups(groupName) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM members WHERE group_name = ?`;
        let all_data = [];

        db.all(sql, [groupName], (err, rows) => {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                rows.forEach((row) => {
                   
                    all_data.push(row);

                });
                resolve(all_data);
            }
        });
    });
}

function return_member(table, group_name, username) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ${table} WHERE group_name = ? AND username = ?`;
        db.get(sql, [group_name, username], (err, row) => {
            if (err) {
                console.log(err.message);
                resolve("NOT FOUND"); // Reject the promise if there's an error
            } else {
                resolve(row); // Resolve the promise with the result if successful
            }
        });
    });







}// current user / theme function
function insert_current_info(key, value){
    sql = `INSERT INTO 'current_info'(key, value) VALUES(?,?)`;
    db.run(sql, [key, value], (err) => {
        if (err) {
            console.log(err.message);
        }
    });
}

async function update_current_info(key, value){
    isFound = await return_current_info(key);
    if (isFound == undefined) {
        insert_current_info(key, value);
    } else {
        sql = `UPDATE 'current_info' SET value = ? WHERE key = ?`;
        db.run(sql, [value, key], (err) => {
            if (err) {
                console.log(err.message);
            }
        });
    }
}
async function return_current_info(key) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM 'current_info' WHERE key = ?`;
        db.get(sql, [key], (err, row) => {
            if (err) {
                console.log(err.message);
                resolve("NOT FOUND"); // Reject the promise if there's an error
            } else {
                resolve(row); // Resolve the promise with the result if successful
            }
        });
    });
}



app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    next();
});

app.get('/server/add', (req, res) => {
    const { table_name, username, first_name, last_name, email, password , role} = req.query;
    console.log("ADDING")
    console.log(table_name, username, first_name, last_name, email, password)
    insert_database(table_name, username, first_name, last_name, email,password, role);
    const responseData = "added";
    res.json(responseData);
})

app.get('/server/update', (req, res) => {
    const { table_name, username, what_to_update, new_val } = req.query;
    update_database(table_name, username, what_to_update, new_val);
    const responseData = "updated";
    res.json(responseData);
})
app.get('/server/delete', (req, res) => {
    const { table_name, username} = req.query;
    delete_database(table_name, username);
    const responseData = "deleted";
    res.json(responseData);
})
app.get('/server/return_user', async (req, res) => {
    const { table_name, username} = req.query;
    try {
        const allData = await return_user(table_name, username);
        
        if (allData == undefined){
            console.log("NOT FOUND")
            res.json("NOT FOUND")
        }
        else{res.json(allData);}
        
    } catch (error) {
        console.log("HAGHJSd")
        console.error('Error:', error.message);
    }
});
app.get('/server/return_all', async (req, res) => {

    try {
        const allData = await getAllDataFromDatabase();
        res.json(allData);
    } catch (error) {
        console.error('Error:', error.message);
    }
});

// App gets for group making

app.get('/server/add_group', (req, res) => {
    const { table_name, group_name} = req.query;
    insert_group(table_name,group_name);
    const responseData = "added_group";
    res.json(responseData);
})


app.get('/server/return_group', async (req, res) => {
    const { table_name, group_name} = req.query;
    try {
        const allData = await return_group(table_name, group_name);
        if (allData == undefined){
            res.json("NOT FOUND")
        }
        res.json(allData);
    } catch (error) {
        console.error('Error:', error.message);
    }
});

app.get('/server/add_member', (req, res) => {
    const { table_name, group_name, username, first_name, last_name, email, role} = req.query;
    insert_member(table_name, group_name, username,first_name, last_name, email, role);
    const responseData = "added";
    res.json(responseData);
});



app.get('/server/delete_member', (req, res) => {
    const { table_name, first_name} = req.query;
    delete_member(table_name, first_name);
    const responseData = "deleted";
    res.json(responseData);
});

app.get('/server/display_member', async (req, res) => {
    const {group_name} = req.query;
    const all_data = await displayMembersofAllGroups(group_name);
    if (all_data == undefined){
        res.json("NOT FOUND")
    }
    const responseData = "display";
    
    res.json(all_data);
});

app.get('/server/return_member', async (req, res) => {
    const { table_name, group_name, username} = req.query;
    try {
        const allData = await return_member(table_name, group_name, username);
        if (allData == undefined){
            res.json("NOT FOUND")
        }
        res.json(allData);
    } catch (error) {
        console.error('Error:', error.message);
    }
});

// for theme and current user
app.get('/server/return_current', async (req, res) => {
    const { key } = req.query;

    try {
        const allData = await return_current_info(key);
        if (allData == undefined){
            res.json("NOT FOUND")
        }
        res.json(allData);
    } catch (error) {
        console.error('Error:', error.message);
    }
});
app.get('/server/add_current_info', (req, res) => {
    const { key, value } = req.query;
    insert_current_info(key, value);
    const responseData = "added";
    res.json(responseData);
})

app.get('/server/update_current_info', (req, res) => {
    const { key, value } = req.query;
    update_current_info(key, value);
    const responseData = "updated";
    res.json(responseData);
})


//For finding group of a person
app.get('/server/find_current_group_members', async (req,res) => {
    const {first_name, last_name} = req.query
    try {
        let foundMember = await findCurrentGroupMember(first_name, last_name);

        if (foundMember == undefined){
            res.json("Current User Can't Be Found.")
        }
        res.json(foundMember)
    } catch (error) {   
        res.status(400).json({'Error': error.message});
    }
})

function findCurrentGroupMember(first_name, last_name){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM members WHERE first_name = '${first_name}' AND last_name = '${last_name}'`;
        db.get(sql, [], (err, row) => {
            if (err) {
                console.error(err.message);
                resolve("NOT FOUND"); // Reject the promise if there's an error
            } else {
                resolve(row); // Resolve the promise with the result if successful
            }
        });
    });
}

app.get('/server/queryboarditem', (req,res) => {
    const { assignee } = req.query
    try {
        let items = queryBoardItem(`SELECT * FROM boarditem WHERE assignee='${assignee}'`)
        console.log(items)
        if (items == undefined){
            res.status(200).json({})
        } else {
            res.json(items)
        }
    } catch (err){
        res.status(400).json({'Error': err.message})
    }
})

app.get('/server/queryboarditem', (req,res) => {
    const { assignee } = req.query
    try {
        let items = queryBoardItem(`SELECT * FROM boarditem WHERE assignee='${assignee}'`)
        if (items == undefined){
            res.status(200).json({})
        } else {
            res.json(items)
        }
    } catch (err){
        res.status(400).json({'Error': err.message})
    }
})


app.listen(PORT_NUMBER, function () {
    console.log(`listening on port number http://localhost:${PORT_NUMBER}`);
});


