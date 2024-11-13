const express = require("express")
const path = require("path")
const { getAllBoardItem, insertBoardItem, updateBoardItem, deleteBoardItem } = require("./board_items_database")
const {boardItem} = require("../models/board_items")
const { captureRejections } = require("stream")

const boardRouter = express.Router()
const VIEWS_PATH = path.join(path.dirname(__dirname),"/views/")

/** Temporary Representation of main database (will be connected in future implementation) */
let itemDB = getAllBoardItem()
itemDB = itemDB.map((ele)=> new boardItem(ele))
itemDB = itemDB.filter(ele=>ele.isSubTask == false)

/**  Object to represent the tables in the board (with respect to subtasks and supertasks) */
let DB = { "hasSubtasks": itemDB.filter( (ele)=> (ele.subtasks.length > 0)),
    "others": itemDB.filter( (ele)=> (ele.subtasks.length == 0))
}

// Convert the array of tasks into supertasks, subtasks table and non-subtasks table
DB = {"hasSubtasks": DB.hasSubtasks.map( (ele) => ({"supertask": ele, "table":convertListToTable(ele.subtasks) })),
    "others": convertListToTable(DB.others)
}

/** Converts List of boardItems into a table form of items */
function convertListToTable(arrayOfItems){
    return {
        "productBacklog": arrayOfItems.filter( (ele) => ele.location == "productBacklog"),
        "sprintBacklog": arrayOfItems.filter( (ele) => ele.location == "sprintBacklog"),
        "sprintToDo": arrayOfItems.filter( (ele) => ele.location == "sprintToDo"),
        "completed": arrayOfItems.filter( (ele) => ele.location == "completed"),
    }
}

/** Accesses the local db and extracts relevant info to get remaining effort for the days leading up to the latest completed item */
function burndownChartValues(){
    // Accumulation of estimates of all supertasks that aren't in product Backlog.
    let supertaskEstimates = DB.hasSubtasks.map( (obj) => obj.supertask )
        .filter((ele)=> (ele.location != "productBacklog"))
        .reduce( (acc,item)=> acc+item.estimate,0)
    
    // Accumulation of estimates of all subtasks that aren't in product Backlog.
    let subtaskEstimates = DB.hasSubtasks.map( (obj) => obj.table )
        .map( (table) => (Object.values(table)
            .map( (section) => section
                .filter( (item)=> item.location !="productBacklog")
                .reduce( (acc,ele)=> acc+ele.estimate,0) ))
            .reduce( (acc,ele)=> acc+ele,0))
        .reduce((acc,ele)=>acc+ele,0)

    // Accumulation of estimates of all tasks that aren't in product Backlog, aren't supertasks and don't contain subtasks.
    let otherEstimates = (Object.values(DB.others)
        .map( (section) => section
            .filter( (item) => item.location != "productBacklog")
            .reduce( (acc,ele)=> acc+ele.estimate,0) ))
    .reduce( (acc,ele)=> acc+ele,0)
    
    let totalEstimates = supertaskEstimates + subtaskEstimates + otherEstimates

    // Array of [Story Point Estimate, Day Of Completion from start of Sprint] for completed supertasks.
    let supertaskCompletion = DB.hasSubtasks.map( (obj)=> obj.supertask)
        .filter((ele)=> ele.dayOfCompletion>0)
        .map((item)=> [item.estimate,item.dayOfCompletion])

    // Array of [Story Point Estimate, Day Of Completion from start of Sprint] for completed subtasks.
    let subtaskCompletion = DB.hasSubtasks.map((obj) => obj.table)
        .map( (table) => table.completed
            .filter((obj)=>obj.dayOfCompletion>0)
            .map((obj)=> [obj.estimate,obj.dayOfCompletion] )
            .reduce( (acc,ele) => [...acc,ele],[]) )
        .reduce( (acc,ele) => [...acc,...ele],[])

    // Array of [Story Point Estimate, Day Of Completion from start of Sprint] for completed tasks that aren't supertasks and don't contain subtasks.
    let otherCompletion = DB.others.completed.map( (item) => [item.estimate,item.dayOfCompletion])

    let allCompletion = [...subtaskCompletion,...supertaskCompletion,...otherCompletion]

    let largestDay = allCompletion.map( (arr)=> arr[1]).reduce((acc,ele)=> (ele>acc)?ele:acc,-1000)
    
    if (largestDay <= 0){
        // When no tasks is completed (i.e. largestDay <= 0), return only day 0 values (no completed tasks)
        return [totalEstimates]
    } else {
        // When some task is completed, return an array where number of entries is up until the most recently completed tasks (starting from day 0)
        // The values of the array represents the number of effort remaining on that day(index) .
        let ret = []
        for (let i = 0; i <= largestDay; i++){
            let value = totalEstimates - allCompletion.filter((arr)=> arr[1] <= i).reduce( (acc,ele)=> acc+ele[0],0)
            ret.push(value)
        }
        return ret
    }
}

/** Determines relative order between boardItem objects */
function orderFunc(itemA,itemB){
    const order = ["Highest","High","Medium","Low","Lowest"]
    let intA = order.indexOf(itemA.priority)
    let intB = order.indexOf(itemB.priority)
    return intA - intB
}

/** Sorts the list of items within a section by their priority (in-place) */
function orderTableByPriority(table){
    // Accesses all board sections and sort them using a defined function
    Object.keys(table).map((section) => table[section].sort(orderFunc))
}

/** Sorts the supertasks portion of DB by their priority (in-place) */
function orderSupertaskByPriority(arr){
    // Accesses all tables and orders them based on the supertask
    arr.sort( (itemA,itemB)=> orderFunc(itemA.supertask,itemB.supertask))
}

/** Displays the board when the pathname http://localhost:8080/board is accessed */
boardRouter.get("/board", async function(req,res){
    DB.hasSubtasks.forEach((entry)=> orderTableByPriority(entry.table))
    orderTableByPriority(DB.others)
    orderSupertaskByPriority(DB.hasSubtasks)

    // Adds a subtaskTable property to each table in DB
    let arrOfTables = []
    DB.hasSubtasks.forEach( (ele) => arrOfTables.push({...ele, "subtaskTable": true}))
    arrOfTables.push({...DB.others, "subtaskTable": false})

    // true or false scrum master perms
    let currentUserPerms = true
    let groupmateList = ['Unassigned']
    
    // Fetch role of current user
    const url_currentRole = `http://localhost:8081/server/return_current?key=user_role`
    fetch(url_currentRole)
        .then( (response) =>{
            if (response.ok) { return response.json();
            } else { console.error("Current User can't be found")}
        })
        .then((currentRole)=>{
            if (currentRole.value == "scrum_master"){ currentUserPerms = true
            } else { currentUserPerms = false   }

            // Fetch username of current user
            const url_currentUsername = `http://localhost:8081/server/return_current?key=user`;
            fetch(url_currentUsername)
            .then((response) => {
                if (response.ok) { return response.json(); 
                } else { console.error("Current User can't be found")}
            })
            .then((currentUsername) => {
                if (currentUsername.value == 'null'){
                    res.render(VIEWS_PATH + "board.html", {record: arrOfTables, isScrumMaster: currentUserPerms, teamList: groupmateList})
                } 

                // Fetch user data object using username
                const url_user = `http://localhost:8081/server/return_user?table_name=users&username=${currentUsername.value}`
                fetch(url_user)
                    .then((response) => {
                        if (response.ok) {return response.json(); 
                        } else { res.render(VIEWS_PATH + "board.html", {record: arrOfTables, isScrumMaster: currentUserPerms, teamList: groupmateList}) }
                    })
                    .then((currentUserData) => {
                        console.log("currentUserData", currentUserData)
                        groupmateList.push(`${currentUserData.first_name} ${currentUserData.last_name}`)

                        // fetch member data object using first_name and last_name from user data object
                        const url_member = `http://localhost:8081/server/find_current_group_members?first_name=${currentUserData.first_name}&last_name=${currentUserData.last_name}`
                        fetch(url_member)
                            .then((response) => {
                                if (response.ok) { return response.json(); }
                                else { 
                                    console.log("Not in a team yet")
                                    
                                    res.render(VIEWS_PATH + "board.html", {record: arrOfTables, isScrumMaster: currentUserPerms, teamList: groupmateList})
                                }
                            })
                            .then((currentMemberData)=> {
                                console.log("currentMemberData", currentMemberData)

                                // fetch all team members using group_name in member data object
                                const url_team = `http://localhost:8081/server/display_member?group_name=${currentMemberData.group_name}`
                                fetch(url_team)
                                    .then((response)=>{
                                        if (response.ok) {return response.json();
                                        } else { 
                                            console.log("Not in a team yet")
                                            res.render(VIEWS_PATH + "board.html", {record: arrOfTables, isScrumMaster: currentUserPerms, teamList: groupmateList})
                                        }
                                    })
                                    .then((currentTeam)=> {
                                        console.log("currentTeam", currentTeam)
                                        for (const person of currentTeam){
                                            if (person.first_name != currentMemberData.first_name && person.last_name != currentMemberData.last_name){
                                                groupmateList.push(`${person.first_name} ${person.last_name}`)
                                            }
                                        }
                                        res.render(VIEWS_PATH + "board.html", {record: arrOfTables, isScrumMaster: currentUserPerms, teamList: groupmateList})
                                    })
                                    .catch((error) => {
                                        console.error('Fetch error:', error);
                                    });
                            })
                            .catch((error) => {
                                console.error('Fetch error:', error);
                            });
                    })
                    .catch((error) => {
                        console.error('Fetch error:', error);
                    });
            })
            .catch((error) => {
                console.error('Fetch error:', error);
        });
    })
        
})

/** Handles moving of items between boards */
boardRouter.get("/move", function(req,res){
    // Extracts data from the query and body of the request and instantiates new variables
    var from = String(req.query.from),
        to = String(req.query.to),
        i = req.query.innerIndex,
        j = req.query.outerIndex,
        item,
        completionDate = (from== "sprintToDo" && to == "completed")
            ? Number(req.query.completionDay)
            : -10

    // Different ways to get and insert items from DB for when data is a subtask and for when data doesn't contain subtask hence isnt a supertask
    if (j){
        item = DB["hasSubtasks"][j]["table"][from].splice(i,1)
        item[0].dayOfCompletion = completionDate
        item[0].location = to
        DB["hasSubtasks"][j]["table"][to].push(...item)
    } else {
        item = DB["others"][from].splice(i,1)
        item[0].dayOfCompletion = completionDate
        item[0].location = to
        DB["others"][to].push(...item)
    }

    updateBoardItem({'location': item[0].location},{'id':item[0].id})

    res.redirect("/board") 
})

/** Adds a new item into a section of the board */
boardRouter.post("/add", function(req,res){
    // Extracts data from the query of the request and instantiates a new item
    var to = String(req.query.to),
        i = req.query.innerIndex,
        j = req.query.outerIndex,
        item = new boardItem({title: String(req.body.descriptionForm), priority: req.body.priority, location: to, estimate: req.body.estimate, assignee: req.body.assignee}) ;

    // Sets dayOfCompletion attribute to the new item if required
    if (to == "completed"){
        let completionDay = Number(req.body.completionDay)
        item.dayOfCompletion = completionDay
    }

    // Different ways to insert item into the DB for when data is a subtask and for when data doesn't contain subtask & isn't a supertask
    if (j){
        item.isSubTask = true
        // IMPLEMENT THE add id number to supertask NEED TO IMPLEMENT ADD SIMPLE TASK FIRST
        let supertask = DB["hasSubtasks"][j]["supertask"]
        supertask.subtasks.push(item)
        let newSubTask = supertask.formatForDB().subtasks

        updateBoardItem({'subtasks': newSubTask},{'id': supertask.id})
        DB["hasSubtasks"][j]["table"][to].push(item)
    } else {
        item.isSubtask = false
        DB["others"][to].push(item)
    }
    
    insertBoardItem(item.formatForDB())

    res.redirect("/board")
})

/** Change the priority of an item when change occurs */
boardRouter.post("/changeItem", function(req,res){
    // Extracts data from the body of the request and instanties new variables
    var i = req.body.innerIndex,
        j = req.body.outerIndex,
        from = String(req.body.from),
        item,
        { priority, estimate, assignee, description } = req.body ;

    // Accesses items uniquely based on what the task is (subtask,non-supertask & has no subtask). 
    if (j){
        item = DB["hasSubtasks"][j]["table"][from][i]
    } else {
        item = DB["others"][from][i]
    }

    // Sets the attribute of the boardItem object if a change exist.
    if (priority){
        item.priority = priority }
    if (estimate){
        item.estimate = Number(estimate) }
    if (assignee){
        item.assignee = assignee }
    if (description){
        item.title = description }

    // Replaces item based on what the task is (subtask,non-supertask & has no subtask). 
    if (j){
        DB["hasSubtasks"][j]["table"][from][i] = item
    } else {
        DB["others"][from][i] = item 
    }

    updateBoardItem({'title':item.title, 'assignee': item.assignee, 'estimate': item.estimate, 'priority': item.priority},{'id': item.id})

    res.redirect("/board")
})

/** Change the priority of a super task that has subtasks */
boardRouter.post("/updateSupertask", function(req,res){
    var j = req.body.outerIndex,
        item = DB["hasSubtasks"][j]["supertask"],
        { priority, estimate, assignee, description, location} = req.body ;

    // Changes the location attribute if location change exists
    if (location){
        item.location = location }
    // Changes the dayOfCompletion attribute as well if going into completed state or out of completed state
    if (location == "completed"){
        let completionDay = req.body.completionDay
        if (completionDay){
            item.dayOfCompletion = Number(completionDay)
        }
    } else {
        item.dayOfCompletion = -10
    }
    // Changes the remaining attributes if attribute change exists
    if (priority){
        item.priority = priority }
    if (estimate){
        item.estimate = Number(estimate) }
    if (assignee){
        item.assignee = assignee }
    if (description){
        item.title = description }

    updateBoardItem({'title':item.title, 'assignee': item.assignee, 'estimate': item.estimate, 'location': item.location,'priority': item.priority, 'dayOfCompletion': item.dayOfCompletion},{'id': item.id})
    res.redirect("/board")
})

/** Handles deletion of an item from the database */
boardRouter.get("/remove", function(req,res){
    var from = req.query.from,
        i = req.query.innerIndex,
        j = req.query.outerIndex,
        deletedItem, item;

    // Deletes item uniquely based on the situation of the item.
    if (j){
        deletedItem = DB["hasSubtasks"][j]["table"][from].splice(i,1)[0]

        // Demotes supertask to other task if no more subtasks exist
        let numberOfSubtasks = Object.values(DB["hasSubtasks"][j]["table"]).reduce( (acc,ele)=> acc+ele.length,0)
        if (numberOfSubtasks == 0){
            item = DB["hasSubtasks"].splice(j,1)[0].supertask
            DB["others"][item.location].push(item)
        } else if(numberOfSubtasks > 0){
            
        }
    } else {
        deletedItem = DB["others"][from].splice(i,1)[0]
    }

    deleteBoardItem({'id': deletedItem.id})

    res.redirect("/board")
})

/** Add the first subtask to a supertask */
boardRouter.post("/addSubtask", function(req,res){
    var from = String(req.query.from),
        to = "productBacklog",
        i = req.query.innerIndex,
        supertask = DB["others"][from].splice(i,1)[0],
        newSubtask = new boardItem( {title: String(req.body.descriptionForm), priority: req.body.priority, location: to, estimate: req.body.estimate,isSubTask: "true", assignee: req.body.assignee}) ;
    
    // Adds subtasks to the item and convert it into a supertask table
    supertask.subtasks = [newSubtask]
    DB["hasSubtasks"].push({"supertask": supertask,
        "table": convertListToTable(supertask.subtasks)
    })

    let newSubTask = supertask.formatForDB().subtasks

    insertBoardItem(newSubtask.formatForDB())
    updateBoardItem({'subtasks': newSubTask},{'id': supertask.id})

    res.redirect("/board")
})

/** Handles the removal of supertask */
boardRouter.get("/removeSupertask", function(req,res){
    var j = req.query.outerIndex

    let supertask = DB["hasSubtasks"].splice(j,1)[0].supertask

    deleteBoardItem({'id': supertask.id})

    let subtaskID = supertask.subtasks.map(subtask=>subtask.id)
    for (const id of subtaskID){
        deleteBoardItem({'id': id})
    }

    res.redirect("/board")
})

module.exports = {boardRouter, burndownChartValues}